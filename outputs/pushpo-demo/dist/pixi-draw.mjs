// A deliberately small drawing vocabulary for the established scene art.
// Every live command becomes a pooled Pixi Sprite, Graphics or Text.
// Canvas 2D is used only for startup texture baking and label measurement.
export function multiplyAffine(m,a,b,c,d,tx,ty){
 const [ma,mb,mc,md,mx,my]=m;
 m[0]=ma*a+mc*b;m[1]=mb*a+md*b;m[2]=ma*c+mc*d;m[3]=mb*c+md*d;
 m[4]=ma*tx+mc*ty+mx;m[5]=mb*tx+md*ty+my;
 return m;
}
export function rendererSize(width,height,dpr=1){
 return {width:Math.max(1,width),height:Math.max(1,height),dpr:Math.min(Math.max(dpr,1),2),scale:Math.max(.78,Math.min(1.2,width/1150))};
}
const DRAW_STATE=['globalAlpha','fillStyle','strokeStyle','lineWidth','lineCap','font','textAlign','filter','shadowColor','shadowBlur'];
export class PixiDraw{
 constructor(PIXI){
  this.P=PIXI;this.matrix=[1,0,0,1,0,0];this.stack=[];this.stackIndex=0;this.path=[];this.pathIndex=0;
  this.pools={};this.layers={};this.sequence=0;this.pixelRatio=1;this.images=new Map();this.gradients=new Map();this.styles=new Map();
  this.measure=document.createElement('canvas').getContext('2d');
  this.globalAlpha=1;this.fillStyle='#000';this.strokeStyle='#000';this.lineWidth=1;this.lineCap='butt';
  this.font='10px sans-serif';this.textAlign='left';this.filter='none';this.shadowColor='transparent';this.shadowBlur=0;
  this.bright=new PIXI.ColorMatrixFilter();this.bright.brightness(1.6,false);this.brightFilters=[this.bright];
  this.transformMatrix=new PIXI.Matrix();
 }
 attach(stage){
  for(const name of ['ground','world','lighting','effects','guidance']){
   const layer=new this.P.Container({label:name,sortableChildren:true,eventMode:'none'});
   stage.addChild(layer);this.layers[name]=layer;
  }this.layer('ground');
 }
 layer(name){this.parent=this.layers[name];}
 beginFrame(dpr){
  this.pixelRatio=dpr;this.sequence=0;this.stackIndex=0;
  for(const pool of Object.values(this.pools))pool.used=0;
 }
 endFrame(){
  for(const pool of Object.values(this.pools))for(let i=pool.used;i<pool.items.length;i++)pool.items[i].visible=false;
 }
 acquire(kind,create){
  const pool=this.pools[kind]??=( {items:[],used:0} );
  const index=pool.used++,node=pool.items[index]??=(create());
  node.visible=true;node.alpha=this.globalAlpha;node.zIndex=this.sequence++;node.filters=null;
  if(node.parent!==this.parent)this.parent.addChild(node);
  const m=this.matrix;this.transformMatrix.set(...m);node.setFromMatrix(this.transformMatrix);
  return node;
 }
 save(){
  const state=this.stack[this.stackIndex++]??=( {matrix:[]} );
  for(let i=0;i<6;i++)state.matrix[i]=this.matrix[i];
  for(const key of DRAW_STATE)state[key]=this[key];
 }
 restore(){
  if(!this.stackIndex)return;const state=this.stack[--this.stackIndex];
  for(let i=0;i<6;i++)this.matrix[i]=state.matrix[i];
  for(const key of DRAW_STATE)this[key]=state[key];
 }
 setTransform(a,b,c,d,x,y){
  const r=this.pixelRatio,m=this.matrix;m[0]=a/r;m[1]=b/r;m[2]=c/r;m[3]=d/r;m[4]=x/r;m[5]=y/r;
 }
 transform(a,b,c,d,x,y){multiplyAffine(this.matrix,a,b,c,d,x,y);}
 translate(x,y){this.transform(1,0,0,1,x,y);}
 scale(x,y){this.transform(x,0,0,y,0,0);}
 rotate(a){const c=Math.cos(a),s=Math.sin(a);this.transform(c,s,-s,c,0,0);}
 beginPath(){this.pathIndex=0;}
 command(method,...args){
  const cmd=this.path[this.pathIndex++]??=[];cmd[0]=method;cmd.length=args.length+1;
  for(let i=0;i<args.length;i++)cmd[i+1]=args[i];
 }
 moveTo(x,y){this.command('moveTo',x,y);}
 lineTo(x,y){this.command('lineTo',x,y);}
 closePath(){this.command('closePath');}
 bezierCurveTo(...a){this.command('bezierCurveTo',...a);}
 quadraticCurveTo(...a){this.command('quadraticCurveTo',...a);}
 roundRect(x,y,w,h,r){this.command('roundRect',x,y,Math.max(0,w),Math.max(0,h),r);}
 ellipse(x,y,rx,ry,rotation,start,end){
  if(Math.abs(end-start)>=Math.PI*2-.00001&&rotation===0){this.command('ellipse',x,y,rx,ry);return;}
  // Partial tilted ellipses (fish orbit / sword) sampled in the same plane.
  const steps=Math.max(12,Math.ceil(Math.abs(end-start)*12)),co=Math.cos(rotation),si=Math.sin(rotation);
  for(let i=0;i<=steps;i++){const a=start+(end-start)*i/steps,px=Math.cos(a)*rx,py=Math.sin(a)*ry;
   this.command(i?'lineTo':'moveTo',x+px*co-py*si,y+px*si+py*co);
  }
 }
 pathInto(g,clear=true){
  if(clear)g.clear();
  for(let i=0;i<this.pathIndex;i++){const [method,...args]=this.path[i];g[method](...args);}
 }
 paint(stroke){
  const g=this.acquire('graphics',()=>new this.P.Graphics());this.pathInto(g);
  // A soft double stroke approximates Canvas shadowBlur without a filter pass per particle.
  if(stroke&&this.shadowBlur>0&&this.shadowColor!=='transparent'){
   g.stroke({color:this.shadowColor,width:this.lineWidth+this.shadowBlur*.55,alpha:.16,cap:'round'});
   this.pathInto(g,false);
  }
  if(stroke)g.stroke({color:this.strokeStyle,width:this.lineWidth,cap:this.lineCap});
  else g.fill(this.fillStyle);
 }
 fill(){this.paint(false);}
 stroke(){this.paint(true);}
 fillRect(x,y,w,h){
  if(typeof this.fillStyle==='object'){
   const gradient=this.fillStyle,key=JSON.stringify(gradient.stops);
   let texture=this.gradients.get(key);
   if(!texture){
    const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64);
    for(const [offset,color]of gradient.stops)g.addColorStop(offset,color);
    c.fillStyle=g;c.fillRect(0,0,128,128);texture=this.P.Texture.from(cv);this.gradients.set(key,texture);
   }
   this.sprite(texture,x,y,w,h);return;
  }
  const g=this.acquire('rect',()=>new this.P.Graphics());g.clear().rect(x,y,w,h).fill(this.fillStyle);
 }
 createRadialGradient(){
  return {stops:[],addColorStop(offset,color){this.stops.push([offset,color]);}};
 }
 sprite(texture,x,y,w,h){
  const s=this.acquire('sprite',()=>new this.P.Sprite());
  s.texture=texture;
  const m=this.matrix,tw=texture.width,th=texture.height;
  this.transformMatrix.set(m[0]*w/tw,m[1]*w/tw,m[2]*h/th,m[3]*h/th,m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]);
  s.setFromMatrix(this.transformMatrix);s.filters=this.filter==='brightness(1.6)'?this.brightFilters:null;
 }
 drawImage(image,...args){
  let entry=this.images.get(image);
  if(!entry){
   entry={frames:new Map()};this.images.set(image,entry);
   const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
   if(width>2048||height>2048){
    // The ground is baked once, then tiled for GPUs with a 2048px texture limit.
    entry.tiles=[];
    for(let y=0;y<height;y+=1024)for(let x=0;x<width;x+=1024){
     const cv=document.createElement('canvas');cv.width=Math.min(1024,width-x);cv.height=Math.min(1024,height-y);
     cv.getContext('2d').drawImage(image,x,y,cv.width,cv.height,0,0,cv.width,cv.height);
     entry.tiles.push({texture:this.P.Texture.from(cv),x,y});
    }
   }else entry.texture=this.P.Texture.from(image);
  }
  if(entry.tiles){
   if(args.length!==2)throw Error('Tiled images must be drawn at native size.');
   for(const tile of entry.tiles)this.sprite(tile.texture,args[0]+tile.x,args[1]+tile.y,tile.texture.width,tile.texture.height);
   return;
  }
  if(args.length===2){this.sprite(entry.texture,args[0],args[1],entry.texture.width,entry.texture.height);return;}
  const [sx,sy,sw,sh,x,y,w,h]=args,key=`${sx},${sy},${sw},${sh}`;
  let texture=entry.frames.get(key);
  if(!texture){texture=new this.P.Texture({source:entry.texture.source,frame:new this.P.Rectangle(sx,sy,sw,sh)});entry.frames.set(key,texture);}
  this.sprite(texture,x,y,w,h);
 }
 measureText(value){this.measure.font=this.font;return this.measure.measureText(value);}
 fillText(value,x,y){
  const key=`${this.font}|${this.fillStyle}|${this.shadowBlur}|${this.shadowColor}`;
  let style=this.styles.get(key);
  if(!style){
   const match=this.font.match(/^(?:(\d+)\s+)?([\d.]+)px\s+(.+)$/);
   style=new this.P.TextStyle({fontFamily:match?.[3].replaceAll('"','').split(',')??'sans-serif',fontSize:Number(match?.[2]??10),fontWeight:match?.[1]??'normal',fill:this.fillStyle,
    dropShadow:this.shadowBlur?{color:this.shadowColor,alpha:1,blur:this.shadowBlur,distance:0}:false});
   this.styles.set(key,style);
  }
  const t=this.acquire('text',()=>new this.P.Text({text:'',style,resolution:2}));
  if(t.style!==style)t.style=style;if(t.text!==String(value))t.text=String(value);
  t.anchor.set(this.textAlign==='center'?.5:this.textAlign==='right'?1:0,0);
  // Canvas fillText uses the alphabetic baseline; Pixi Text exposes the same metrics.
  const metrics=this.P.CanvasTextMetrics.measureText(String(value),style),top=y-metrics.fontProperties.ascent;
  const m=this.matrix;this.transformMatrix.set(m[0],m[1],m[2],m[3],m[0]*x+m[2]*top+m[4],m[1]*x+m[3]*top+m[5]);t.setFromMatrix(this.transformMatrix);
 }
 destroy(){
  for(const entry of this.images.values()){
   for(const t of entry.frames.values())t.destroy();
   entry.texture?.destroy(true);for(const tile of entry.tiles??[])tile.texture.destroy(true);
  }
  for(const t of this.gradients.values())t.destroy(true);
  for(const pool of Object.values(this.pools))for(const node of pool.items)node.destroy({children:true});
  this.bright.destroy();this.images.clear();this.gradients.clear();this.styles.clear();this.pools={};
 }
}
