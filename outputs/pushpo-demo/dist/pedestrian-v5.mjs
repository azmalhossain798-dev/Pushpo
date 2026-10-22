import {SCENERY,ROUNDABOUTS} from './scene-v3.mjs';
import {TRAFFIC_RULES,pedestrianTrafficClearance} from './traffic-v5.mjs';
function pedestrianSegmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
export function pedestrianPathClear(a,b,traffic,inside){
 const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/7)),limits=traffic.map(v=>Math.min(18,pedestrianTrafficClearance(a,v)));
 for(let i=1;i<=steps;i++){
  const p={x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps};if(!inside(p.x,p.y))return false;
  if(traffic.some((v,index)=>pedestrianTrafficClearance(p,v)<limits[index]-1e-7))return false;
 }return true;
}
export function pedestrianObstructed(a,target,traffic){
 const distance=Math.hypot(target.x-a.x,target.y-a.y),fraction=Math.min(1,160/(distance||1)),b={x:a.x+(target.x-a.x)*fraction,y:a.y+(target.y-a.y)*fraction};
 for(const v of traffic){if(Math.hypot(v.x-a.x,v.y-a.y)>220)continue;for(let i=1;i<=10;i++){const t=i/10;if(pedestrianTrafficClearance({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},v)<24)return true;}}
 return SCENERY.some(o=>Math.hypot(o.x-a.x,o.y-a.y)<o.radius+170&&pedestrianSegmentDistance(o,a,b)<o.radius+18);
}
export function planPedestrianDetour(a,target,traffic,inside,onward=target){
 const distance=Math.hypot(target.x-a.x,target.y-a.y),fraction=Math.min(1,260/(distance||1)),goal={x:a.x+(target.x-a.x)*fraction,y:a.y+(target.y-a.y)*fraction};
 const nodes=[{x:a.x,y:a.y},goal],add=p=>{if(inside(p.x,p.y)&&traffic.every(v=>pedestrianTrafficClearance(p,v)>=18))nodes.push(p);};
 // Expanded capsule corners and end caps provide routes in either travel direction.
 for(const v of traffic)if(pedestrianSegmentDistance(v,a,goal)<140&&Math.hypot(v.x-a.x,v.y-a.y)<350){
  const extent=TRAFFIC_RULES.halfLength+TRAFFIC_RULES.radius+24,side=TRAFFIC_RULES.radius+24;
  for(const x of [-extent,0,extent])for(const y of [-side,side])add({x:v.x+v.ux*x-v.uy*y,y:v.y+v.uy*x+v.ux*y});
  for(const sign of [-1,1])add({x:v.x+v.ux*extent*sign,y:v.y+v.uy*extent*sign});
 }
 for(const o of [...SCENERY,...ROUNDABOUTS.map(r=>({...r,radius:r.inner}))]){
  if(pedestrianSegmentDistance(o,a,goal)>o.radius+70||Math.hypot(o.x-a.x,o.y-a.y)>350)continue;
  const radius=o.radius+27;for(let i=0;i<12;i++){const angle=i*Math.PI/6;add({x:o.x+Math.cos(angle)*radius,y:o.y+Math.sin(angle)*radius});}
 }
 if(!inside(goal.x,goal.y))return null;
 const occupiedGoal=traffic.some(v=>pedestrianTrafficClearance(goal,v)<18);
 if(occupiedGoal){
  const waiting=nodes.slice(2).filter(p=>traffic.every(v=>pedestrianTrafficClearance(p,v)>=24)).sort((p,q)=>Math.hypot(p.x-onward.x,p.y-onward.y)-Math.hypot(q.x-onward.x,q.y-onward.y));
  if(!waiting.length)return null;nodes[1]=waiting[0];
 }
 const costs=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),closed=new Set(),edges=new Map();costs[0]=0;
 // A small visibility graph is enough for nearby vehicles and parked street props.
 for(let iteration=0;iteration<nodes.length;iteration++){
  let current=-1;for(let i=0;i<nodes.length;i++)if(!closed.has(i)&&(current<0||costs[i]<costs[current]))current=i;
  if(current<0||!Number.isFinite(costs[current]))break;if(current===1){const path=[];for(let i=1;i>0;i=previous[i])path.unshift(nodes[i]);return path;}
  closed.add(current);
  for(let i=1;i<nodes.length;i++){
   if(closed.has(i))continue;const length=Math.hypot(nodes[i].x-nodes[current].x,nodes[i].y-nodes[current].y),cost=costs[current]+length;if(cost>=costs[i])continue;
   const key=current+':'+i;let clear=edges.get(key);if(clear===undefined){clear=pedestrianPathClear(nodes[current],nodes[i],traffic,inside);edges.set(key,clear);}
   if(clear){costs[i]=cost;previous[i]=current;}
  }
 }return null;
}
