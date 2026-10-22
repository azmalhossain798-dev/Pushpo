import {NODES,ROADS,WORLD,inside,random} from './engine-v3.mjs';
import {project,METRO_LINE,ROUNDABOUTS,SCENERY} from './scene-v3.mjs';
import {metroPosition} from './city-systems.mjs';
import {utilitySites} from './environment-v5.mjs';
import {streetFurnitureClear} from './boulevards-v11.mjs';
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
 const poles=utilitySites(NODES,ROADS);
 for(const site of poles){const {x,y,p}=site,previous=objects.filter(o=>o.kind==='utility'&&o.road===site.road&&Math.hypot(o.x-x,o.y-y)<800).at(-1);
  objects.push({kind:'utility',...site,depth:p.y,width:150,height:190,wireTo:previous?.p});
  if(rng()>.28){const px=x+21,py=y+12,q=project(px,py);if(streetFurnitureClear({x:px,y:py},NODES,ROADS,18))objects.push({kind:'planter',x:px,y:py,p:q,depth:q.y,width:37,height:43});}
  c.fillStyle='#4d4840';c.fillRect(x-10,y+12,23,7);
 }
 painter.objects=painter.objects.filter(o=>o.kind!=='lamp'||!poles.some(p=>Math.hypot(o.p.x-p.p.x,o.p.y-p.p.y)<48));
 const segments=30;
 for(let i=0;i<segments;i++){
  const a=linePoint(i/segments),b=linePoint((i+1)/segments),pa=project(a.x,a.y),pb=project(b.x,b.y);
  painter.objects.push({kind:'rail',a,b,pa,pb,pier:i%2===0,gantry:i%3===0,p:{x:(pa.x+pb.x)/2,y:(pa.y+pb.y)/2},depth:Math.max(pa.y,pb.y),width:Math.abs(pb.x-pa.x)+150,height:Math.abs(pb.y-pa.y)+240});
 }
 const station=linePoint(METRO_LINE.station),p=project(station.x,station.y);
 painter.objects.push({kind:'station',...station,p,depth:p.y+145,width:235,height:270});
 painter.cityStats={buildings:painter.blockCount,roundabouts:ROUNDABOUTS.length,roads:ROADS.length,objects:painter.objects.length,poles:poles.length};
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
 const corners=trainCorners(o),base=corners.map(p=>({x:p.x,y:p.y-METRO_LINE.elevation-5})),roof=base.map(p=>({x:p.x,y:p.y-42}));
 const wheelSide=o.ux-o.uy>=0?1:-1;
 for(const offset of [-57,57]){const p=project(o.x+o.ux*offset-o.uy*31*wheelSide,o.y+o.uy*offset+o.ux*31*wheelSide);cityOval(c,p.x,p.y-METRO_LINE.elevation-2,6,3.5,'#303d3b','#9b9f92',1);}
 const faces=[[0,1],[1,2],[2,3],[3,0]].sort((a,b)=>(base[a[0]].y+base[a[1]].y)-(base[b[0]].y+base[b[1]].y));
 for(const [a,b]of faces){
  const pa=roof[a],pb=roof[b],face=(t,u,top,bottom,color)=>cityPolygon(c,[{x:pa.x+(pb.x-pa.x)*t,y:pa.y+(pb.y-pa.y)*t+top},{x:pa.x+(pb.x-pa.x)*u,y:pa.y+(pb.y-pa.y)*u+top},{x:pa.x+(pb.x-pa.x)*u,y:pa.y+(pb.y-pa.y)*u+bottom},{x:pa.x+(pb.x-pa.x)*t,y:pa.y+(pb.y-pa.y)*t+bottom}],color);
  cityPolygon(c,[pa,pb,base[b],base[a]],'#f4f1e7','#777f77',1);
  face(0,1,36,41,'#a33332');face(0,1,1,3,'#2b7567');
  if(a===0||a===2){for(let i=0;i<8;i++){
   const t=(i+.15)/8,u=(i+.83)/8,door=i===2||i===5;face(t,u,door?5:8,door?35:26,door?'#d7d7c9':'#183335');
   if(door){face(t,t+.018,7,34,'#328575');face(u-.018,u,7,34,'#b7473d');face((t+u)/2-.005,(t+u)/2+.005,7,34,'#707c76');}
   else face(t+.015,u-.015,9,11,'#718c87');
  }}else if(a===1&&o.index===0){face(.05,.95,1,28,'#087c73');face(.17,.83,7,24,'#142f35');face(.20,.80,8,10,'#6b9c9a');face(.49,.51,8,24,'#0a4c50');face(.08,.92,28,36,'#eeeede');
   const p={x:(pa.x+pb.x)/2,y:(pa.y+pb.y)/2+32};cityOval(c,p.x-7,p.y,2,2,'#fff4c1');cityOval(c,p.x+7,p.y,2,2,'#fff4c1');
  }
 }
 cityPolygon(c,roof,'#d9d9cb','#878e83',1.2);
 for(const offset of [-43,28]){const p=project(o.x+o.ux*offset,o.y+o.uy*offset),q={x:p.x,y:p.y-METRO_LINE.elevation-49};cityPolygon(c,[{x:q.x-12,y:q.y-3},{x:q.x+7,y:q.y-7},{x:q.x+15,y:q.y+1},{x:q.x-5,y:q.y+5}],'#b8b8a9','#92998b',.7);}
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
  const {pa,pb}=o,h=METRO_LINE.elevation,dx=pb.x-pa.x,dy=pb.y-pa.y,wx=o.b.x-o.a.x,wy=o.b.y-o.a.y,length=Math.hypot(wx,wy),vx=-wy/length,vy=wx/length,side=project(vx,vy),nx=side.x,ny=side.y;
  c.save();if(Math.abs(x-player.x)<75&&Math.abs(y-h-player.y+50)<60)c.globalAlpha=.4;
  if(o.pier){cityOval(c,pb.x+6,pb.y,23,8,'#343c3436');cityPolygon(c,[{x:pb.x-12,y:pb.y},{x:pb.x+9,y:pb.y+3},{x:pb.x+9,y:pb.y-h+46},{x:pb.x+35,y:pb.y-h+22},{x:pb.x-39,y:pb.y-h+22},{x:pb.x-12,y:pb.y-h+46}],'#c6bca6','#8d9586',1);cityLine(c,{x:pb.x-8,y:pb.y-1},{x:pb.x-8,y:pb.y-h+42},2,'#e4dcc4');}
  const points=[{x:pa.x+nx*58,y:pa.y-h+ny*58},{x:pb.x+nx*58,y:pb.y-h+ny*58},{x:pb.x-nx*58,y:pb.y-h-ny*58},{x:pa.x-nx*58,y:pa.y-h-ny*58}],front=ny>0?[0,1]:[3,2];
  const a=points[front[0]],b=points[front[1]];cityPolygon(c,[a,b,{x:b.x,y:b.y+18},{x:a.x,y:a.y+18}],'#afa995','#79877e',1);
  cityPolygon(c,points,'#d1c9b1','#eee6cc',1.5);cityLine(c,{x:a.x,y:a.y+3},{x:b.x,y:b.y+3},3,'#e8e0c7');
  for(let i=0;i<9;i++){const t=i/9,px=pa.x+dx*t,py=pa.y+dy*t-h;cityLine(c,{x:px+nx*24,y:py+ny*24},{x:px-nx*24,y:py-ny*24},3,'#92978a');}
  for(const sign of [-1,1])cityLine(c,{x:pa.x+nx*15*sign,y:pa.y-h+ny*15*sign},{x:pb.x+nx*15*sign,y:pb.y-h+ny*15*sign},2,'#65766e');
  for(const sign of [-1,1])cityLine(c,{x:pa.x+nx*54*sign,y:pa.y-h+ny*54*sign-7},{x:pb.x+nx*54*sign,y:pb.y-h+ny*54*sign-7},3,'#c5bcaa');
  if(o.gantry){for(const sign of [-1,1]){const foot={x:pb.x+nx*55*sign,y:pb.y-h+ny*55*sign};cityLine(c,foot,{x:foot.x,y:foot.y-73},3,'#65928e');cityLine(c,{x:foot.x,y:foot.y-73},{x:pb.x+nx*15*sign,y:pb.y-h-70+ny*15*sign},2,'#b4c6b6');for(let i=0;i<3;i++)cityOval(c,foot.x+sign*i*3,foot.y-69,1.5,2,'#d5ded0');}}
  cityLine(c,{x:pa.x,y:pa.y-h-67},{x:pb.x,y:pb.y-h-67},.8,'#445d5b');cityLine(c,{x:pa.x,y:pa.y-h-61},{x:pb.x,y:pb.y-h-61},.7,'#718983');
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
