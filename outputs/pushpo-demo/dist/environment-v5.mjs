import {ISO,project,ROUNDABOUTS,SCENERY,FUCHKA_STALLS} from './scene-v3.mjs';
import {streetFurnitureClear} from './boulevards-v11.mjs';
// Ground-edge anchors, in normalized atlas-cell coordinates: left, front corner, right.
// Two affine facade planes preserve vertical walls while correcting each source camera.
export const BUILDING_PROFILES={
 buildings:[[[.09,.77],[.65,.94],[.94,.79]],[[.08,.81],[.64,.97],[.94,.80]],[[.06,.73],[.62,.94],[.95,.77]],[[.06,.77],[.69,.98],[.96,.82]]],
 city:[[[.319,.945],[.618,1.080],[.896,.930]],[[.129,.943],[.438,1.083],[.720,.928]],[[.315,.881],[.647,.983],[.878,.863]],[[.134,.886],[.448,.983],[.702,.871]]]
};
export function buildingPlanes(b,cell,cellWidth,cellHeight){
 const profile=BUILDING_PROFILES[b.atlas??'buildings'][b.art],col=b.art%2,row=Math.floor(b.art/2);
 const anchors=profile.map(([x,y])=>({x:col*cellWidth+x*cellWidth-cell.x,y:row*cellHeight+y*cellHeight-cell.y}));
 const ground=[project(-b.w/2,b.d/2),project(b.w/2,b.d/2),project(b.w/2,-b.d/2)],vertical=300*ISO.x/(anchors[2].x-anchors[0].x);
 const planes=[0,1].map(i=>{
  const a=anchors[i],z=anchors[i+1],p=ground[i],q=ground[i+1],sx=(q.x-p.x)/(z.x-a.x),shear=((q.y-p.y)-vertical*(z.y-a.y))/(z.x-a.x);
  return {matrix:[sx,shear,0,vertical,p.x-sx*a.x,p.y-shear*a.x-vertical*a.y],left:i?anchors[1].x:0,right:i?cell.w:anchors[1].x};
 });
 const corners=planes.flatMap(p=>[p.left,p.right].flatMap(x=>[0,cell.h].map(y=>({x:p.matrix[0]*x+p.matrix[4],y:p.matrix[1]*x+p.matrix[3]*y+p.matrix[5]}))));
 const minX=Math.floor(Math.min(...corners.map(p=>p.x)))-2,minY=Math.floor(Math.min(...corners.map(p=>p.y)))-2,maxX=Math.ceil(Math.max(...corners.map(p=>p.x)))+2,maxY=Math.ceil(Math.max(...corners.map(p=>p.y)))+2;
 return {anchors,ground,planes,x:minX,y:minY,width:maxX-minX,height:maxY-minY,depth:ground[1].y};
}
export function roadsideLitter(nodes,roads,rng){
 const items=[];
 for(const road of roads){
  const a=nodes[road.a],b=nodes[road.b],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
  for(let distance=55+rng()*45;distance<length-55;distance+=65+rng()*80){
   const side=rng()>.5?1:-1,edge=road.width/2+8+rng()*19,x=a[0]+dx*distance/length+nx*edge*side,y=a[1]+dy*distance/length+ny*edge*side;
   const crossing=roads.some(r=>{const p=nodes[r.a],q=nodes[r.b],u=q[0]-p[0],v=q[1]-p[1],t=Math.max(0,Math.min(1,((x-p[0])*u+(y-p[1])*v)/(u*u+v*v)));return Math.hypot(x-p[0]-u*t,y-p[1]-v*t)<r.width/2+5;});
   if(crossing||ROUNDABOUTS.some(r=>Math.hypot(x-r.x,y-r.y)<r.outer+20)||SCENERY.some(o=>Math.hypot(x-o.x,y-o.y)<o.radius+18)||FUCHKA_STALLS.some(s=>Math.hypot(x-s.approach.x,y-s.approach.y)<60))continue;
   const count=rng()>.65?3:1;
   for(let i=0;i<count;i++)items.push({x:x+nx*(rng()-.5)*8,y:y+ny*(rng()-.5)*8,angle:Math.atan2(dy,dx)+(rng()-.5)*3,type:Math.floor(rng()*6),scale:.9+rng()*1.2});
  }
 }return items;
}
export function drawRoadsideLitter(c,items){
 for(const p of items){
  c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.scale(p.scale,p.scale);
  c.fillStyle='#493e3538';c.fillRect(-3,0,9,4);
  if(p.type===0){c.beginPath();c.roundRect(-5,-2.5,9,5,1.5);c.fillStyle='#a5c8bd';c.fill();c.strokeStyle='#648e83';c.lineWidth=.5;c.stroke();c.fillStyle='#a5c8bd';c.fillRect(3,-1.2,2,2.4);c.fillStyle='#40767f';c.fillRect(5,-1.3,2,2.6);c.fillStyle='#658d83';c.fillRect(-1,-2.3,2,4.6);c.fillStyle='#e5eee3';c.fillRect(-3.5,-1.6,1,3);}
  else if(p.type===1){c.beginPath();c.moveTo(-4,-3);c.lineTo(4,-2);c.lineTo(3,3);c.lineTo(-3,2);c.closePath();c.fillStyle='#d6cdb5';c.fill();c.fillStyle='#8d8d7e';c.fillRect(-2,-1,4,.7);c.fillRect(-2,1,3,.7);}
  else if(p.type===2){c.beginPath();c.moveTo(-4,-2.5);c.lineTo(3,-2);c.lineTo(4,-1);c.lineTo(3,0);c.lineTo(4,2);c.lineTo(-3,2.5);c.lineTo(-4,1);c.lineTo(-3,0);c.closePath();c.fillStyle='#a75848';c.fill();c.fillStyle='#d9b257';c.fillRect(-1,-2,2,4);c.fillStyle='#d4b89a';c.fillRect(2,-1.5,.5,3);}
  else if(p.type===3){c.fillStyle='#cdc4ae';c.fillRect(-3,-2,5,4);c.fillStyle='#8c877b';c.fillRect(-3,-2,1,4);c.fillStyle='#e0ce8e';c.fillRect(2,-1,2,2);}
  else if(p.type===4){c.beginPath();c.moveTo(-6,-4);c.lineTo(5,-3);c.lineTo(6,4);c.lineTo(-5,3);c.closePath();c.fillStyle='#d9d2b9';c.fill();c.fillStyle='#626c64';c.fillRect(-4,-2,7,1);for(let row=0;row<3;row++){c.fillRect(-4,row,2.5,.4);c.fillRect(0,row,3,.4);}c.fillStyle='#8b988b';c.fillRect(-4,-.5,2,2);}
  else{c.beginPath();c.moveTo(-3,-3);c.lineTo(2,-2);c.lineTo(4,1);c.lineTo(1,3);c.lineTo(-3,2);c.closePath();c.fillStyle='#8c9e99';c.fill();c.fillStyle='#bd7362';c.fillRect(-1,-1,3,3);c.fillStyle='#d0d7c9';c.fillRect(-2,-2,3,1);}
  c.restore();
 }
}
export function paintAsphalt(c,rng,size=160){
 c.fillStyle='#535b5a';c.fillRect(0,0,size,size);
 for(let i=0;i<2400;i++){const x=rng()*size,y=rng()*size;c.fillStyle=['#79817b66','#303c3b55','#a2a39133','#c2b79525'][Math.floor(rng()*4)];c.fillRect(x,y,.45+rng()*1.1,.45+rng()*1.1);}
 c.fillStyle='#caa56b12';c.fillRect(0,0,size,size);
 c.beginPath();c.moveTo(12,96);c.lineTo(39,87);c.lineTo(52,91);c.lineTo(73,76);c.strokeStyle='#27343222';c.lineWidth=.8;c.stroke();
}
export function utilitySites(nodes,roads){
 const sites=[];
 for(const road of roads){const a=nodes[road.a],b=nodes[road.b],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
  for(let d=180;d<length-70;d+=540){const x=a[0]+dx*d/length+nx*(road.width/2+29),y=a[1]+dy*d/length+ny*(road.width/2+29),p=project(x,y);
   if(!streetFurnitureClear({x,y},nodes,roads))continue;
   if(SCENERY.some(o=>Math.hypot(o.x-x,o.y-y)<95)||ROUNDABOUTS.some(r=>Math.hypot(r.x-x,r.y-y)<r.outer+45))continue;
   if(sites.some(o=>Math.hypot(o.x-x,o.y-y)<250||Math.hypot(o.p.x-p.x,o.p.y-p.y)<115))continue;
   sites.push({x,y,p,road:road.name});
  }
 }return sites;
}
