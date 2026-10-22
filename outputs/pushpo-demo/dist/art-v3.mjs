import {WORLD,NODES,ROADS,BOSSES,TYPES,RULES,random,inside,segmentDistance,currentBoss,objectivePosition} from './engine-v3.mjs';
import {ISO,project,unproject,LANDMARKS,SCENERY,ROUNDABOUTS,METRO_LINE,FUCHKA_STALLS} from './scene-v3.mjs';
import {enemyIdentified,actorArtwork,metroPosition} from './city-systems.mjs';
import {addCityDetails,addMetroCars,drawCityObject} from './city-art.mjs';
import {buildingPlanes,roadsideLitter,drawRoadsideLitter,paintAsphalt} from './environment-v5.mjs';
import {trafficSprite} from './traffic-v5.mjs';
import {HOUSE_PORTALS,houseVisible} from './homes-v6.mjs';
import {combatPose} from './combat-v7.mjs';
import {daylightAt,WORLD_RULES} from './world-v10.mjs';
import {boulevardPaint,drawBoulevardPaint,drawBoulevardCrosswalks,streetFurnitureClear} from './boulevards-v11.mjs';
const TAU=Math.PI*2;
function oval(c,x,y,rx,ry,fill,stroke=null,w=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function rr(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function shine(c,x,y,r,color){const grad=c.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,color);grad.addColorStop(1,'transparent');c.fillStyle=grad;c.fillRect(x-r,y-r,r*2,r*2);}
function text(c,t,x,y,size,color='#fff3cd',align='center'){c.font=`800 ${size}px "Trebuchet MS","Nirmala UI",sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(t,x,y);}
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
 constructor(canvas,context=null){
  this.canvas=canvas;this.c=context??canvas.getContext('2d',{alpha:false});this.images={};this.cells={};
  this.view={x:0,y:0,width:1280,height:720,scale:1,dpr:1};this.camera=project(1370,1780);this.objects=[];
  const sources={characters:'assets/characters.png',buildings:'assets/buildings.png',portrait:'assets/portrait.png',bosses:'assets/bosses-v3.png',props:'assets/props-v3.png',backs:'assets/backs-v3.png',decor:'assets/decor-v3.png',people:'assets/people-v4.png',city:'assets/city-v12.png',street:'assets/street-v4.png',rickshaw:'assets/rickshaw-v5.png',hercules:'assets/hercules-v8.png',companions:'assets/companions-v12.png'};
  this.ready=Promise.all(Object.entries(sources).map(([k,url])=>new Promise((resolve,reject)=>{
   const im=new Image();im.onload=()=>{this.images[k]=im;resolve();};im.onerror=()=>reject(new Error(`Unable to load ${k} artwork`));im.src=url;
  }))).then(()=>{
   for(const [key,cols,rows]of[['characters',4,2],['buildings',2,2],['bosses',3,1],['props',2,2],['backs',5,2],['people',4,2],['companions',2,2],['street',2,2]])this.cells[key]=cropAtlas(this.images[key],cols,rows);
   this.cells.decor=cropAtlas(this.images.decor,2,2,[[0,0,.56,.52],[.6,0,.4,.52],[0,.52,.52,.48],[.52,.52,.48,.48]]);
   const cuts=[[0,432,810,1155,1536],[0,424,810,1155,1536]];
   this.cells.rickshaw=cropAtlas(this.images.rickshaw,4,2,cuts.flatMap((row,y)=>row.slice(0,4).map((x,i)=>[x/1536,y/2,(row[i+1]-x)/1536,.5])));
   this.cells.city=cropAtlas(this.images.city,2,2,[[0,0,.5,.545],[.5,0,.5,.545],[0,.545,.5,.455],[.5,.545,.5,.455]]);
   this.cells.hercules=cropAtlas(this.images.hercules,2,1);
   this.buildCombatArms();this.buildFuchkaArt();this.buildCity();this.loaded=true;
  });
 }
 buildCombatArms(){
  this.combatArms={};
  for(const [direction,key]of [['front','characters'],['back','backs']]){
   const s=this.cells[key][0],u=.76,v=.28,w=.24,h=.31,canvas=document.createElement('canvas');canvas.width=Math.ceil(s.w*w);canvas.height=Math.ceil(s.h*h);
   const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(this.images[key],s.x+u*s.w,s.y+v*s.h,s.w*w,s.h*h,0,0,canvas.width,canvas.height);
   const data=c.getImageData(0,0,canvas.width,canvas.height);
   // The source arm crop also contains a red scarf edge. Remove only that saturated cloth
   // below the sleeve, so rotating the retained arm does not swing a triangular garment fragment.
   for(let y=Math.floor(canvas.height*.22);y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4,r=data.data[i],g=data.data[i+1],b=data.data[i+2];if(r>80&&g<r*.6&&b<r*.65)data.data[i+3]=0;}
   c.putImageData(data,0,0);this.combatArms[direction]={canvas,u,v,w,h};
  }
 }
 resize(){
  const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
  this.canvas.width=r.width*dpr;this.canvas.height=r.height*dpr;
  Object.assign(this.view,{width:r.width,height:r.height,dpr,scale:Math.max(.78,Math.min(1.2,r.width/1150))});
 }
 buildFuchkaArt(){
  const canvas=document.createElement('canvas');canvas.width=220;canvas.height=240;const c=canvas.getContext('2d');
  // A complete street counter, rather than a small overlay on a tea cart.
  segment(c,[31,190],[31,46],5,'#65472d');segment(c,[190,180],[190,46],5,'#65472d');
  poly(c,[{x:22,y:150},{x:153,y:137},{x:195,y:159},{x:64,y:178}],'#d2b17b','#67492f',2);
  poly(c,[{x:23,y:153},{x:64,y:178},{x:64,y:223},{x:23,y:197}],'#744731','#503624',2);
  poly(c,[{x:64,y:178},{x:195,y:159},{x:195,y:207},{x:64,y:223}],'#27685b','#503624',2);
  rr(c,81,184,98,22,2,'#efe3bb','#ba883f',1);text(c,'ফুচকা',130,201,18,'#723321');
  // Glass display case, golden shells and filling bowls.
  poly(c,[{x:38,y:100},{x:125,y:92},{x:144,y:108},{x:56,y:119}],'#b6d7cc60','#e6dfbc',1.5);
  poly(c,[{x:56,y:119},{x:144,y:108},{x:144,y:150},{x:56,y:161}],'#cae6d530','#e6dfbc',1.5);
  poly(c,[{x:38,y:100},{x:56,y:119},{x:56,y:161},{x:38,y:143}],'#a6d1c030','#e6dfbc',1.5);
  for(let j=0;j<19;j++){const x=62+(j%6)*12,y=145-Math.floor(j/6)*9;oval(c,x,y,6,4.5,'#dca34a','#86582f',.8);oval(c,x,y-1,1.3,1,'#755b2d');}
  for(const [x,y,col]of [[159,147,'#7b583a'],[179,143,'#a19a50']]){oval(c,x,y,11,5,'#c4cbbb','#f0e7c7',1);oval(c,x,y-1,8,3,col);}
  segment(c,[160,143],[170,123],2,'#e0d9be');rr(c,181,121,9,16,2,'#a6b8ac','#ecdfb5',1);
  segment(c,[69,219],[69,233],4,'#4c3c30');segment(c,[185,209],[185,223],4,'#4c3c30');
  poly(c,[{x:13,y:38},{x:167,y:26},{x:207,y:52},{x:50,y:67}],'#b53e36','#e7bb6b',2);
  for(let i=0;i<8;i++)poly(c,[{x:15+i*19,y:38-i*1.5},{x:25+i*19,y:37-i*1.5},{x:61+i*19,y:66-i*1.8},{x:50+i*19,y:67-i*1.8}],i%2?'#f1d19c':'#db6847');
  rr(c,53,67,143,26,3,'#74322f','#e9bf74',1.5);text(c,'ফুচকা • FUCHKA',124,85,14,'#fff0bd');
  this.fuchkaArt=canvas;
 }
 buildCity(){
  const rng=random(78012),floor=document.createElement('canvas');this.floorScale=.5;floor.width=WORLD.width*this.floorScale;floor.height=WORLD.height*this.floorScale;
  const c=floor.getContext('2d');c.scale(this.floorScale,this.floorScale);
  const tile=document.createElement('canvas');tile.width=128;tile.height=96;const tc=tile.getContext('2d');
  tc.fillStyle='#625142';tc.fillRect(0,0,128,96);
  for(let y=0;y<8;y++)for(let x=-1;x<9;x++){
   tc.fillStyle=['#96765c','#a28262','#8b6d55','#ad8c68','#8a735b'][Math.floor(rng()*5)];
   tc.fillRect(x*16+(y%2)*8+.8,y*12+.8,14.5,10.5);
  }
  const pave=c.createPattern(tile,'repeat');c.fillStyle=pave;c.fillRect(0,0,WORLD.width,WORLD.height);
  const asphaltTile=document.createElement('canvas');asphaltTile.width=asphaltTile.height=160;paintAsphalt(asphaltTile.getContext('2d'),random(61026));const asphalt=c.createPattern(asphaltTile,'repeat');
  c.fillStyle='#af753725';c.fillRect(0,0,WORLD.width,WORLD.height);
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+82,'#635d4c');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+76,'#b5a07d');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width+11,'#625e53');
  for(const r of ROADS)segment(c,NODES[r.a],NODES[r.b],r.width,asphalt);
  for(const r of ROADS)if(r.width>=180&&r.lanes!==4){c.setLineDash([21,36]);segment(c,NODES[r.a],NODES[r.b],2,'#e5cf9270');c.setLineDash([]);}
  this.boulevardMarks=boulevardPaint(NODES,ROADS,ROUNDABOUTS);drawBoulevardPaint(c,this.boulevardMarks);
  for(const ring of ROUNDABOUTS){
   const {x,y,outer,inner}=ring;oval(c,x,y,outer,outer,'#bea681','#716c50',4);
   oval(c,x,y,outer-20,outer-20,asphalt,'#e2c794',3);oval(c,x,y,inner,inner,'#577245','#ddcf9d',8);
   if(ring.lanes===2){c.setLineDash([18,20]);oval(c,x,y,(outer+inner)/2,(outer+inner)/2,null,'#e4dfb9',2);c.setLineDash([]);}
   for(let i=0;i<16;i++){const a=i*TAU/16;oval(c,x+Math.cos(a)*(inner-19),y+Math.sin(a)*(inner-19),6,6,i%2?'#e2ae55':'#cd7363');}
  }
  drawBoulevardCrosswalks(c,NODES,ROADS);
  for(const id of ['j3','t3']){const[x,y]=NODES[id];for(let i=0;i<7;i++){c.fillStyle='#dbc99f';c.fillRect(x-75+i*24,y-22,13,44);}}
  for(const [label,x,y,angle]of [['MIRPUR ROAD',1990,1820,.12],['BEGUM ROKEYA SARANI',1580,1210,1.45],['BOUNDARY ROAD',900,2350,-.18],['EAST BAZAAR',3920,2450,1.45],['RIVER ROAD',2790,4560,0]]){
   c.save();c.translate(x,y);c.rotate(angle);text(c,label,0,0,15,'#e7d2a2');c.restore();
  }
  this.objects=[];this.buildingTextures=new Map();
  const addBuilding=b=>{
   const o={kind:'building',...b},key=o.atlas??'buildings',id=`${key}:${o.art}:${o.w}:${o.d}`;
   let texture=this.buildingTextures.get(id);
   if(!texture){
    const image=this.images[key],cell=this.cells[key][o.art],layout=buildingPlanes(o,cell,image.naturalWidth/2,image.naturalHeight/2),canvas=document.createElement('canvas');
    canvas.width=layout.width;canvas.height=layout.height;const bc=canvas.getContext('2d');bc.translate(-layout.x,-layout.y);
    for(const plane of layout.planes){bc.save();bc.transform(...plane.matrix);bc.drawImage(image,cell.x+plane.left,cell.y,plane.right-plane.left,cell.h,plane.left,0,plane.right-plane.left,cell.h);bc.restore();}
    texture={canvas,layout};this.buildingTextures.set(id,texture);
   }
   o.texture=texture;o.p=project(o.x,o.y);o.depth=o.p.y+texture.layout.depth;
   o.width=Math.max(Math.abs(texture.layout.x),Math.abs(texture.layout.x+texture.layout.width))*2;o.height=texture.layout.height+texture.layout.depth;
   this.objects.push(o);c.fillStyle='#b7a17c';c.fillRect(o.x-o.w/2-5,o.y-o.d/2-5,o.w+10,o.d+10);
  };
  LANDMARKS.forEach(addBuilding);
  const footprintClear=(x,y,w=150,d=150)=>[-w/2-2,0,w/2+2].every(dx=>[-d/2-2,0,d/2+2].every(dy=>!inside(x+dx,y+dy,-12)));
  for(let y=175;y<WORLD.height-120;y+=170)for(let x=170;x<WORLD.width-120;x+=170){
   if(footprintClear(x,y)&&!LANDMARKS.some(b=>Math.abs(x-b.x)<180&&Math.abs(y-b.y)<180)&&!SCENERY.some(o=>Math.hypot(x-o.x,y-o.y)<135))
    addBuilding({x,y,w:150,d:150,art:Math.floor(rng()*4),atlas:rng()>.48?'city':'buildings'});
  }
  for(let y=120;y<WORLD.height-100;y+=112)for(let x=115;x<WORLD.width-100;x+=112){
   if(footprintClear(x,y,86,92)&&!this.objects.some(o=>o.kind==='building'&&Math.abs(o.x-x)<(o.w+86)/2+6&&Math.abs(o.y-y)<(o.d+92)/2+6)&&!SCENERY.some(o=>Math.hypot(x-o.x,y-o.y)<88))
    addBuilding({x,y,w:86,d:92,art:Math.floor(rng()*4),atlas:rng()>.25?'city':'buildings'});
  }
  for(const o of SCENERY){const p=project(o.x,o.y);this.objects.push({kind:'prop',...o,p,depth:p.y+(o.fuchka?32:o.radius*.2)});}
  for(const road of ROADS){
   const a=NODES[road.a],b=NODES[road.b],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/len,ny=(b[0]-a[0])/len;
   for(let d=235;d<len;d+=370){
    const x=a[0]+(b[0]-a[0])*d/len+nx*(road.width/2+32),y=a[1]+(b[1]-a[1])*d/len+ny*(road.width/2+32);
    if(SCENERY.some(o=>Math.hypot(x-o.x,y-o.y)<85)||!streetFurnitureClear({x,y},NODES,ROADS))continue;
    const p=project(x,y);this.objects.push({kind:'lamp',x,y,p,depth:p.y,width:40,height:110});
    const tx=x+nx*31,ty=y+ny*31,q=project(tx,ty);if(streetFurnitureClear({x:tx,y:ty},NODES,ROADS,20))this.objects.push({kind:'tree',x:tx,y:ty,p:q,depth:q.y,width:90,height:115});
   }
  }
  for(const r of ROUNDABOUTS)this.objects.push({kind:'fountain',x:r.x,y:r.y,p:project(r.x,r.y),depth:project(r.x,r.y).y,width:100,height:60});
  for(const h of HOUSE_PORTALS){const p=project(h.x,h.y);this.objects.push({kind:'house-door',...h,p,depth:p.y+35,width:28,height:45});}
  this.litter=roadsideLitter(NODES,ROADS,random(93015));drawRoadsideLitter(c,this.litter);
  this.floor=floor;this.blockCount=this.objects.filter(o=>o.kind==='building').length;addCityDetails(this,c);
  this.objects=this.objects.filter(o=>!['tree','planter','lamp'].includes(o.kind)||FUCHKA_STALLS.every(s=>Math.hypot(o.x-s.x,o.y-s.y)>130));
 }
 ground(c){c.transform(ISO.x,ISO.y,-ISO.x,ISO.y,0,0);}
 drawObject(c,o,player,time){
  const{x,y}=o.p;
  if(o.kind==='building'){
   const base=o.depth,{canvas,layout}=o.texture,bounds=[x+layout.x,y+layout.y,layout.width,layout.height];
   const obscures=[...(this.occlusionPeople??[player]),...(this.stallOccluders??[])].some(p=>base>p.y&&p.x>bounds[0]-22&&p.x<bounds[0]+bounds[2]+22&&p.y-55>bounds[1]&&p.y<base+25);
   c.save();if(obscures)c.globalAlpha=.3;
   const pts=[[-o.w/2,-o.d/2],[o.w/2,-o.d/2],[o.w/2,o.d/2],[-o.w/2,o.d/2]].map(([a,b])=>project(o.x+a+12+(this.light?.sunX??1)*10,o.y+b+15));
   poly(c,pts,'#302d2c50');c.drawImage(canvas,bounds[0],bounds[1]);
   shine(c,x,base-44,80,'#ffb34538');c.restore();
  }else if(o.kind==='house-door'){
   if((this.openDoors?.[o.id]??0)>0){shine(c,x,y-17,31,'#ffe2a377');rr(c,x-7,y-34,14,33,2,'#382d24','#d8bd77',1);c.fillStyle='#eac777';c.fillRect(x-6,y-32,3,29);}
  }else if(o.kind==='rickshaw'){
   const vehicle=o.vehicle,index=trafficSprite(vehicle),s=this.cells.rickshaw[index],scale=.32,w=s.w*scale,h=s.h*scale,bob=vehicle.moving?Math.sin(vehicle.wheel*2)*.45:0;
   oval(c,x,y,34,12,'#352c303a');drawCell(c,this.images.rickshaw,this.cells.rickshaw,index,x-w/2,y+18-h-bob,w,h);
   const wheels=[[[.15,.77],[.86,.84]],[[.14,.70],[.84,.85]],[[.10,.71],[.5,.87],[.90,.71]],[[.16,.85],[.86,.71]],[[.13,.79],[.85,.83]],[[.14,.73],[.70,.87]],[[.10,.87],[.90,.87]],[[.16,.88],[.85,.70]]][index];
   if(vehicle.moving){const dir=project(vehicle.ux,vehicle.uy),n=Math.hypot(dir.x,dir.y)||1;
    c.save();c.globalAlpha=.55;for(const [u,v]of wheels){const hx=x-w/2+u*w,hy=y+18-h+v*h-bob;
     for(let i=0;i<4;i++){const a=vehicle.wheel+i*Math.PI/2;c.beginPath();c.moveTo(hx,hy);c.lineTo(hx+Math.cos(a)*12*dir.x/n,hy+Math.sin(a)*12+Math.cos(a)*4*dir.y/n);c.strokeStyle='#e2cb9b';c.lineWidth=.7;c.stroke();}}
    c.restore();}
  }else if(o.kind==='prop'){
   const key=o.atlas??'props',s=this.cells[key][o.art],h=o.width*s.h/s.w;
   c.save();if(!o.fuchka&&(this.occlusionPeople??[player]).some(p=>o.depth>p.y&&Math.abs(x-p.x)<o.width*.5+15&&p.y-50>y-h&&p.y<y+18))c.globalAlpha=.28;
   oval(c,x+7,y-5,o.width*.39,o.width*.13,'#403b3540');
   if(o.fuchka)c.drawImage(this.fuchkaArt,x-o.width/2,y-o.width*240/220+12,o.width,o.width*240/220);
   else drawCell(c,this.images[key],this.cells[key],o.art,x-o.width/2,y-h+10,o.width,h);
   if(!o.fuchka&&o.art===3&&key==='props'){for(let i=0;i<3;i++){c.globalAlpha=.18;oval(c,x-12+Math.sin(time+i)*4,y-h-((time*12+i*12)%28),4,9,'#fff4d7');}c.globalAlpha=1;}
   c.restore();
  }else if(o.kind==='tree'){
   oval(c,x+16,y+3,37,12,'#253c2b28');c.save();
   if((this.occlusionPeople??[player]).some(p=>y>p.y&&Math.abs(x-p.x)<50&&p.y>y-110))c.globalAlpha=.3;
   drawCell(c,this.images.decor,this.cells.decor,0,x-o.width/2,y-o.height,o.width,o.height);c.restore();
  }else if(o.kind==='lamp'){
   drawCell(c,this.images.decor,this.cells.decor,1,x-11,y-110,46,110);shine(c,x+22,y-64,44,'#ffb94755');
  }else if(o.kind==='fountain'){
   oval(c,x,y,38,19,'#ddccaa','#8a765d',3);rr(c,x-30,y-19,60,18,4,'#beaa8b');
   oval(c,x,y-20,31,15,'#73b9b6','#efe0bb',5);oval(c,x,y-21,22,10,null,'#cceae1',1);
   segment(c,[x,y-20],[x,y-42],3,'#acd9d6');oval(c,x,y-41,5,3,'#edf5de');
  }else drawCityObject(this,c,o,player,time);
 }
 rig(c,actor,x,y,height,time,identified=false){
  const back=(actor.velocityX??0)+(actor.velocityY??0)<-.015;
  const {key,index}=actorArtwork(actor,back,identified),s=this.cells[key][index];
  const image=this.images[key],width=height*s.w/s.h*(actor.finalRole==='companion'?(actor.variant===1?.9:.95):1),phase=actor.walk||0,moving=actor.moving;
  const stride=moving?Math.sin(phase)*.16:0,gesture=actor.gesture||0,bob=moving?Math.abs(Math.sin(phase))*1.9:Math.sin(time*2+actor.id)*.45;
  const pose=combatPose(actor),ready=actor.weapon!=='machete'&&actor.windup>0?Math.min(1,1-actor.windup/(actor.windupMax||.75))*.55:0,reaction=(actor.reaction??0)/.3;
  const punch=pose.arm||pose.leg||ready;c.save();c.translate(x+reaction*(actor.reactionX??0)*6,y-bob-reaction*2);c.scale(actor.face||1,1);c.rotate(pose.lean-reaction*.09);if(actor.flash>0)c.filter='brightness(1.6)';
  // A cutout rig keeps approved faces/clothes intact while legs and arms move independently.
  const piece=(u,v,uw,vh,angle=0,px=u,py=v)=>{
   c.save();c.translate((px-.5)*width,(py-1)*height);c.rotate(angle);
   c.drawImage(image,s.x+u*s.w,s.y+v*s.h,uw*s.w,vh*s.h,(u-px)*width,(v-py)*height,uw*width,vh*height);c.restore();
  };
  if(!moving&&!gesture&&!punch){c.drawImage(image,s.x,s.y,s.w,s.h,-width/2,-height,width,height);}
  else{
   piece(0,.65,.5,.35,stride,.36,.65);
   piece(.5,.65,.5,.35,-stride+pose.leg,.66,.65);
   piece(0,.28,.25,.38,-stride*.6-gesture*.27-pose.arm*.35-ready,.22,.3);
   const playerStrike=actor.id===0&&actor.attackTime>0;
   if(playerStrike){const arm=this.combatArms[back?'back':'front'];c.save();c.translate(width*.28,-height*.7);c.rotate(pose.arm);segment(c,[0,0],[width*.03,height*.09],height*.065,'#e96558');segment(c,[width*.03,height*.07],[width*.11,height*.17],height*.045,'#ddaa7d');c.drawImage(arm.canvas,(arm.u-.78)*width,(arm.v-.3)*height,arm.w*width,arm.h*height);c.restore();}
   else piece(.75,.28,.25,.38,stride*.6+gesture*.27+pose.arm+ready,.78,.3);
   piece(.25,.27,.5,.41);piece(0,0,1,.285,-reaction*.12,.5,.25);
   if(playerStrike&&actor.attackKind==='punch'&&pose.hand>.08){const co=Math.cos(pose.arm),si=Math.sin(pose.arm);oval(c,width*.28+co*width*.16-si*height*.22,-height*.7+si*width*.16+co*height*.22,2.7,3,'#edba87','#956243',.6);}
  }
  if(actor.activity==='fuchka'){
   const color=['#a24831','#266b65','#485786'][actor.vendorStyle??0];poly(c,[{x:-width*.17,y:-height*.6},{x:width*.18,y:-height*.6},{x:width*.22,y:-height*.31},{x:-width*.22,y:-height*.31}],color,'#e4c997',.7);
   segment(c,[-width*.13,-height*.63],[width*.15,-height*.63],1,'#ead8b2');
  }
  if(actor.finalEnemy){
   // The blade and forearm share the same shoulder transform and hand endpoint.
   const armAngle=stride*.6+gesture*.27+pose.arm+ready;c.save();c.translate(width*.28,-height*.7);c.rotate(armAngle);c.translate(width*.09,height*.32);c.rotate(Math.PI-.35);
   segment(c,[0,-1],[0,9],3,'#54402b');
   if(actor.weapon==='machete'){poly(c,[{x:-2,y:0},{x:-4,y:-39},{x:1,y:-51},{x:7,y:-45},{x:5,y:0}],'#b0b4aa','#434945',1);segment(c,[0,-38],[2,-17],1,'#8e6246');segment(c,[-5,0],[8,0],2,'#71553a');
    if(actor.attackTime>0&&actor.attackTime<actor.attackDuration-.12&&actor.attackTime>actor.attackDuration-.4){c.beginPath();c.ellipse(0,0,49,49,0,-2.2,-.8);c.strokeStyle='#f3e6bd99';c.lineWidth=3;c.stroke();}
   }else poly(c,[{x:-2,y:0},{x:-2,y:-14},{x:2,y:-20},{x:5,y:0}],'#c5c9bd','#4d534d',1);
   c.restore();
  }
  c.restore();
 }
 actor(c,a,g,time,isPlayer=false){
  const p=project(a.x,a.y),x=p.x,y=p.y,boss=a.kind==='boss',ally=a.role==='hercules',known=enemyIdentified(a,g),h=isPlayer?96:ally?106:boss?104:91;
  oval(c,x+5+(this.light?.sunX??0)*8,y+2,isPlayer?18:17,7,this.light?.night>.5?'#17263935':'#333a3047');
  if(isPlayer){shine(c,x,y-39,66,'#ffcf6a32');oval(c,x,y,25,12,null,'#71e9df',2);this.fish(c,x,y,time,false,a.sight>0);if(a.mirrorTime>0||a.mirrorFade>0)this.waterMirror(c,x,y,time,false,a);}
  else if(known){shine(c,x,y-30,48,'#34213b86');oval(c,x,y,23,11,'#411f4222',boss?'#ff7960':TYPES[a.type].color,2);}
  if(ally)this.herculesAura(c,x,y,time,false);
  this.rig(c,isPlayer?{...a,sprite:0,id:0}:a,x,y,h,time,known);
  if(ally){this.herculesAura(c,x,y,time,true);text(c,'HERCULES',x,y-h-13,10,'#ddb7ff');}
  if(a.frozenUntil>g.elapsed){c.save();c.globalAlpha=.55;oval(c,x,y-47,25,52,'#8971e833','#c6bcff',1.5);for(let j=0;j<3;j++)segment(c,[x-22,y-27-j*22],[x+22,y-38-j*22],1.2,'#d7e2ff');c.restore();text(c,`FROZEN · ${Math.ceil(a.frozenUntil-g.elapsed)}s`,x,(this.finalLabels?.get(a.id)??y-h-28)-7,9,'#ddd9ff');}
  if(ally&&a.guardTime>0){oval(c,x,y-49,29,48,null,'#ddc2ff',3);text(c,'GUARD',x,y-115,9,'#ead5ff');}
  if(ally&&a.hp<a.maxHp){rr(c,x-26,y-h-5,52,4,2,'#192433');rr(c,x-26,y-h-5,52*a.hp/a.maxHp,4,2,'#b385e9');}
  if(isPlayer){this.fish(c,x,y,time,true,a.sight>0);if(a.mirrorTime>0||a.mirrorFade>0)this.waterMirror(c,x,y,time,true,a);}
  else if(known){
   const label=boss?a.label:a.owner==='hercules'?`${TYPES[a.type].label} · Hercules’s list`:TYPES[a.type].label,col=boss?'#ffae78':TYPES[a.type].color;
   c.font='800 12px "Trebuchet MS",sans-serif';const w=c.measureText(label).width+20,ty=this.finalLabels?.get(a.id)??y-h-28;
   rr(c,x-w/2,ty,w,23,7,'#102b3df5',col,1.7);text(c,label,x,ty+16,12);
   if(a.hp<a.maxHp){rr(c,x-22,y-h-1,44,4,2,'#192433');rr(c,x-22,y-h-1,44*a.hp/a.maxHp,4,2,'#ef7a68');}
  }else if(a.kind==='civilian'||['enemy','boss'].includes(a.kind)&&!known){
   poly(c,[{x,y:y-h-16},{x:x+4,y:y-h-10},{x,y:y-h-4},{x:x-4,y:y-h-10}],'#65dff5','#1b8baa');
  }
  if(a.speech&&Math.hypot(a.x-g.player.x,a.y-g.player.y)<600){
   c.font='11px "Nirmala UI",sans-serif';const lines=[];let line='';for(const word of a.speech.split(' ')){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>205){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
   const w=Math.max(...lines.map(line=>c.measureText(line).width))+20,by=y-h-18-lines.length*17;
   rr(c,x-w/2,by-15,w,lines.length*17+13,9,'#fff0d3f2','#a68d61',1);c.fillStyle='#354b50';c.textAlign='center';lines.forEach((line,i)=>c.fillText(line,x,by+i*17));
  }
  if(a.activity==='shopkeeper'&&a.gesture>.2){rr(c,x+19*a.face,y-42,6,7,2,'#e7c694','#6e5240',1);}
  if(a.windup>0&&known){oval(c,x+27,y-h+3,9,12,'#d7a53a','#fff3b8',2);text(c,'!',x+27,y-h+8,16);}
 }
 herculesAura(c,x,y,t,front){
  c.save();c.shadowColor='#b05dff';c.shadowBlur=7;
  for(let j=0;j<3;j++){c.beginPath();let started=false;
   for(let i=0;i<=36;i++){const a=i/36*TAU+t*1.7+j*1.1;if((Math.sin(a)>0)!==front){started=false;continue;}const px=x+Math.cos(a)*(31+j*5),py=y-24-j*25+Math.sin(a)*14;
    if(!started)c.moveTo(px,py);else c.lineTo(px,py);started=true;
   }c.strokeStyle=front?'#d39affba':'#7d46d577';c.lineWidth=1.7;c.stroke();
  }oval(c,x,y,31,13,null,'#b674ed88',1);for(let i=0;i<5;i++){const a=t*1.3+i*1.25;if((Math.sin(a)>0)===front)oval(c,x+Math.cos(a)*39,y-15-((t*18+i*17)%93),1.3,2,'#dab3ff');}c.restore();
 }
 waterMirror(c,x,y,time,front,a){
  const active=a.mirrorTime>0,fade=active?Math.min(1,(3-a.mirrorTime)/.12+.15):Math.max(0,(a.mirrorFade??0)/.45),grow=active?1:1+(1-fade)*.12;
  c.save();c.translate(x,y-45);c.scale(grow,grow);c.globalAlpha=fade;
  if(!front){shine(c,0,0,74,'#83d4d827');oval(c,0,0,43,58,'#8bdde52b','#e9d18aaa',1.8);}
  else{oval(c,0,0,43,58,'#b4edee13','#e6f9eeae',1.4);c.beginPath();c.ellipse(-3,-3,36,51,-.06,-2.8,-1.45);c.strokeStyle='#f3ffeccc';c.lineWidth=3;c.stroke();
   c.beginPath();c.ellipse(4,3,39,53,.06,.1,1.25);c.strokeStyle='#e7c46aaa';c.lineWidth=2;c.stroke();
   for(let i=0;i<4;i++){const py=35-((time*23+i*23)%83);oval(c,-20+Math.sin(time*2+i)*8,py,1.4,2.4,'#e2ffec99');}
  }c.restore();
 }
 effects(c,g){
  for(const e of g.effects){c.save();const p=project(e.x,e.type==='number'?e.y+100:e.y);
   if(e.type==='slash'&&e.age<.3){const direction=project(Math.cos(e.angle),Math.sin(e.angle));c.translate(p.x,p.y-36);c.rotate(Math.atan2(direction.y,direction.x));c.globalAlpha=1-e.age/.3;c.strokeStyle='#fff0b1';c.shadowColor='#ffcd61';c.shadowBlur=12;c.lineWidth=5;c.beginPath();c.ellipse(0,0,53,32,0,-1+e.age*3,.8+e.age*3);c.stroke();}
   if(e.type==='pulse'){const r=e.age/1.5*RULES.sightRange;c.globalAlpha=(1-e.age/1.5)*.55;this.ground(c);oval(c,e.x,e.y,r,r,null,'#ffe9a7',3);}
   if(e.type==='freeze'){c.globalAlpha=Math.max(0,1-e.age/3);this.ground(c);const r=55+Math.min(1,e.age*2)*220;oval(c,e.x,e.y,r,r,'#9673d718','#d4c6ff',3);oval(c,e.x,e.y,r*.8,r*.8,null,'#aa90eb',1.5);}
   if(e.type==='number'){c.globalAlpha=Math.min(1,(1.2-e.age)*3);c.shadowColor='#162733';c.shadowBlur=4;text(c,e.text,p.x,p.y-105-e.age*32,15,e.color);}
   if(e.type==='vanish'||e.type==='arrival'||e.type==='verdict'){const count=e.type==='verdict'?28:12;for(let i=0;i<count;i++){const a=i*TAU/count,r=e.age*(e.type==='verdict'?175:80);c.globalAlpha=Math.max(0,1-e.age*1.6);oval(c,p.x+Math.cos(a)*r,p.y-30+Math.sin(a)*r*.5,e.type==='verdict'?3:2,2,'#ffe290');}}
   if(e.type==='impact'){c.globalAlpha=Math.max(0,1-e.age*3);this.ground(c);oval(c,e.x,e.y,e.range,e.range,null,'#ff9c70',2);}
   if(e.type==='strike'&&e.age<.22){const dir=project(Math.cos(e.angle),Math.sin(e.angle)),length=Math.hypot(dir.x,dir.y);c.globalAlpha=1-e.age/.22;c.translate(p.x,p.y-(e.kind==='kick'?34:68));c.rotate(Math.atan2(dir.y,dir.x));segment(c,[16,-5],[55,2],e.kind==='slap'?3:6,'#ffebb0');}
   if(e.type==='contact'){c.globalAlpha=Math.max(0,1-e.age*4);const yy=p.y-(e.kind==='kick'?34:72);for(let i=0;i<7;i++){const a=i*TAU/7,r=6+e.age*60;segment(c,[p.x+Math.cos(a)*r,yy+Math.sin(a)*r],[p.x+Math.cos(a)*(r+7),yy+Math.sin(a)*(r+7)],2,'#fff0b1');}}
   if(e.type==='shot'){const from=project(e.fromX,e.fromY);c.globalAlpha=Math.max(0,1-e.age*9);segment(c,[from.x,from.y-48],[p.x,p.y-44],2,'#ffd18b');oval(c,from.x,from.y-48,7,4,'#fff1a4');}
   if(e.type==='grab'){c.globalAlpha=Math.max(0,1-e.age*4);oval(c,p.x,p.y-45,24+e.age*25,15,null,'#caa7de',2);}
   if(e.type==='mirror'||e.type==='deflect'){c.globalAlpha=Math.max(0,1-e.age*2);oval(c,p.x,p.y-42,45+e.age*35,62+e.age*20,null,'#ffe8a0',2);}
   if(e.type==='pocket-note'){c.globalAlpha=Math.min(1,(8-e.age)*2);rr(c,p.x-7,p.y-18,14,18,2,'#f0dec0','#946bb7',1);segment(c,[p.x-4,p.y-12],[p.x+4,p.y-12],1,'#785795');segment(c,[p.x-4,p.y-8],[p.x+3,p.y-8],1,'#785795');}
   if(e.type==='trail'){c.globalAlpha=Math.max(0,.23-e.age*.7);oval(c,p.x,p.y-40,17,35,'#ffdc83');}c.restore();
  }
 }
 render(g,t,started){
  this.openDoors=g.houseDoors;
  this.light=daylightAt(g.elapsed);
  const c=this.c,v=this.view,sw=v.width/v.scale,sh=v.height/v.scale,p=project(g.player.x,g.player.y);
  this.occlusionPeople=[p,...g.actors.filter(a=>!a.dead&&(a.finalEnemy||a.role==='hercules'&&g.phase==='final')).map(a=>project(a.x,a.y))];
  this.stallOccluders=FUCHKA_STALLS.filter(s=>Math.hypot(s.x-g.player.x,s.y-g.player.y)<450).map(s=>project(s.x,s.y));
  this.finalLabels=new Map();const boxes=[];
  for(const a of g.actors.filter(a=>a.finalEnemy&&!a.dead).sort((a,b)=>project(a.x,a.y).y-project(b.x,b.y).y)){
   const q=project(a.x,a.y);c.font='800 12px "Trebuchet MS",sans-serif';const w=c.measureText(a.label).width+20,box={x:q.x-w/2,y:q.y-132,w};
   while(boxes.some(b=>Math.abs(box.y-b.y)<27&&box.x<b.x+b.w+4&&box.x+box.w+4>b.x))box.y-=30;
   boxes.push(box);this.finalLabels.set(a.id,box.y);
  }
  c.layer?.('ground');
  const focus=g.cinematic?.focus?project(g.cinematic.focus.x,g.cinematic.focus.y):p;this.camera.x+=(focus.x-this.camera.x)*.12;this.camera.y+=(focus.y-55-this.camera.y)*.12;
  v.x=this.camera.x-sw/2;v.y=this.camera.y-sh/2;
  c.setTransform(v.dpr,0,0,v.dpr,0,0);c.fillStyle=this.light.sky;c.fillRect(0,0,v.width,v.height);if(!this.loaded)return;
  c.scale(v.scale,v.scale);c.translate(-v.x,-v.y);c.save();this.ground(c);c.scale(1/this.floorScale,1/this.floorScale);c.drawImage(this.floor,0,0);c.restore();
  c.layer?.('world');
  if(g.player.sight>0){c.fillStyle='#15345b18';c.fillRect(v.x,v.y,sw,sh);}
  for(const a of g.actors)if(a.windup>0&&!a.dead&&enemyIdentified(a,g)){
   c.save();this.ground(c);const radius=a.range??(a.kind==='boss'?currentBoss(g).range:52),progress=1-a.windup/a.windupMax;
   oval(c,a.attackX,a.attackY,radius,radius,`rgba(233,76,47,${.12+progress*.25})`,'#ffd391',2);c.restore();
  }
  const drawList=this.objects.filter(o=>o.p.x>v.x-o.width&&o.p.x<v.x+sw+o.width&&o.depth>v.y-40&&o.depth-(o.height??300)<v.y+sh);
  for(const a of [...g.actors.filter(a=>!a.dead&&houseVisible(a)),{...g.player,id:0,isPlayer:true}]){const q=project(a.x,a.y);if(q.x>v.x-100&&q.x<v.x+sw+100&&q.y>v.y-30&&q.y<v.y+sh+150)drawList.push({kind:'actor',actor:a,depth:q.y+(['entering','exiting'].includes(a.homePhase)?35:0)});}
  for(const vehicle of g.traffic??[]){const q=project(vehicle.x,vehicle.y);if(q.x>v.x-150&&q.x<v.x+sw+150&&q.y>v.y-40&&q.y<v.y+sh+150)drawList.push({kind:'rickshaw',vehicle,p:q,depth:q.y+9,width:170,height:160});}
  addMetroCars(drawList,g,v);drawList.sort((a,b)=>a.depth-b.depth);
  for(const o of drawList)if(o.kind==='actor'){c.save();c.globalAlpha=o.actor.houseAlpha??1;
   if(g.cinematic&&!o.actor.isPlayer&&o.actor.role!=='hercules'&&(Math.hypot(o.actor.x-g.player.x,o.actor.y-g.player.y)<180||g.cinematic.focus&&Math.hypot(o.actor.x-g.cinematic.focus.x,o.actor.y-g.cinematic.focus.y)<180))c.globalAlpha*=.32;
   this.actor(c,o.actor,g,t,!!o.actor.isPlayer);c.restore();}else this.drawObject(c,o,p,t);
  c.layer?.('lighting');this.drawLighting(c,drawList);c.layer?.('effects');this.effects(c,g);
  c.layer?.('guidance');
  const objective=objectivePosition(g);
  if(started&&!g.cinematic&&objective&&Math.hypot(objective.x-g.player.x,objective.y-g.player.y)>300){
   const q=project(objective.x,objective.y),x=Math.max(v.x+55,Math.min(v.x+sw-55,q.x)),y=Math.max(v.y+180,Math.min(v.y+sh-145,q.y));
   if(Math.hypot(q.x-p.x,q.y-p.y)>Math.min(sw,sh)*.32){
    c.save();c.translate(x,y);c.rotate(Math.atan2(q.y-y,q.x-x));poly(c,[{x:12,y:0},{x:-8,y:-7},{x:-4,y:0},{x:-8,y:7}],g.phase==='boss'?'#ff936e':'#fadd83','#273b46',2);c.restore();
    c.shadowColor='#112433';c.shadowBlur=4;text(c,g.phase==='final'?'HERCULES · EAST JUNCTION':g.phase==='boss'?currentBoss(g).name:'Distant disturbance',x,y+23,11);c.shadowBlur=0;
   }
  }
 }
 drawLighting(c,visible){
  const l=this.light,v=this.view,sw=v.width/v.scale,sh=v.height/v.scale;c.save();
  c.globalAlpha=l.sunlight*.18;shine(c,v.x+sw*.12,v.y+sh*.08,Math.max(sw,sh)*.95,'#ffe0a055');
  c.globalAlpha=l.night*.48;c.fillStyle='#102752';c.fillRect(v.x,v.y,sw,sh);
  if(l.night>.005){
   const sources=visible.filter(o=>o.kind==='lamp'||o.kind==='utility'||o.fuchka).slice(0,WORLD_RULES.maxLightPools);
   for(const o of sources){const {x,y}=o.p,dx=o.kind==='lamp'?22:o.kind==='utility'?10:0,dy=o.kind==='utility'?-140:o.kind==='lamp'?-64:-65;
    c.globalAlpha=l.night*.78;shine(c,x+dx,y+dy,44,'#ffc268aa');
    c.save();c.globalAlpha=l.night*.7;c.translate(x+dx+7,y-3);c.scale(1,.4);shine(c,0,0,70,'#ffd18466');c.restore();
   }
  }c.restore();
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
  for(const ring of ROUNDABOUTS)oval(c,ring.x,ring.y,ring.outer*.65,ring.outer*.65,'#43665b','#e7d59a',16);
  segment(c,[METRO_LINE.from.x,METRO_LINE.from.y],[METRO_LINE.to.x,METRO_LINE.to.y],large?20:30,'#65b99a');
  if(g.metro?.active){const train=metroPosition(g.metro);oval(c,train.x,train.y,large?35:50,large?35:50,'#f4ebc2','#216c58',8);}
  const b=currentBoss(g),[bx,by]=NODES[b.node];
  if(g.phase==='boss'&&g.actors.some(a=>a.kind==='boss'&&enemyIdentified(a,g)))oval(c,bx,by,large?65:90,large?65:90,'#ff8b6a','#fff2bd',10);
  if(g.phase==='final'){const h=g.actors.find(a=>a.role==='hercules');if(h)oval(c,h.x,h.y,large?65:90,large?65:90,'#bd8bf5','#fff2bd',10);for(const a of g.actors)if(a.finalEnemy&&enemyIdentified(a,g))oval(c,a.x,a.y,large?32:42,large?32:42,'#ff8b6a');}
  for(const s of FUCHKA_STALLS){const used=g.fuchka?.shops.find(shop=>shop.id===s.id)?.used;oval(c,s.vendor.x,s.vendor.y,large?34:46,large?34:46,used?'#677f72':'#9ae0a1','#ebdba1',large?6:10);if(large)text(c,'FUCHKA',s.vendor.x,s.vendor.y+90,43,used?'#a9b9aa':'#bdedb1');}
  for(const a of g.actors)if(!a.dead&&enemyIdentified(a,g)&&a.kind==='enemy')oval(c,a.x,a.y,large?28:32,large?28:32,'#d28e9c');
  oval(c,g.player.x,g.player.y,large?55:75,large?55:75,'#68f2e8','#fff7b9',large?10:20);
  if(large){for(const [label,id]of[['MIRPUR 10','c'],['METRO','n2'],['BOUNDARY RD','f1'],['EAST MARKET','e2'],['KATHALTOLA RD','h2']]){
   const[x,y]=NODES[id];c.shadowColor='#112333';c.shadowBlur=4;text(c,label,x,y-125,58,'#fff0ca');c.shadowBlur=0;
  }}c.restore();
 }
}

