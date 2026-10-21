import {NODES,ROADS,WORLD,inside,random} from './engine-v3.mjs';
import {project,METRO_LINE,ROUNDABOUTS,SCENERY} from './scene-v3.mjs';
import {metroPosition} from './city-systems.mjs';
const cityTau=Math.PI*2;
function cityPolygon(c,points,fill,stroke=null,width=1){c.beginPath();for(let i=0;i<points.length;i++)c[i?'lineTo':'moveTo'](points[i].x,points[i].y);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function cityOval(c,x,y,rx,ry,fill,stroke=null,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,cityTau);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function cityLine(c,a,b,width,color){c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function citySprite(painter,c,key,index,x,y,w,h){const s=painter.cells[key]?.[index];if(s)c.drawImage(painter.images[key],s.x,s.y,s.w,s.h,x,y,w,h);}
function linePoint(t){const {from,to}=METRO_LINE;return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};}
export function addCityDetails(painter,c){
 const rng=random(1642026),objects=painter.objects;
 // Furnish residual lots with planted pockets instead of bare background triangles.
 for(let y=130;y<WORLD.height-80;y+=88)for(let x=130;x<WORLD.width-80;x+=88){
  if(inside(x,y,-40)||objects.some(o=>o.kind==='building'&&Math.abs(o.x-x)<o.w*.55+12&&Math.abs(o.y-y)<o.d*.55+12))continue;
  const p=project(x,y),choice=rng();
  if(choice<.56)objects.push({kind:'tree',x,y,p,depth:p.y,width:84,height:105,small:true});
  else objects.push({kind:'garden',x,y,p,depth:p.y,width:50,height:50,seed:choice});
 }
 for(const road of ROADS){
  const a=NODES[road.a],b=NODES[road.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,ny=(b[0]-a[0])/length;
  let last=null;
  for(let d=110;d<length;d+=340){
   const x=a[0]+(b[0]-a[0])*d/length+nx*(road.width/2+29),y=a[1]+(b[1]-a[1])*d/length+ny*(road.width/2+29),p=project(x,y);
   if(SCENERY.some(o=>Math.hypot(o.x-x,o.y-y)<80))continue;
   if(ROUNDABOUTS.some(r=>Math.hypot(r.x-x,r.y-y)<r.outer+35))continue;
   const o={kind:'utility',x,y,p,depth:p.y,width:150,height:190,wireTo:last?.p??objects.find(n=>n.kind==='utility'&&Math.hypot(n.x-x,n.y-y)>90&&Math.hypot(n.x-x,n.y-y)<480)?.p};objects.push(o);last=o;
   if(rng()>.28){const px=x+nx*25,py=y+ny*25,q=project(px,py);objects.push({kind:'planter',x:px,y:py,p:q,depth:q.y,width:37,height:43});}
   // Weathered sidewalk edges, litter and drain gratings are baked, not live allocations.
   c.fillStyle='#4d4840';c.fillRect(x-10,y+12,23,7);c.fillStyle='#c8a270';c.fillRect(x+20,y-4,4,6);
  }
 }
 const segments=30;
 for(let i=0;i<segments;i++){
  const a=linePoint(i/segments),b=linePoint((i+1)/segments),pa=project(a.x,a.y),pb=project(b.x,b.y);
  objects.push({kind:'rail',a,b,pa,pb,p:{x:(pa.x+pb.x)/2,y:(pa.y+pb.y)/2},depth:Math.max(pa.y,pb.y),width:Math.abs(pb.x-pa.x)+100,height:Math.abs(pb.y-pa.y)+170});
 }
 const station=linePoint(METRO_LINE.station),p=project(station.x,station.y);
 objects.push({kind:'station',...station,p,depth:p.y+32,width:235,height:215});
 painter.cityStats={buildings:painter.blockCount,roundabouts:ROUNDABOUTS.length,roads:ROADS.length,objects:objects.length};
}
export function addMetroCars(list,g,view){
 if(!g.metro?.active)return;
 const head=metroPosition(g.metro),dx=METRO_LINE.to.x-METRO_LINE.from.x,dy=METRO_LINE.to.y-METRO_LINE.from.y,length=Math.hypot(dx,dy),ux=dx/length*g.metro.direction,uy=dy/length*g.metro.direction;
 for(let i=0;i<4;i++){
  const x=head.x-ux*i*188,y=head.y-uy*i*188,p=project(x,y);
  if(p.x<view.x-200||p.x>view.x+view.width/view.scale+200||p.y<view.y-80||p.y>view.y+view.height/view.scale+200)continue;
  list.push({kind:'train',x,y,p,ux,uy,index:i,depth:p.y+105,width:240,height:185});
 }
}
function trainCorners(o){const {x,y,ux,uy}=o,vx=-uy,vy=ux;return [[-85,-31],[85,-31],[85,31],[-85,31]].map(([a,b])=>project(x+ux*a+vx*b,y+uy*a+vy*b));}
function trainCar(c,o){
 const corners=trainCorners(o),base=corners.map(p=>({x:p.x,y:p.y-METRO_LINE.elevation-8})),roof=base.map(p=>({x:p.x,y:p.y-30}));
 for(const [a,b]of[[0,1],[1,2],[2,3]]){
  cityPolygon(c,[roof[a],roof[b],base[b],base[a]],a===0?'#d4ded4':'#98aea5','#3b5756',1);
  const pa=roof[a],pb=roof[b];
  cityLine(c,{x:pa.x,y:pa.y+22},{x:pb.x,y:pb.y+22},5,'#197154');
  if(a!==1)for(let i=0;i<7;i++){
   const t=(i+.14)/7,u=(i+.82)/7;
   cityPolygon(c,[{x:pa.x+(pb.x-pa.x)*t,y:pa.y+(pb.y-pa.y)*t+5},{x:pa.x+(pb.x-pa.x)*u,y:pa.y+(pb.y-pa.y)*u+5},{x:pa.x+(pb.x-pa.x)*u,y:pa.y+(pb.y-pa.y)*u+16},{x:pa.x+(pb.x-pa.x)*t,y:pa.y+(pb.y-pa.y)*t+16}],'#183d48','#b4c2b9',.6);
  }
 }
 cityPolygon(c,roof,'#e3e9df','#748e85',1.5);
 const center={x:o.p.x,y:o.p.y-METRO_LINE.elevation-35};
 cityLine(c,{x:center.x-19,y:center.y-2},{x:center.x+16,y:center.y+4},8,'#bdc9bd');
 if(o.index===0){const nose=base[2];cityOval(c,nose.x+2,nose.y-12,3,2,'#ffe9a4');cityOval(c,nose.x-9,nose.y-17,2,2,'#ffe9a4');}
 for(const i of [0,2])cityOval(c,base[i].x,base[i].y+1,5,3,'#263f3c');
}
export function drawCityObject(painter,c,o,player,time){
 const {x,y}=o.p;
 if(o.kind==='garden'){
  if(o.seed>.85)citySprite(painter,c,'decor',3,x-29,y-30,58,33);else citySprite(painter,c,'decor',2,x-23,y-48,46,51);
 }else if(o.kind==='planter')citySprite(painter,c,'decor',2,x-18,y-40,37,43);
 else if(o.kind==='utility'){
  citySprite(painter,c,'street',1,x-22,y-166,47,166);
  if(o.wireTo)for(let i=0;i<3;i++){
   const a={x:x+i*3,y:y-151+i*4},b={x:o.wireTo.x+i*3,y:o.wireTo.y-151+i*4};
   c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+23,b.x,b.y);c.strokeStyle='#302e29';c.lineWidth=1.2;c.stroke();
  }
 }else if(o.kind==='rail'){
  const {pa,pb}=o,h=METRO_LINE.elevation,dx=pb.x-pa.x,dy=pb.y-pa.y,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
  c.save();if(Math.abs(x-player.x)<75&&Math.abs(y-h-player.y+50)<60)c.globalAlpha=.4;
  cityPolygon(c,[{x:pb.x-7,y:pb.y},{x:pb.x+7,y:pb.y},{x:pb.x+7,y:pb.y-h+5},{x:pb.x-7,y:pb.y-h+5}],'#9c9a85','#666e64',1);
  cityOval(c,pb.x+4,pb.y,14,6,'#343c3436');
  const points=[{x:pa.x+nx*23,y:pa.y-h+ny*23},{x:pb.x+nx*23,y:pb.y-h+ny*23},{x:pb.x-nx*23,y:pb.y-h-ny*23},{x:pa.x-nx*23,y:pa.y-h-ny*23}];
  cityPolygon(c,points,'#777e72','#c1c2a5',2);
  cityLine(c,{x:points[0].x,y:points[0].y+8},{x:points[1].x,y:points[1].y+8},6,'#a7aa91');
  for(let i=0;i<7;i++){const t=i/7,px=pa.x+dx*t,py=pa.y+dy*t-h;cityLine(c,{x:px+nx*18,y:py+ny*18},{x:px-nx*18,y:py-ny*18},3,'#454e49');}
  for(const sign of [-1,1])cityLine(c,{x:pa.x+nx*11*sign,y:pa.y-h+ny*11*sign},{x:pb.x+nx*11*sign,y:pb.y-h+ny*11*sign},2.5,'#d9d8bd');
  c.restore();
 }else if(o.kind==='station'){
  c.save();if(o.depth>player.y&&Math.abs(x-player.x)<125&&player.y>y-210)c.globalAlpha=.34;
  const h=METRO_LINE.elevation;
  cityPolygon(c,[{x:x-95,y:y-h+8},{x:x+50,y:y-h-55},{x:x+84,y:y-h-29},{x:x-59,y:y-h+32}],'#d4c8a6','#7d8070',2);
  for(const offset of [-62,53]){cityLine(c,{x:x+offset,y:y-h+3},{x:x+offset,y:y-h-46},4,'#427a66');}
  cityPolygon(c,[{x:x-105,y:y-h-43},{x:x+41,y:y-h-105},{x:x+90,y:y-h-64},{x:x-57,y:y-h-3}],'#306f62','#b0bea2',2);
  for(let i=1;i<12;i++){const t=i/12;cityLine(c,{x:x-105+146*t,y:y-h-43-62*t},{x:x-57+147*t,y:y-h-3-61*t},1,'#639889');}
  cityLine(c,{x:x-105,y:y-h-43},{x:x+41,y:y-h-105},3,'#d0c6a3');
  cityLine(c,{x:x-57,y:y-h-3},{x:x+90,y:y-h-64},4,'#c3b887');
  c.fillStyle='#f3e2a5';c.fillRect(x-64,y-h-26,95,22);c.fillStyle='#194e42';c.font='800 10px sans-serif';c.textAlign='center';c.fillText('মিরপুর ১০ · METRO',x-16,y-h-11);
  // A lit staircase reaches street level; its walking footprint stays on the sidewalk.
  for(let i=0;i<9;i++)cityPolygon(c,[{x:x-103+i*4,y:y-10-i*8},{x:x-70+i*4,y:y-24-i*8},{x:x-70+i*4,y:y-19-i*8},{x:x-103+i*4,y:y-5-i*8}],i%2?'#a7ab92':'#bac0a4','#626e62',.7);
  c.restore();
 }else if(o.kind==='train')trainCar(c,o);
}
