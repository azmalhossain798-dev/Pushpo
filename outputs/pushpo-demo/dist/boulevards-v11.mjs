// Baked road paint shares the exact simulation widths and junction geometry.
function boulevardSegmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a[0]-dx*t,p.y-a[1]-dy*t);}
export function streetFurnitureClear(p,nodes,roads,padding=12){return roads.every(r=>boulevardSegmentDistance(p,nodes[r.a],nodes[r.b])>=r.width/2+padding);}
export function boulevardPaint(nodes,roads,rings){
 const marks=[];
 for(const road of roads.filter(r=>r.lanes===4)){
  const a=nodes[road.a],b=nodes[road.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/length,uy=(b[1]-a[1])/length;
  const point=(d,offset)=>({x:a[0]+ux*d-uy*offset,y:a[1]+uy*d+ux*offset});
  const clear=p=>rings.every(r=>Math.hypot(p.x-r.x,p.y-r.y)>r.outer+12)&&roads.every(r=>r===road||r.name===road.name||boulevardSegmentDistance(p,nodes[r.a],nodes[r.b])>r.width/2+12);
  for(const offset of [-road.width/2+6,-road.width/4,-3,3,road.width/4,road.width/2-6]){
   const kind=Math.abs(offset)===3?'center':Math.abs(offset)===road.width/4?'lane':'edge';
   for(let d=10;d<length-10;d+=8){const p=point(d,offset),q=point(Math.min(d+8,length-10),offset);
    if(kind==='lane'&&Math.floor(d/32)%2||!clear(p)||!clear(q))continue;
    marks.push({kind,a:p,b:q,offset,road:road.name});
   }
  }
  for(const offset of [-road.width*3/8,-road.width/8,road.width/8,road.width*3/8]){
   const p=point(length*.52,offset);if(!clear(p)||!clear(point(length*.52+36,offset))||!clear(point(length*.52-36,offset)))continue;
   marks.push({kind:'arrow',a:p,ux:ux*Math.sign(offset),uy:uy*Math.sign(offset),offset,road:road.name});
  }
 }
 return marks;
}
export function drawBoulevardPaint(c,marks){
 c.save();c.lineCap='butt';
 for(const m of marks){
  c.strokeStyle=m.kind==='center'?'#e5c678':'#e1debc';c.lineWidth=m.kind==='lane'?2.2:1.6;c.beginPath();
  if(m.kind==='arrow'){
   const {x,y}=m.a,ux=m.ux,uy=m.uy;c.lineWidth=3;c.moveTo(x-ux*16,y-uy*16);c.lineTo(x+ux*16,y+uy*16);c.moveTo(x+ux*6-uy*9,y+uy*6+ux*9);c.lineTo(x+ux*18,y+uy*18);c.lineTo(x+ux*6+uy*9,y+uy*6-ux*9);
  }else{c.moveTo(m.a.x,m.a.y);c.lineTo(m.b.x,m.b.y);}c.stroke();
 }c.restore();
}
export function drawBoulevardCrosswalks(c,nodes,roads){
 c.save();c.fillStyle='#dfd6b0';
 for(const id of ['n2','s1','w2','e1']){
  const r=roads.find(r=>r.lanes===4&&(r.a===id||r.b===id)),a=nodes[r.a],b=nodes[r.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/length,uy=(b[1]-a[1])/length,[x,y]=nodes[id];
  c.save();c.translate(x+ux*85,y+uy*85);c.rotate(Math.atan2(uy,ux));
  for(let d=-r.width/2+14;d<r.width/2-8;d+=22)c.fillRect(-14,d,28,12);c.restore();
 }c.restore();
}
