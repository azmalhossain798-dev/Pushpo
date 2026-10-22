import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILDING_PROFILES,buildingPlanes,roadsideLitter} from '../dist/environment-v5.mjs';
import {ISO,ROUNDABOUTS,LANDMARKS} from '../dist/scene-v3.mjs';
import {createRun,update,NODES,ROADS,inside,random,segmentDistance} from '../dist/engine-v3.mjs';
import {TRAFFIC_RULES,trafficLeg,trafficSample,trafficSprite,trafficSeparation,pedestrianTrafficClearance,updateTraffic} from '../dist/traffic-v5.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('every building facade lands on the isometric footprint, with upright walls and consistent storey scale',()=>{
 for(const atlas of Object.keys(BUILDING_PROFILES))for(let art=0;art<4;art++){
  const cell={x:art%2*627+20,y:Math.floor(art/2)*627+10,w:590,h:600},layouts=[];
  for(const [w,d]of[[150,150],[86,92],[190,185]]){
   const g=buildingPlanes({atlas,art,w,d},cell,627,627);layouts.push(g);
   for(let i=0;i<2;i++){
    const m=g.planes[i].matrix;assert.equal(m[2],0,'vertical walls must not lean');assert(m[3]>0);
    for(const j of [i,i+1]){const a=g.anchors[j],p=g.ground[j];close(m[0]*a.x+m[4],p.x);close(m[1]*a.x+m[3]*a.y+m[5],p.y);}
    const p=g.ground[i],q=g.ground[i+1];close(Math.abs((q.y-p.y)/(q.x-p.x)),ISO.y/ISO.x);
   }
   assert(g.width>0&&g.height>0);assert(g.planes[0].right===g.planes[1].left);
  }close(layouts[0].planes[0].matrix[3],layouts[1].planes[0].matrix[3]);
 }
});
test('seeded roadside litter stays at the curb rather than the driving lane and includes six kinds',()=>{
 const pieces=roadsideLitter(NODES,ROADS,random(93015));assert(pieces.length>400);assert.equal(new Set(pieces.map(p=>p.type)).size,6);
 assert.deepEqual(pieces,roadsideLitter(NODES,ROADS,random(93015)));
 for(const p of pieces){assert(!('radius'in p),'litter is visual only');assert(ROUNDABOUTS.every(r=>Math.hypot(p.x-r.x,p.y-r.y)>r.outer));assert(ROADS.every(r=>segmentDistance(p.x,p.y,NODES[r.a],NODES[r.b])>=r.width/2));}
});
test('all landmark footprints clear the road and sidewalk plane',()=>{
 for(const b of LANDMARKS)for(const dx of [-b.w/2,0,b.w/2])for(const dy of [-b.d/2,0,b.d/2])assert(!inside(b.x+dx,b.y+dy,-12),b.name+' intrudes on a street');
});
test('rickshaws spawn clear of people and each other, follow connected lanes and select eight directional views',()=>{
 const g=createRun(401);assert.equal(g.traffic.length,TRAFFIC_RULES.count);
 for(const v of g.traffic){assert(inside(v.x,v.y,22));for(const p of [g.player,...g.actors])assert(pedestrianTrafficClearance(p,v)>=30);for(const o of g.traffic)if(o.id>v.id)assert(trafficSeparation(v,o)>=30);}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a),y=Math.sin(a),ux=x/(2*ISO.x)+y/(2*ISO.y),uy=y/(2*ISO.y)-x/(2*ISO.x);assert.equal(trafficSprite({ux,uy}),i);}
 const p=trafficLeg('w2','c','s1',NODES,ROADS),q=trafficLeg('c','s1','s2',NODES,ROADS),last=trafficSample(p,p.length),first=trafficSample(q,0);close(last.x,first.x);close(last.y,first.y);
 const r=ROUNDABOUTS[0];for(const point of p.points)assert(Math.hypot(point.x-r.x,point.y-r.y)>r.inner+TRAFFIC_RULES.radius);
});
test('six minutes of traffic completes turns without overlaps, stuck junctions or leaving walkable roads',()=>{
 const g=createRun(12);g.actors=[];g.player={x:0,y:0};let clearance=Infinity;
 for(let i=0;i<7200;i++){
  updateTraffic(g,.05,NODES,ROADS,inside);
  for(const v of g.traffic){assert(inside(v.x,v.y,22));for(const o of g.traffic)if(o.id>v.id)clearance=Math.min(clearance,trafficSeparation(v,o));}
 }
 assert(clearance>=3);assert(g.traffic.every(v=>v.legs>12),'all vehicles must keep finding onward routes');assert(g.traffic.some(v=>v.wheel>100));
});
test('traffic brakes for a crossing pedestrian and resumes after the crossing clears without health damage',()=>{
 const g=createRun(402),v=g.traffic[0];g.traffic=[v];g.actors=[];
 Object.assign(g.player,trafficSample(v.path,v.distance+105),{hp:37});
 for(let i=0;i<180;i++){updateTraffic(g,.03,NODES,ROADS,inside);assert(pedestrianTrafficClearance(g.player,v)>=16);}
 assert(v.yielding);assert.equal(v.speed,0);assert.equal(g.player.hp,37);const stopped=v.distance;
 g.player.x=0;g.player.y=0;for(let i=0;i<90;i++)updateTraffic(g,.03,NODES,ROADS,inside);assert(v.distance>stopped+10);
});
test('traffic pauses with the run and a restart resets its seeded movement',()=>{
 const g=createRun(403),fresh=createRun(403);assert.deepEqual(g.traffic,fresh.traffic);
 g.status='paused';const before=JSON.stringify(g.traffic);update(g,3);assert.equal(JSON.stringify(g.traffic),before);
});
test('walking NPCs share traffic collision rules and remain clear of rickshaw bodies',()=>{
 const g=createRun(408);g.phase='boss';g.actors.forEach(a=>{a.kind='civilian';a.aggro=false;});
 for(let i=0;i<1200;i++){
  update(g,.03);
  for(const v of g.traffic)for(const p of [g.player,...g.actors.filter(a=>!a.homeId)])assert(pedestrianTrafficClearance(p,v)>=15-1e-7);
 }assert.equal(g.player.hp,100);assert(g.traffic.some(v=>v.legs>1));
});
function stoppedRickshawCrowd(count=1){
 const g=createRun(500),path=trafficLeg('w1','w0','w1',NODES,ROADS),v={id:1,from:'w1',to:'w0',next:'w1',path,distance:130,maxSpeed:0,speed:0,wheel:0,legs:0,...trafficSample(path,130)};
 g.traffic=[v];g.player.x=0;g.player.y=0;g.phase='boss';
 const template=g.actors.find(a=>a.kind==='civilian'&&!a.activity);
 g.actors=Array.from({length:count},(_,i)=>({...template,id:i+1,resident:true,wait:0,speed:44,node:'w1',x:v.x+v.ux*(100+i*8),y:v.y+v.uy*(100+i*8)+(i%3-1)*12}));
 return g;
}
test('a pedestrian passes a stopped rickshaw facing towards them rather than orbiting its front collider',()=>{
 const g=stoppedRickshawCrowd(),v=g.traffic[0],a=g.actors[0];let passed=false;
 for(let i=0;i<1500;i++){update(g,.03);assert(pedestrianTrafficClearance(a,v)>=15-1e-7);if(a.x>v.x+85)passed=true;}
 assert(passed,'pedestrian remained trapped on the front side of the stopped rickshaw');
});
test('a queue of NPCs clears a stopped rickshaw without a permanent crowd jam',()=>{
 const g=stoppedRickshawCrowd(10),v=g.traffic[0],passed=new Set();
 for(let i=0;i<2000;i++){update(g,.03);for(const a of g.actors){assert(pedestrianTrafficClearance(a,v)>=15-1e-7);if(a.x>v.x+85)passed.add(a.id);}}
 assert.equal(passed.size,10,'every queued pedestrian must make progress beyond the rickshaw');
});
test('NPCs bypass a road waypoint occupied by a stopped rickshaw instead of queuing on its collider',()=>{
 const g=stoppedRickshawCrowd(1),path=trafficLeg('w0','w1','w2',NODES,ROADS);let distance=0,best=Infinity;
 for(let d=0;d<path.length;d+=2){const p=trafficSample(path,d),gap=Math.hypot(p.x-712,p.y-1858);if(gap<best){best=gap;distance=d;}}
 const v=g.traffic[0];Object.assign(v,{from:'w0',to:'w1',next:'w2',path,distance,...trafficSample(path,distance)});g.rng=()=>0;
 g.actors.forEach((a,i)=>Object.assign(a,{x:v.x-110-i*10,y:v.y+(i%3-1)*9,node:'w1',previous:'w0'}));const passed=new Set();
 for(let i=0;i<2000;i++){update(g,.03);for(const a of g.actors){assert(pedestrianTrafficClearance(a,v)>=15-1e-7);if(a.x>v.x+90)passed.add(a.id);}}
 assert.equal(passed.size,1,'a traffic-blocked graph waypoint must not become a permanent destination');
});
test('three minutes of city walking does not accumulate a permanent rickshaw crowd jam',()=>{
 const g=createRun(500);g.phase='boss';g.actors.forEach(a=>{a.kind='civilian';a.aggro=false;});let snapshot;
 for(let i=0;i<6000;i++){if(i===5000)snapshot=new Map(g.actors.map(a=>[a.id,{x:a.x,y:a.y}]));update(g,.03);}
 const walkers=g.actors.filter(a=>!a.activity&&!a.homeless&&!a.homeId),stationary=walkers.filter(a=>Math.hypot(a.x-snapshot.get(a.id).x,a.y-snapshot.get(a.id).y)<12);
 assert(walkers.length-stationary.length>=Math.floor(walkers.length*.94),'walking residents must keep progressing through the district');
 assert.equal(stationary.filter(a=>g.traffic.some(v=>Math.hypot(v.x-a.x,v.y-a.y)<140)).length,0,'no permanent stationary queue around traffic');
});
