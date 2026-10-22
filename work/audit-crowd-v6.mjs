import {createRun,update} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
const g=createRun(500);g.phase='boss';g.actors.forEach(a=>{a.kind='civilian';a.aggro=false;});let snapshot;
for(let i=0;i<6000;i++){if(i===5000)snapshot=new Map(g.actors.map(a=>[a.id,{x:a.x,y:a.y}]));update(g,.03);}
const walkers=g.actors.filter(a=>!a.activity&&!a.homeless&&!a.homeId),stuck=walkers.filter(a=>Math.hypot(a.x-snapshot.get(a.id).x,a.y-snapshot.get(a.id).y)<12);
console.log(JSON.stringify({walkers:walkers.length,stuck:stuck.map(a=>({id:a.id,x:Math.round(a.x),y:Math.round(a.y),node:a.node,previous:a.previous,via:a.navVia,near:a.nearby.map(b=>b.id),detour:a.pedestrianDetour?.path,traffic:g.traffic.filter(v=>Math.hypot(v.x-a.x,v.y-a.y)<140).map(v=>v.id)}))}));
