import {WORLD,NODES,ROADS,BOSSES,TYPES,RULES,random,segmentDistance,currentBoss,objectivePosition} from './engine-v3.mjs';
import {ISO,project,unproject,LANDMARKS,SCENERY} from './scene-v3.mjs';
const TAU=Math.PI*2;
function oval(c,x,y,rx,ry,fill,stroke=null,w=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function rr(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function shine(c,x,y,r,color){const grad=c.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'transparent');c.fillStyle=grad;c.fillRect(x-r,y-r,r*2,r*2);}
function text(c,t,x,y,size,color='#fff3cd',align='center'){c.font=`800 ${size}px "Trebuchet MS",sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(t,x,y);}
function segment(c,a,b,w,color){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineCap='round';c.lineWidth=w;c.strokeStyle=color;c.stroke();}
function poly(c,points,fill,stroke=null,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function cropAtlas(image,columns,rows,regions=null){
 const cv=document.createElement('canvas');cv.width=image.naturalWidth;cv.height=image.naturalHeight;
 const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
 const data=c.getImageData(0,0,cv.width,cv.height).data,result=[],cw=cv.width/columns,ch=cv.height/rows;
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const box=regions?.[row*columns+col],left=box?box[0]*cv.width:col*cw,top=box?box[1]*cv.height:row*ch,right=box?(box[0]+box[2])*cv.width:(col+1)*cw,bottom=box?(box[1]+box[3])*cv.height:(row+1)*ch;
  let minX=Math.ceil(right),maxX=Math.floor(left),minY=Math.ceil(bottom),maxY=Math.floor(top);
  for(let y=Math.ceil(top);y<Math.floor(bottom);y++)for(let x=Math.ceil(left);x<Math.floor(right);x++){
   if(data[(y*cv.width+x)*4+3]>80){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  }result.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1});
 }return result;
}
function drawCell(c,image,cells,index,x,y,w,h){const s=cells[index];if(s)c.drawImage(image,s.x,s.y,s.w,s.h,x,y,w,h);}
export class Painter{
 constructor(canvas){
  this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.images={};this.cells={};
  this.view={x:0,y:0,width:1280,height:720,scale:1,dpr:1};this.camera=project(1370,1780);this.objects=[];
  const sources={characters:'assets/characters.png',buildings:'assets/buildings.png',portrait:'assets/portrait.png',bosses:'assets/bosses-v3.png',props:'assets/props-v3.png',backs:'assets/backs-v3.png',decor:'assets/decor-v3.png'};
  this.ready=Promise.all(Object.entries(sources).map(([k,url])=>new Promise((resolve,reject)=>{
   const im=new Image();im.onload=()=>{this.images[k]=im;resolve();};im.onerror=()=>reject(new Error(`Unable to load ${k} artwork`));im.src=url;
  }))).then(()=>{
   for(const [key,cols,rows]of[['characters',4,2],['buildings',2,2],['bosses',3,1],['props',2,2],['backs',5,2]])this.cells[key]=cropAtlas(this.images[key],cols,rows);
   this.cells.decor=cropAtlas(this.images.decor,2,2,[[0,0,.56,.52],[.6,0,.4,.52],[0,.52,.52,.48],[.52,.52,.48,.48]]);
   this.buildCity();this.loaded=true;
  });
 }
 resize(){
  const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
  this.canvas.width=r.width*dpr;this.canvas.height=r.height*dpr;
  Object.assign(this.view,{width:r.width,height:r.height,dpr,scale:Math.max(.78,Math.min(1.2,r.width/1150))});
 }
 buildCity(){
  const rng=random(78012),floor=document.createElement('canvas');floor.width=WORLD.width;floor.height=WORLD.height;
  const c=floor.getContext('2d');c.fillStyle='#b49b78';c.fillRect(0,0,floor.width,floor.height);
  // This texture lives in world space; the camera projects every stone with the roads.
  const tile=document.createElement('canvas');tile.width=64;tile.height=48;const tc=tile.getContext('2d');
  tc.fillStyle='#9b8977';tc.fillRect(0,0,64,48);
  for(let y=0;y<4;y++)for(let x=-1;x<5;x++){tc.fillStyle=['#b4a08b','#c3af96','#bbaa91','#bbaa97'][(x+y+5)%4];tc.fillRect(x*16+(y%2)*8+.6,y*12+.6,15,11);}
  const pave=c.createPattern(tile,'repeat');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+90,'#826d57');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+82,'#dfc79e');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+12,'#7f7365');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width,pave);
  for(const r of ROADS)if(r.width>=200){c.setLineDash([25,31]);segment(c,NODES[r.a],NODES[r.b],3,'#f5e5bb77');c.setLineDash([]);}
  oval(c,1660,1750,196,196,'#d4ba91','#806b52',4);
  oval(c,1660,1750,174,174,pave,'#f1d5a6',3);
  oval(c,1660,1750,68,68,'#63844a','#ede1b9',9);
  for(let i=0;i<16;i++){const a=i*TAU/16;oval(c,1660+Math.cos(a)*48,1750+Math.sin(a)*48,7,7,i%2?'#e8ac56':'#df6c68');}
  for(const id of['n2','s1','w2','e1']){
   const[x,y]=NODES[id];for(let i=0;i<7;i++){c.fillStyle='#ead7ae';c.fillRect(x-75+i*24,y-22,13,44);}
  }
  for(const [label,x,y,angle]of[['MIRPUR ROAD',1990,1820,.12],['BEGUM ROKEYA SARANI',1580,1210,1.45],['BOUNDARY ROAD',900,2350,-.18]]){
   c.save();c.translate(x,y);c.rotate(angle);text(c,label,0,0,17,'#f9e4b9');c.restore();
  }
  const clear=(x,y,r=100)=>ROADS.every(road=>segmentDistance(x,y,NODES[road.a],NODES[road.b])>road.width/2+35+r)&&Math.hypot(x-1660,y-1750)>195+r;
  this.objects=[];
  const addBuilding=b=>{
   const o={kind:'building',...b};o.p=project(o.x,o.y);o.depth=o.p.y+(o.w+o.d)*ISO.y*.5;
   o.width=(o.w+o.d)*ISO.x+12;o.height=o.width*(o.art===2?1.25:1.08);
   this.objects.push(o);c.fillStyle='#ceb18b';c.fillRect(o.x-o.w/2-8,o.y-o.d/2-8,o.w+16,o.d+16);
  };
  LANDMARKS.forEach(addBuilding);
  for(let y=205;y<3400;y+=193)for(let x=190;x<3250;x+=193){
   if(clear(x,y,99)&&!LANDMARKS.some(b=>Math.abs(x-b.x)<220&&Math.abs(y-b.y)<220)){
    addBuilding({x,y,w:158,d:158,art:Math.floor(rng()*4)});
   }
  }
  for(const o of SCENERY){const p=project(o.x,o.y);this.objects.push({kind:'prop',...o,p,depth:p.y+o.radius*.2});}
  // Trees and lamps are also grounded and sorted with the people.
  for(const road of ROADS){
   const a=NODES[road.a],b=NODES[road.b],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/len,ny=(b[0]-a[0])/len;
   for(let d=100;d<len;d+=225){
    const x=a[0]+(b[0]-a[0])*d/len+nx*(road.width/2+31),y=a[1]+(b[1]-a[1])*d/len+ny*(road.width/2+31);
    if(SCENERY.some(o=>Math.hypot(x-o.x,y-o.y)<100))continue;
    const p=project(x,y);this.objects.push({kind:'lamp',x,y,p,depth:p.y,width:24,height:110});
    if(rng()>.45){const tx=x+nx*29,ty=y+ny*29,q=project(tx,ty);this.objects.push({kind:'tree',x:tx,y:ty,p:q,depth:q.y,width:100,height:125,seed:rng()});}
   }
  }
  this.objects.push({kind:'fountain',x:1660,y:1750,p:project(1660,1750),depth:project(1660,1750).y,width:100,height:60});
  this.floor=floor;this.blockCount=this.objects.filter(o=>o.kind==='building').length;
 }
 ground(c){c.transform(ISO.x,ISO.y,-ISO.x,ISO.y,0,0);}
 drawObject(c,o,player,time){
  const{x,y}=o.p;
  if(o.kind==='building'){
   const base=o.depth,bounds=[x-o.width/2,base-o.height,o.width,o.height];
   const obscures=base>player.y&&player.x>bounds[0]-22&&player.x<bounds[0]+bounds[2]+22&&player.y-55>bounds[1]&&player.y<base+25;
   c.save();if(obscures)c.globalAlpha=.3;
   const pts=[[-o.w/2,-o.d/2],[o.w/2,-o.d/2],[o.w/2,o.d/2],[-o.w/2,o.d/2]].map(([a,b])=>project(o.x+a+22,o.y+b+15));
   poly(c,pts,'#514b3a38');drawCell(c,this.images.buildings,this.cells.buildings,o.art,...bounds);c.restore();
  }else if(o.kind==='prop'){
   const s=this.cells.props[o.art],h=o.width*s.h/s.w;
   c.save();if(o.depth>player.y&&Math.abs(x-player.x)<o.width*.5+15&&player.y-50>y-h&&player.y<y+18)c.globalAlpha=.28;
   oval(c,x+7,y-5,o.width*.39,o.width*.13,'#403b3540');
   drawCell(c,this.images.props,this.cells.props,o.art,x-o.width/2,y-h+10,o.width,h);
   if(o.art===3){for(let i=0;i<3;i++){c.globalAlpha=.18;oval(c,x-12+Math.sin(time+i)*4,y-h-((time*12+i*12)%28),4,9,'#fff4d7');}c.globalAlpha=1;}
   c.restore();
  }else if(o.kind==='tree'){
   oval(c,x+16,y+3,37,12,'#253c2b28');c.save();
   if(y>player.y&&Math.abs(x-player.x)<50&&player.y>y-110)c.globalAlpha=.3;
   drawCell(c,this.images.decor,this.cells.decor,0,x-50,y-125,100,125);c.restore();
  }else if(o.kind==='lamp'){
   drawCell(c,this.images.decor,this.cells.decor,1,x-11,y-110,46,110);shine(c,x+22,y-64,30,'#ffd56e28');
  }else if(o.kind==='fountain'){
   oval(c,x,y,38,19,'#ddccaa','#8a765d',3);rr(c,x-30,y-19,60,18,4,'#beaa8b');
   oval(c,x,y-20,31,15,'#73b9b6','#efe0bb',5);oval(c,x,y-21,22,10,null,'#cceae1',1);
   segment(c,[x,y-20],[x,y-42],3,'#acd9d6');oval(c,x,y-41,5,3,'#edf5de');
  }
 }
 rig(c,actor,x,y,height,time){
  const back=(actor.velocityX??0)+(actor.velocityY??0)<-.015;
  const key=back?'backs':actor.kind==='boss'?'bosses':'characters';
  const index=back?(actor.kind==='boss'?7+actor.sprite:actor.sprite):actor.sprite,s=this.cells[key][index];
  const image=this.images[key],width=height*s.w/s.h,phase=actor.walk||0,moving=actor.moving;
  const stride=moving?Math.sin(phase)*.16:0,gesture=actor.gesture||0,bob=moving?Math.abs(Math.sin(phase))*1.9:Math.sin(time*2+actor.id)*.45;
  c.save();c.translate(x,y-bob);c.scale(actor.face||1,1);if(actor.flash>0)c.filter='brightness(1.6)';
  // A cutout rig keeps approved faces/clothes intact while legs and arms move independently.
  const piece=(u,v,uw,vh,angle=0,px=u,py=v)=>{
   c.save();c.translate((px-.5)*width,(py-1)*height);c.rotate(angle);
   c.drawImage(image,s.x+u*s.w,s.y+v*s.h,uw*s.w,vh*s.h,(u-px)*width,(v-py)*height,uw*width,vh*height);c.restore();
  };
  if(!moving&&!gesture){c.drawImage(image,s.x,s.y,s.w,s.h,-width/2,-height,width,height);}
  else{
   piece(0,.65,.5,.35,stride,.36,.65);
   piece(.5,.65,.5,.35,-stride,.66,.65);
   piece(0,.28,.25,.38,-stride*.6-gesture*.27,.22,.3);
   piece(.75,.28,.25,.38,stride*.6+gesture*.27,.78,.3);
   piece(.25,.27,.5,.41);piece(0,0,1,.285);
  }
  c.restore();
 }
 actor(c,a,g,time,isPlayer=false){
  const p=project(a.x,a.y),x=p.x,y=p.y,boss=a.kind==='boss',known=a.kind==='enemy'&&(a.known||a.aggro),h=isPlayer?96:boss?104:91;
  oval(c,x+5,y+2,isPlayer?18:17,7,'#333a3047');
  if(isPlayer){shine(c,x,y-39,66,'#ffcf6a32');oval(c,x,y,25,12,null,'#71e9df',2);this.fish(c,x,y,time,false,a.sight>0);}
  else if(known||boss){shine(c,x,y-30,48,'#34213b86');oval(c,x,y,23,11,'#411f4222',boss?'#ff7960':TYPES[a.type].color,2);}
  this.rig(c,isPlayer?{...a,sprite:0,id:0}:a,x,y,h,time);
  if(isPlayer)this.fish(c,x,y,time,true,a.sight>0);
  else if(known||boss){
   const label=boss?a.label:TYPES[a.type].label,col=boss?'#ffae78':TYPES[a.type].color;
   c.font='800 12px "Trebuchet MS",sans-serif';const w=c.measureText(label).width+20,ty=y-h-28;
   rr(c,x-w/2,ty,w,23,7,'#102b3df5',col,1.7);text(c,label,x,ty+16,12);
   if(a.hp<a.maxHp){rr(c,x-22,y-h-1,44,4,2,'#192433');rr(c,x-22,y-h-1,44*a.hp/a.maxHp,4,2,'#ef7a68');}
  }else if(a.known){
   poly(c,[{x,y:y-h-16},{x:x+4,y:y-h-10},{x,y:y-h-4},{x:x-4,y:y-h-10}],'#65dff5','#1b8baa');
  }
  if(a.speech&&Math.hypot(a.x-g.player.x,a.y-g.player.y)<600){
   c.font='11px "Trebuchet MS"';const w=c.measureText(a.speech).width+19;
   rr(c,x-w/2,y-h-39,w,24,9,'#fff0d3f2','#a68d61',1);
   text(c,a.speech,x,y-h-23,10,'#354b50');
  }
  if(a.activity==='shopkeeper'&&a.gesture>.2){rr(c,x+19*a.face,y-42,6,7,2,'#e7c694','#6e5240',1);}
  if(a.windup>0){oval(c,x+27,y-h+3,9,12,'#d7a53a','#fff3b8',2);text(c,'!',x+27,y-h+8,16);}
 }
 effects(c,g){
  for(const e of g.effects){c.save();const p=project(e.x,e.type==='number'?e.y+100:e.y);
   if(e.type==='slash'&&e.age<.3){const direction=project(Math.cos(e.angle),Math.sin(e.angle));c.translate(p.x,p.y-36);c.rotate(Math.atan2(direction.y,direction.x));c.globalAlpha=1-e.age/.3;c.strokeStyle='#fff0b1';c.shadowColor='#ffcd61';c.shadowBlur=12;c.lineWidth=5;c.beginPath();c.ellipse(0,0,53,32,0,-1+e.age*3,.8+e.age*3);c.stroke();}
   if(e.type==='pulse'){const r=e.age/1.5*RULES.sightRange;c.globalAlpha=(1-e.age/1.5)*.55;this.ground(c);oval(c,e.x,e.y,r,r,null,'#ffe9a7',3);}
   if(e.type==='number'){c.globalAlpha=Math.min(1,(1.2-e.age)*3);c.shadowColor='#162733';c.shadowBlur=4;text(c,e.text,p.x,p.y-105-e.age*32,15,e.color);}
   if(e.type==='vanish'||e.type==='arrival'){for(let i=0;i<12;i++){const a=i*TAU/12,r=e.age*80;c.globalAlpha=Math.max(0,1-e.age*1.6);oval(c,p.x+Math.cos(a)*r,p.y-30+Math.sin(a)*r*.5,2,2,'#ffe290');}}
   if(e.type==='impact'){c.globalAlpha=Math.max(0,1-e.age*3);this.ground(c);oval(c,e.x,e.y,e.range,e.range,null,'#ff9c70',2);}
   if(e.type==='trail'){c.globalAlpha=Math.max(0,.23-e.age*.7);oval(c,p.x,p.y-40,17,35,'#ffdc83');}c.restore();
  }
 }
 render(g,t,started){
  const c=this.c,v=this.view,sw=v.width/v.scale,sh=v.height/v.scale,p=project(g.player.x,g.player.y);
  this.camera.x+=(p.x-this.camera.x)*.12;this.camera.y+=(p.y-55-this.camera.y)*.12;
  v.x=this.camera.x-sw/2;v.y=this.camera.y-sh/2;
  c.setTransform(v.dpr,0,0,v.dpr,0,0);c.fillStyle='#ad9574';c.fillRect(0,0,v.width,v.height);if(!this.loaded)return;
  c.scale(v.scale,v.scale);c.translate(-v.x,-v.y);c.save();this.ground(c);c.drawImage(this.floor,0,0);c.restore();
  if(g.player.sight>0){c.fillStyle='#15345b18';c.fillRect(v.x,v.y,sw,sh);}
  for(const a of g.actors)if(a.windup>0&&!a.dead){
   c.save();this.ground(c);const radius=a.kind==='boss'?currentBoss(g).range:52,progress=1-a.windup/a.windupMax;
   oval(c,a.attackX,a.attackY,radius,radius,`rgba(233,76,47,${.12+progress*.25})`,'#ffd391',2);c.restore();
  }
  const drawList=this.objects.filter(o=>o.p.x>v.x-o.width&&o.p.x<v.x+sw+o.width&&o.depth>v.y-40&&o.depth-(o.height??300)<v.y+sh);
  for(const a of [...g.actors.filter(a=>!a.dead),{...g.player,id:0,isPlayer:true}]){const q=project(a.x,a.y);if(q.x>v.x-100&&q.x<v.x+sw+100&&q.y>v.y-30&&q.y<v.y+sh+150)drawList.push({kind:'actor',actor:a,depth:q.y});}
  drawList.sort((a,b)=>a.depth-b.depth);
  for(const o of drawList)if(o.kind==='actor')this.actor(c,o.actor,g,t,!!o.actor.isPlayer);else this.drawObject(c,o,p,t);
  this.effects(c,g);
  const objective=objectivePosition(g);
  if(started&&objective&&Math.hypot(objective.x-g.player.x,objective.y-g.player.y)>300){
   const q=project(objective.x,objective.y),x=Math.max(v.x+55,Math.min(v.x+sw-55,q.x)),y=Math.max(v.y+180,Math.min(v.y+sh-145,q.y));
   if(Math.hypot(q.x-p.x,q.y-p.y)>Math.min(sw,sh)*.32){
    c.save();c.translate(x,y);c.rotate(Math.atan2(q.y-y,q.x-x));poly(c,[{x:12,y:0},{x:-8,y:-7},{x:-4,y:0},{x:-8,y:7}],g.phase==='boss'?'#ff936e':'#fadd83','#273b46',2);c.restore();
    c.shadowColor='#112433';c.shadowBlur=4;text(c,g.phase==='boss'?currentBoss(g).name:'Distant disturbance',x,y+23,11);c.shadowBlur=0;
   }
  }
 }
 screenToWorld(x,y){return unproject(x/this.view.scale+this.view.x,y/this.view.scale+this.view.y);}
 fish(c,x,y,t,front,sight){
  const angle=t*1.8,rx=55,ry=30,fy=y-53;
  c.save();c.globalAlpha=sight?1:.88;
  c.shadowColor='#ffd75d';c.shadowBlur=sight?15:9;
  // Split the orbit behind and in front of Pushpo for real depth.
  c.strokeStyle='#ffd96699';c.lineWidth=2.2;c.beginPath();c.ellipse(x,fy,rx,ry,-.25,front?0:Math.PI,front?Math.PI:TAU);c.stroke();
  for(let i=0;i<14;i++){
   const a=angle-i*.095,fore=Math.sin(a)>0;if(fore!==front)continue;
   c.globalAlpha=(1-i/15)*.7;oval(c,x+Math.cos(a)*rx,fy+Math.sin(a)*ry,2.1,2.1,'#fff0a4');
  }
  if((Math.sin(angle)>0)===front){
   c.globalAlpha=.95;c.translate(x+Math.cos(angle)*rx,fy+Math.sin(angle)*ry);c.rotate(Math.atan2(Math.cos(angle)*ry,-Math.sin(angle)*rx));c.scale(.82,.82);
   c.fillStyle='#ffdb6744';c.strokeStyle='#fff1ac';c.lineWidth=1.7;
   c.beginPath();c.moveTo(30,0);c.bezierCurveTo(14,-13,-15,-15,-30,0);c.bezierCurveTo(-12,13,17,13,30,0);c.fill();c.stroke();
   c.beginPath();c.moveTo(-27,0);c.lineTo(-42,-11+Math.sin(t*12)*3);c.lineTo(-38,0);c.lineTo(-42,11+Math.sin(t*12)*3);c.closePath();c.fill();c.stroke();
   c.beginPath();c.moveTo(24,2);c.quadraticCurveTo(40,5,38,15);c.moveTo(24,2);c.quadraticCurveTo(32,12,24,17);c.moveTo(-5,-10);c.lineTo(4,-17);c.lineTo(11,-9);c.stroke();
   oval(c,19,-3,1.8,1.8,'#fff9da');for(let j=0;j<9;j++)oval(c,-17+j*4,-2+(j%2)*4,1,1,'#fff0a4');
  }c.restore();
 }

 map(canvas,g,large=false){
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,scale=Math.min(w/WORLD.width,h/WORLD.height),ox=(w-WORLD.width*scale)/2,oy=(h-WORLD.height*scale)/2;
  c.clearRect(0,0,w,h);c.fillStyle='#132c3b';c.fillRect(0,0,w,h);c.save();c.translate(ox,oy);c.scale(scale,scale);
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],large?r.width:Math.max(r.width,55),r.width>150?'#d2c298':'#627e80');
  oval(c,1660,1750,125,125,'#43665b','#e7d59a',16);
  const b=currentBoss(g),[bx,by]=NODES[b.node];
  if(g.phase==='boss')oval(c,bx,by,large?65:90,large?65:90,'#ff8b6a','#fff2bd',10);
  for(const a of g.actors)if(!a.dead&&a.known&&a.kind==='enemy')oval(c,a.x,a.y,large?28:32,large?28:32,'#d28e9c');
  oval(c,g.player.x,g.player.y,large?55:75,large?55:75,'#68f2e8','#fff7b9',large?10:20);
  if(large){for(const [label,id]of[['MIRPUR 10','c'],['METRO','n2'],['BOUNDARY RD','f1'],['EAST MARKET','e2'],['KATHALTOLA RD','h2']]){
   const[x,y]=NODES[id];c.shadowColor='#112333';c.shadowBlur=4;text(c,label,x,y-125,58,'#fff0ca');c.shadowBlur=0;
  }}c.restore();
 }
}
