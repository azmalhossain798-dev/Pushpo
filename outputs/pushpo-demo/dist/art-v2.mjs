import {WORLD,NODES,ROADS,BOSSES,TYPES,RULES,random,segmentDistance,currentBoss,objectivePosition} from './engine-v2.mjs';
const TAU=Math.PI*2;
function oval(c,x,y,rx,ry,fill,stroke=null,w=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function rr(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function shine(c,x,y,r,color){const grad=c.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'transparent');c.fillStyle=grad;c.fillRect(x-r,y-r,r*2,r*2);}
function text(c,t,x,y,size,color='#fff3cd',align='center'){c.font=`800 ${size}px "Trebuchet MS",sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(t,x,y);}
function segment(c,a,b,w,color){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.lineCap='round';c.lineWidth=w;c.strokeStyle=color;c.stroke();}
function cropAtlas(image,columns,rows){
 const cv=document.createElement('canvas');cv.width=image.naturalWidth;cv.height=image.naturalHeight;
 const c=cv.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
 const data=c.getImageData(0,0,cv.width,cv.height).data,result=[],cw=cv.width/columns,ch=cv.height/rows;
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  let minX=Math.ceil((col+1)*cw),maxX=Math.floor(col*cw),minY=Math.ceil((row+1)*ch),maxY=Math.floor(row*ch);
  for(let y=Math.ceil(row*ch);y<Math.floor((row+1)*ch);y++)for(let x=Math.ceil(col*cw);x<Math.floor((col+1)*cw);x++){
   if(data[(y*cv.width+x)*4+3]>80){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  }
  result.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1});
 }return result;
}
function drawCell(c,image,cells,index,x,y,w,h){const s=cells[index];if(s)c.drawImage(image,s.x,s.y,s.w,s.h,x,y,w,h);}
export class Painter{
 constructor(canvas){
  this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.images={};this.cells={};
  this.view={x:0,y:0,width:1280,height:720,scale:1,dpr:1};this.camera={x:1680,y:1900};
  this.ready=Promise.all(Object.entries({characters:'assets/characters.png',buildings:'assets/buildings.png',portrait:'assets/portrait.png'}).map(([k,url])=>new Promise((resolve,reject)=>{
   const im=new Image();im.onload=()=>{this.images[k]=im;resolve();};im.onerror=()=>reject(new Error(`Unable to load ${k} artwork`));im.src=url;
  }))).then(()=>{this.cells.characters=cropAtlas(this.images.characters,4,2);this.cells.buildings=cropAtlas(this.images.buildings,2,2);this.buildCity();this.loaded=true;});
 }
 resize(){
  const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
  this.canvas.width=r.width*dpr;this.canvas.height=r.height*dpr;
  Object.assign(this.view,{width:r.width,height:r.height,dpr,scale:Math.max(.68,Math.min(1.12,Math.max(r.width/1300,r.height/780)))});
 }
 buildCity(){
  const rng=random(78012),floor=document.createElement('canvas');floor.width=WORLD.width;floor.height=WORLD.height;
  const c=floor.getContext('2d');c.fillStyle='#9a9b68';c.fillRect(0,0,floor.width,floor.height);
  const tile=document.createElement('canvas');tile.width=48;tile.height=32;
  const tc=tile.getContext('2d');tc.fillStyle='#917c6c';tc.fillRect(0,0,48,32);
  for(let y=0;y<4;y++)for(let x=-1;x<4;x++){tc.fillStyle=['#ad9580','#bca088','#c0a587','#a98e7b'][(x+y+4)%4];tc.fillRect(x*16+(y%2)*8+.5,y*8+.5,15,7);}
  const pave=c.createPattern(tile,'repeat');
  // Continuous roads reproduce the reference's north–south spine and east–west junction.
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+84,'#9c8667');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+72,'#dac5a1');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+20,'#c2a487');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width,pave);
  for(const r of ROADS)if(r.width>=200){
   c.setLineDash([25,30]);segment(c,NODES[r.a],NODES[r.b],3,'#f8e5b57c');c.setLineDash([]);
  }
  oval(c,1660,1750,198,198,'#c9b292','#8b7661',4);
  oval(c,1660,1750,174,174,pave,'#e7c68f',3);oval(c,1660,1750,68,68,'#6c904a','#efddb0',9);
  for(let i=0;i<12;i++){const a=i*TAU/12;oval(c,1660+Math.cos(a)*48,1750+Math.sin(a)*48,7,7,i%2?'#efba46':'#d78b67');}
  oval(c,1660,1750,29,29,'#e5d5b2','#806b4d',3);oval(c,1660,1745,19,19,'#77c8c8','#fff1c2',3);
  // Small lane crossings make the real road pattern readable at walking scale.
  for(const [name,[x,y]]of Object.entries(NODES))if(['c','n2','s1','e1','w2'].includes(name)){
   c.save();c.translate(x,y+100);for(let i=0;i<8;i++){c.fillStyle='#f3dec294';c.fillRect(-88+i*23,-10,12,30);}c.restore();
  }
  const offRoad=(x,y,clearance=0)=>ROADS.every(r=>segmentDistance(x,y,NODES[r.a],NODES[r.b])>r.width/2+45+clearance)&&Math.hypot(x-1660,y-1750)>215+clearance;
  const blocks=[];
  for(let y=230;y<WORLD.height-180;y+=245)for(let x=170;x<WORLD.width-120;x+=260){
   const w=210+rng()*30,h=220+rng()*22,cx=x+(rng()-.5)*20,cy=y;
   if(offRoad(cx,cy,65)&&![[1300,1580],[2045,1565],[2815,1675],[1585,2340],[1110,2070]].some(([ax,ay])=>Math.abs(cx-ax)<210&&Math.abs(cy-ay)<220)){
    blocks.push({x:cx,y:cy,w,h,index:Math.floor(rng()*4)});
   }
  }
  for(let i=0;i<1100;i++){
   const x=80+rng()*(WORLD.width-160),y=80+rng()*(WORLD.height-160);
   if(offRoad(x,y,5)&&!blocks.some(b=>Math.abs(x-b.x)<b.w*.48&&Math.abs(y-b.y)<b.h*.48)){
    oval(c,x+3,y+9,16,9,'#3b573447');const size=10+rng()*17;
    oval(c,x,y,size,size*.83,'#517538');oval(c,x-4,y-5,size*.7,size*.55,'#7f9c42');oval(c,x-6,y-9,size*.35,size*.29,'#a5b748');
   }
  }
  for(const b of blocks){rr(c,b.x-b.w/2-8,b.y-b.h/2+10,b.w+16,b.h-5,7,'#8d7d5b66');drawCell(c,this.images.buildings,this.cells.buildings,b.index,b.x-b.w/2,b.y-b.h/2,b.w,b.h);}
  // Larger landmark storefronts flank the central junction.
  drawCell(c,this.images.buildings,this.cells.buildings,0,1170,1455,265,265);
  drawCell(c,this.images.buildings,this.cells.buildings,1,1910,1430,270,270);
  drawCell(c,this.images.buildings,this.cells.buildings,3,2680,1540,270,270);
  drawCell(c,this.images.buildings,this.cells.buildings,2,1470,2210,230,260);
  drawCell(c,this.images.buildings,this.cells.buildings,3,965,1925,290,290);
  drawCell(c,this.images.buildings,this.cells.buildings,2,1270,1970,260,280);
  this.bus(c,1740,1300,-.1);this.bus(c,2390,1735,Math.PI/2+.1);
  this.rickshaw(c,1420,1630,-.1);this.rickshaw(c,2050,1715,.8);this.rickshaw(c,1010,1870,-.8);
  // Metro station and its northern approaches.
  rr(c,1660,790,130,310,14,'#b1b9a9','#556861',4);rr(c,1670,800,110,260,10,'#4d8b91','#2b5662',3);
  for(let i=0;i<7;i++)rr(c,1682,813+i*33,85,23,3,'#8cc3c6','#376d75',1);
  this.sign(c,'MIRPUR 10 METRO',1730,1100,180);this.sign(c,'মিরপুর ১০',1475,1710,145);
  this.sign(c,'BOUNDARY ROAD',800,2240,185);this.sign(c,'EAST MARKET',2760,1770,160);
  c.save();c.translate(1570,480);c.rotate(Math.PI/2+.1);text(c,'BEGUM ROKEYA SARANI',0,0,16,'#f5dfb2');c.restore();
  c.save();c.translate(2410,1860);c.rotate(.12);text(c,'MIRPUR ROAD',0,0,20,'#f5dfb2');c.restore();
  for(const r of ROADS){
   const a=NODES[r.a],b=NODES[r.b],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/len,ny=(b[0]-a[0])/len;
   for(let d=100;d<len;d+=210){const x=a[0]+(b[0]-a[0])*d/len+nx*(r.width/2+29),y=a[1]+(b[1]-a[1])*d/len+ny*(r.width/2+29);
    shine(c,x,y,85,'#ffbc3a24');segment(c,[x,y],[x,y-27],3,'#354e4b');rr(c,x-4,y-31,8,10,2,'#ffdd85','#7d622e');}
  }
  this.floor=floor;this.blockCount=blocks.length;
 }
 sign(c,label,x,y,width){
  segment(c,[x-width/2+10,y],[x-width/2+10,y+30],4,'#4f4b3f');segment(c,[x+width/2-10,y],[x+width/2-10,y+30],4,'#4f4b3f');
  rr(c,x-width/2,y-21,width,31,4,'#184c51','#e8c97e',2);text(c,label,x,y,13);
 }
 bus(c,x,y,angle){
  c.save();c.translate(x,y);c.rotate(angle);oval(c,8,8,58,117,'#283b3944');
  rr(c,-47,-110,94,220,15,'#2c6658','#2e3b3a',3);rr(c,-43,-102,86,199,12,'#d2d7ba','#273c3b',2);
  rr(c,-37,-96,74,177,10,'#b63840','#e07d60',3);
  for(let i=0;i<6;i++){rr(c,-44,-72+i*25,12,20,2,'#376671','#1c414d');rr(c,32,-72+i*25,12,20,2,'#376671','#1c414d');}
  rr(c,-30,67,60,28,4,'#244852','#182f37',2);text(c,'ঢাকা',0,29,18,'#ffe7b3');rr(c,-43,101,18,6,2,'#ffe3a0');rr(c,25,101,18,6,2,'#ffe3a0');c.restore();
 }
 rickshaw(c,x,y,angle){
  c.save();c.translate(x,y);c.rotate(angle);oval(c,0,8,29,40,'#283b3940');
  oval(c,-22,7,6,21,'#263c3d','#f2d3a2',2);oval(c,22,7,6,21,'#263c3d','#f2d3a2',2);
  rr(c,-20,-28,40,47,15,'#20948a','#e3bc67',3);rr(c,-14,-20,28,30,11,'#ce4045','#f9b45f',2);
  for(let i=0;i<5;i++)oval(c,Math.cos(i*TAU/5)*9,-7+Math.sin(i*TAU/5)*9,4,4,['#f7da58','#64ced2'][i%2]);
  segment(c,[0,19],[0,52],4,'#e9c87b');oval(c,0,51,4,14,'#23383b','#d4c8b0',1);c.restore();
 }
 sprite(c,index,x,y,height,flip=1,bob=0,lean=0,flash=0){
  const s=this.cells.characters[index];if(!s)return;
  const width=height*s.w/s.h;c.save();c.translate(x,y-bob);c.scale(flip,1);c.rotate(lean);
  if(flash>0)c.filter='brightness(1.8)';drawCell(c,this.images.characters,this.cells.characters,index,-width/2,-height,width,height);c.restore();
 }
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
 actor(c,a,g,time,isPlayer=false){
  const boss=a.kind==='boss',known=a.kind==='enemy'&&(a.known||a.aggro),h=isPlayer?114:boss?130:106;
  const bob=a.moving?Math.abs(Math.sin(a.walk))*2.5:Math.sin(time*2+a.id)*.7;
  oval(c,a.x+3,a.y+1,isPlayer?24:22,8,'#23343355');
  if(isPlayer){
   shine(c,a.x,a.y-45,84,'#ffcf6a3f');oval(c,a.x,a.y,29,11,null,'#6cf4ed',3);oval(c,a.x,a.y,34,14,null,'#d8fff273',1);
   this.fish(c,a.x,a.y,time,false,a.sight>0);
  }else if(known||boss){
   shine(c,a.x,a.y-45,65,'#291a36a0');oval(c,a.x,a.y,27,10,'#411f4244',boss?'#ff6f4d':TYPES[a.type]?.color,2.5);
   for(let i=0;i<5;i++){const q=time*1.3+i*1.25;oval(c,a.x+Math.cos(q)*23,a.y-25+Math.sin(q)*30,9,16,'#24172643');}
  }
  this.sprite(c,isPlayer?0:a.sprite,a.x,a.y,h,a.face,bob,a.moving?Math.sin(a.walk)*.018:0,a.flash);
  if(isPlayer)this.fish(c,a.x,a.y,time,true,a.sight>0);
  else if(known||boss){
   const label=boss?a.label:TYPES[a.type].label,col=boss?'#ffae78':TYPES[a.type].color;
   c.font=`800 ${boss?15:14}px "Trebuchet MS",sans-serif`;const w=c.measureText(label).width+24,y=a.y-h-33;
   rr(c,a.x-w/2,y,w,25,8,'#132536f2',col,2);
   c.beginPath();c.moveTo(a.x-5,y+25);c.lineTo(a.x,y+31);c.lineTo(a.x+5,y+25);c.fillStyle=col;c.fill();text(c,label,a.x,y+18,boss?15:14,'#fff3dc');
   if(a.hp<a.maxHp){rr(c,a.x-25,a.y-h-1,50,5,3,'#192433');rr(c,a.x-25,a.y-h-1,50*a.hp/a.maxHp,5,3,'#ef7a68');}
  }else if(a.known){c.beginPath();c.moveTo(a.x,a.y-h-18);c.lineTo(a.x+5,a.y-h-11);c.lineTo(a.x,a.y-h-4);c.lineTo(a.x-5,a.y-h-11);c.closePath();c.fillStyle='#51d9fc';c.fill();c.strokeStyle='#087aab';c.lineWidth=1;c.stroke();}
  if(a.windup>0){oval(c,a.x+33,a.y-h-5,11,14,'#e4ad31','#fff3b8',2);text(c,'!',a.x+33,a.y-h+1,19);}
 }
 effects(c,g){
  for(const e of g.effects){c.save();
   if(e.type==='slash'&&e.age<.3){c.translate(e.x,e.y-45);c.rotate(e.angle);c.globalAlpha=1-e.age/.3;c.strokeStyle='#fff0b1';c.shadowColor='#ffcd61';c.shadowBlur=16;c.lineWidth=7;c.beginPath();c.arc(0,0,65,-1+e.age*3,.8+e.age*3);c.stroke();}
   if(e.type==='pulse'){const r=e.age/1.5*RULES.sightRange;c.globalAlpha=(1-e.age/1.5)*.65;oval(c,e.x,e.y,r,r*.8,null,'#ffe9a7',3);}
   if(e.type==='number'){c.globalAlpha=Math.min(1,(1.2-e.age)*3);c.shadowColor='#162733';c.shadowBlur=4;text(c,e.text,e.x,e.y-e.age*32,17,e.color);}
   if(e.type==='vanish'||e.type==='arrival'){for(let i=0;i<15;i++){const a=i*TAU/15,r=e.age*95;c.globalAlpha=Math.max(0,1-e.age*1.6);oval(c,e.x+Math.cos(a)*r,e.y-35+Math.sin(a)*r*.7,3,3,'#ffe290');}}
   if(e.type==='impact'){c.globalAlpha=Math.max(0,1-e.age*3);oval(c,e.x,e.y,e.range+e.age*20,e.range*.7+e.age*10,null,'#ff9c70',2);}
   if(e.type==='trail'){c.globalAlpha=Math.max(0,.28-e.age*.7);oval(c,e.x,e.y-45,20,40,'#ffdc83');}c.restore();
  }
 }
 render(g,t,started){
  const c=this.c,v=this.view,sw=v.width/v.scale,sh=v.height/v.scale,p=g.player;
  this.camera.x+=((started?p.x:1670)-this.camera.x)*.11;this.camera.y+=((started?p.y-90:1730)-this.camera.y)*.11;
  v.x=Math.max(0,Math.min(WORLD.width-sw,this.camera.x-sw/2));v.y=Math.max(0,Math.min(WORLD.height-sh,this.camera.y-sh/2));
  c.setTransform(v.dpr,0,0,v.dpr,0,0);c.fillStyle='#ac9b73';c.fillRect(0,0,v.width,v.height);if(!this.loaded)return;
  c.scale(v.scale,v.scale);c.translate(-v.x,-v.y);c.drawImage(this.floor,v.x,v.y,sw,sh,v.x,v.y,sw,sh);
  if(p.sight>0){c.fillStyle='#13335d33';c.fillRect(v.x,v.y,sw,sh);shine(c,p.x,p.y,500,'#ffd36b25');}
  for(const a of g.actors)if(a.windup>0&&!a.dead){
   const radius=a.kind==='boss'?currentBoss(g).range:52,progress=1-a.windup/a.windupMax;
   oval(c,a.attackX,a.attackY,radius,radius*.7,`rgba(233,76,47,${.12+progress*.25})`,'#ffd391',2);
   c.beginPath();c.ellipse(a.attackX,a.attackY,radius,radius*.7,0,-Math.PI/2,-Math.PI/2+TAU*progress);c.strokeStyle='#ffeab7';c.lineWidth=4;c.stroke();
  }
  const visible=[...g.actors.filter(a=>!a.dead),{...p,id:0,isPlayer:true}].filter(a=>a.x>v.x-100&&a.x<v.x+sw+100&&a.y>v.y-50&&a.y<v.y+sh+180).sort((a,b)=>a.y-b.y);
  for(const a of visible)this.actor(c,a,g,t,!!a.isPlayer);this.effects(c,g);
  const objective=objectivePosition(g);
  if(started&&objective){
   const d=Math.hypot(objective.x-p.x,objective.y-p.y);
   if(d>280){
    const x=Math.max(v.x+60,Math.min(v.x+sw-60,objective.x)),y=Math.max(v.y+190,Math.min(v.y+sh-140,objective.y));
    c.save();c.translate(x,y);c.rotate(Math.atan2(objective.y-y,objective.x-x));c.beginPath();c.moveTo(13,0);c.lineTo(-8,-8);c.lineTo(-5,0);c.lineTo(-8,8);c.closePath();c.fillStyle=g.phase==='boss'?'#ff936e':'#fadd83';c.strokeStyle='#273b46';c.lineWidth=2;c.fill();c.stroke();c.restore();
    c.shadowColor='#112433';c.shadowBlur=4;text(c,g.phase==='boss'?currentBoss(g).name:'Distant disturbance',x,y+25,12);c.shadowBlur=0;
   }
  }
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
