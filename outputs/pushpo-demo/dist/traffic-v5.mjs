import {ROUNDABOUTS,SCENERY,project} from './scene-v3.mjs';
export const TRAFFIC_RULES=Object.freeze({count:14,radius:18,halfLength:33,cruise:58,lane:24});
function trafficLinks(nodes,roads){const links=Object.fromEntries(Object.keys(nodes).map(n=>[n,[]]));for(const r of roads){links[r.a].push(r.b);links[r.b].push(r.a);}return links;}
function trafficLane(a,b,road){const length=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/length,uy=(b[1]-a[1])/length;return {ux,uy,offset:road.lanes===4?road.width*3/8:Math.min(TRAFFIC_RULES.lane,road.width*.23)};}
function trafficRoad(roads,a,b){return roads.find(r=>r.a===a&&r.b===b||r.a===b&&r.b===a);}
function trafficJunction(point){return ROUNDABOUTS.find(r=>Math.hypot(point[0]-r.x,point[1]-r.y)<1);}
function trafficCut(point,lane,nodes,roads){
 const ring=trafficJunction(point);if(ring)return ring.outer+35;let cut=70;
 for(const r of roads){const a=nodes[r.a],b=nodes[r.b];if(a!==point&&b!==point)continue;const q=a===point?b:a,dx=q[0]-point[0],dy=q[1]-point[1],sine=Math.abs(lane.ux*dy-lane.uy*dx)/(Math.hypot(dx,dy)||1);if(sine>.3)cut=Math.max(cut,r.width/(2*sine)+35);}
 return cut;
}
function trafficLanePoint(point,lane,advance){return {x:point[0]+lane.ux*advance-lane.uy*lane.offset,y:point[1]+lane.uy*advance+lane.ux*lane.offset};}
export function trafficLeg(from,to,next,nodes,roads){
 const a=nodes[from],b=nodes[to],z=nodes[next],incoming=trafficLane(a,b,trafficRoad(roads,from,to)),outgoing=trafficLane(b,z,trafficRoad(roads,to,next));
 const start=trafficLanePoint(a,incoming,trafficCut(a,incoming,nodes,roads)),entry=trafficLanePoint(b,incoming,-trafficCut(b,incoming,nodes,roads)),exit=trafficLanePoint(b,outgoing,trafficCut(b,outgoing,nodes,roads)),points=[start],ring=trafficJunction(b);
 const line=(p,q)=>{const steps=Math.max(1,Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/14));for(let i=1;i<=steps;i++)points.push({x:p.x+(q.x-p.x)*i/steps,y:p.y+(q.y-p.y)*i/steps});};
 line(start,entry);const turnStart=points[points.length-1];
 if(ring){
  const radius=ring.lanes===2?ring.inner+(ring.outer-ring.inner)*.75:(ring.outer+ring.inner)/2+5,first=Math.atan2(entry.y-ring.y,entry.x-ring.x),last=Math.atan2(exit.y-ring.y,exit.x-ring.x),angle=(last-first+Math.PI*2)%(Math.PI*2)||Math.PI*2;
  line(entry,{x:ring.x+Math.cos(first)*radius,y:ring.y+Math.sin(first)*radius});
  const steps=Math.ceil(angle*radius/12);for(let i=1;i<=steps;i++){const t=first+angle*i/steps;points.push({x:ring.x+Math.cos(t)*radius,y:ring.y+Math.sin(t)*radius});}
  line(points[points.length-1],exit);
 }else{
  // The quadratic rounds turns; lane endpoints match the following leg exactly.
  const control={x:b[0]-(incoming.uy+outgoing.uy)*(incoming.offset+outgoing.offset)/4,y:b[1]+(incoming.ux+outgoing.ux)*(incoming.offset+outgoing.offset)/4};
  for(let i=1;i<=16;i++){const t=i/16,u=1-t;points.push({x:u*u*entry.x+2*u*t*control.x+t*t*exit.x,y:u*u*entry.y+2*u*t*control.y+t*t*exit.y});}
 }
 let length=0;for(let i=0;i<points.length;i++){if(i)length+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);points[i].distance=length;}
 return {points,length,turnStart:turnStart.distance};
}
export function trafficSample(path,distance){
 const points=path.points,d=Math.max(0,Math.min(path.length,distance));let i=1;while(i<points.length-1&&points[i].distance<d)i++;
 const a=points[i-1],b=points[i],length=b.distance-a.distance||1,t=(d-a.distance)/length,dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy)||1;
 return {x:a.x+dx*t,y:a.y+dy*t,ux:dx/n,uy:dy/n};
}
function trafficPointDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
export function trafficBody(v){const h=TRAFFIC_RULES.halfLength;return [{x:v.x-v.ux*h,y:v.y-v.uy*h},{x:v.x+v.ux*h,y:v.y+v.uy*h}];}
export function pedestrianTrafficClearance(p,v){return trafficPointDistance(p,...trafficBody(v))-TRAFFIC_RULES.radius;}
export function trafficSeparation(a,b){
 const [p,q]=trafficBody(a),[r,s]=trafficBody(b),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 if(cross(p,q,r)*cross(p,q,s)<0&&cross(r,s,p)*cross(r,s,q)<0)return -TRAFFIC_RULES.radius*2;
 return Math.min(trafficPointDistance(p,r,s),trafficPointDistance(q,r,s),trafficPointDistance(r,p,q),trafficPointDistance(s,p,q))-TRAFFIC_RULES.radius*2;
}
export function trafficSprite(v){const heading=project(v.ux,v.uy);return (Math.round(Math.atan2(heading.y,heading.x)/(Math.PI/4))+8)%8;}
function trafficPathSafe(path,inside){return path.points.every(p=>inside(p.x,p.y,22)&&!SCENERY.some(o=>Math.hypot(p.x-o.x,p.y-o.y)<o.radius+TRAFFIC_RULES.radius+6));}
const trafficNetworks=new WeakMap();
function trafficNetwork(nodes,roads,inside){
 let network=trafficNetworks.get(nodes);if(network)return network;network=new Map();const links=trafficLinks(nodes,roads);
 for(const from of Object.keys(nodes))for(const to of links[from]){
  const choices=[];for(const next of [...links[to].filter(n=>n!==from),from]){const path=trafficLeg(from,to,next,nodes,roads);if(trafficPathSafe(path,inside))choices.push({next,path});}
  network.set(`${from}:${to}`,choices);
 }
 // Do not send traffic into a road that has no safe onward route.
 let changed=true;while(changed){changed=false;for(const [key,choices]of network){const to=key.split(':')[1],valid=choices.filter(c=>network.get(`${to}:${c.next}`)?.length);if(valid.length!==choices.length){network.set(key,valid);changed=true;}}}
 trafficNetworks.set(nodes,network);return network;
}
export function createTraffic(rng,nodes,roads,inside,people=[]){
 const result=[],links=trafficLinks(nodes,roads),network=trafficNetwork(nodes,roads,inside),preferred=['w2','e1','n3','s1'];
 for(let tries=0;result.length<TRAFFIC_RULES.count&&tries<1400;tries++){
  const from=tries<preferred.length?preferred[tries]:Object.keys(nodes)[Math.floor(rng()*Object.keys(nodes).length)],to=links[from][Math.floor(rng()*links[from].length)],choices=network.get(`${from}:${to}`);
  if(!choices?.length)continue;const {next,path}=choices[Math.floor(rng()*choices.length)];
  const distance=Math.max(0,path.turnStart-130)*(.12+rng()*.6),v={id:result.length+1,from,to,next,path,distance,speed:0,maxSpeed:TRAFFIC_RULES.cruise+rng()*16,wheel:0,moving:false,yielding:false,legs:0,...trafficSample(path,distance)};
  if(result.some(other=>trafficSeparation(v,other)<30)||people.some(p=>pedestrianTrafficClearance(p,v)<30))continue;result.push(v);
 }return result;
}
export function updateTraffic(g,dt,nodes,roads,inside){
 if(!g.traffic?.length)return;const network=trafficNetwork(nodes,roads,inside),people=[g.player,...g.actors.filter(a=>!a.dead&&!a.insideHouse&&!['entering','exiting'].includes(a.homePhase))],reservations=g.trafficReservations??=(new Map());
 for(const [node,id]of reservations){const v=g.traffic.find(v=>v.id===id);if(!v||v.to!==node)reservations.delete(node);}
 const requests=g.traffic.filter(v=>v.distance>v.path.turnStart-155).sort((a,b)=>(a.path.turnStart-a.distance)-(b.path.turnStart-b.distance)||a.id-b.id);
 for(const v of requests)if(!reservations.has(v.to))reservations.set(v.to,v.id);
 for(const v of g.traffic){
  let desired=v.maxSpeed;const near=people.filter(p=>Math.hypot(p.x-v.x,p.y-v.y)<190),look=Math.min(v.path.length,v.distance+35+v.speed*1.1);
  for(let d=v.distance;d<=look;d+=12){const probe=trafficSample(v.path,d);
   if(d>v.path.turnStart-90&&reservations.get(v.to)!==v.id){desired=0;break;}
   if(near.some(p=>pedestrianTrafficClearance(p,probe)<23)||g.traffic.some(other=>other!==v&&trafficSeparation(probe,other)<(probe.ux*other.ux+probe.uy*other.uy<-.5?3:12))){desired=0;break;}
  }
  const speed=desired?Math.min(desired,v.speed+dt*22):Math.max(0,v.speed-dt*120),step=speed*dt,candidate=trafficSample(v.path,v.distance+step);
  const blocked=near.some(p=>pedestrianTrafficClearance(p,candidate)<16)||g.traffic.some(other=>other!==v&&trafficSeparation(candidate,other)<3)||!inside(candidate.x,candidate.y,22);
  v.yielding=desired===0||blocked;v.moving=!blocked&&step>.001;v.speed=blocked?0:speed;
  if(!blocked){v.distance=Math.min(v.path.length,v.distance+step);Object.assign(v,candidate);v.wheel+=step*.15;}
  if(v.distance>=v.path.length-.01){
   const from=v.to,to=v.next,choices=network.get(`${from}:${to}`),forward=choices.filter(c=>c.next!==from),pool=forward.length?forward:choices,chosen={from,to,...pool[Math.floor(g.trafficRng()*pool.length)]};
   if(chosen){Object.assign(v,chosen,{distance:0,legs:v.legs+1});}else{v.speed=0;v.yielding=true;}
  }
 }
}
