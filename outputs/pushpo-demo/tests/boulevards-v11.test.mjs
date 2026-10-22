import test from 'node:test';
import assert from 'node:assert/strict';
import {NODES,ROADS,inside,segmentDistance,createRun} from '../dist/engine-v3.mjs';
import {ROUNDABOUTS,SCENERY,ACTIVITY_SPOTS,FUCHKA_STALLS,LANDMARKS} from '../dist/scene-v3.mjs';
import {boulevardPaint,streetFurnitureClear} from '../dist/boulevards-v11.mjs';
import {trafficLeg,trafficSample} from '../dist/traffic-v5.mjs';
import {utilitySites} from '../dist/environment-v5.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('only the two requested boulevards widen, with four usable 90-unit lanes and a wider central ring',()=>{
 const names=['Begum Rokeya Sarani','Mirpur Road'];assert.deepEqual([...new Set(ROADS.filter(r=>r.lanes===4).map(r=>r.name))],names);
 for(const r of ROADS.filter(r=>r.lanes===4)){
  assert.equal(r.width,360);const a=NODES[r.a],b=NODES[r.b],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,ny=(b[0]-a[0])/length;
  for(const offset of [-135,-45,45,135])assert(inside((a[0]+b[0])/2+nx*offset,(a[1]+b[1])/2+ny*offset,22),r.name+' lane blocked');
 }assert.equal(ROADS.find(r=>r.name==='Boundary Road').width,120);assert.equal(ROADS.find(r=>r.name==='East junction').width,190);assert.equal(ROUNDABOUTS[0].outer,238);assert.equal(ROUNDABOUTS[0].lanes,2);assert(!inside(ROUNDABOUTS[0].x,ROUNDABOUTS[0].y));
});

test('baked paint separates the four lanes and directions and stops before cross streets and roundabout rings',()=>{
 const marks=boulevardPaint(NODES,ROADS,ROUNDABOUTS);assert.deepEqual(marks,boulevardPaint(NODES,ROADS,ROUNDABOUTS));assert(marks.length>500);
 assert.deepEqual([...new Set(marks.filter(m=>m.kind==='lane').map(m=>m.offset))].sort((a,b)=>a-b),[-90,90]);assert.deepEqual([...new Set(marks.filter(m=>m.kind==='center').map(m=>m.offset))].sort((a,b)=>a-b),[-3,3]);
 for(const name of ['Begum Rokeya Sarani','Mirpur Road'])assert.deepEqual([...new Set(marks.filter(m=>m.road===name&&m.kind==='arrow').map(m=>m.offset))].sort((a,b)=>a-b),[-135,-45,45,135]);
 for(const m of marks)for(const p of [m.a,...(m.b?[m.b]:[])]){assert(ROUNDABOUTS.every(r=>Math.hypot(p.x-r.x,p.y-r.y)>r.outer+12));assert(ROADS.every(r=>r.name===m.road||segmentDistance(p.x,p.y,NODES[r.a],NODES[r.b])>r.width/2+12));}
});

test('rickshaw paths use the outer lane and wide-road stop lines keep minor approaches out of the main carriageway',()=>{
 const path=trafficLeg('w0','w1','w2',NODES,ROADS),a=NODES.w0,b=NODES.w1,length=Math.hypot(b[0]-a[0],b[1]-a[1]),p=trafficSample(path,80);
 close(((p.x-a[0])*(-(b[1]-a[1]))+(p.y-a[1])*(b[0]-a[0]))/length,135);
 const approach=trafficLeg('a1','n1','n2',NODES,ROADS),entry=approach.points.find(p=>Math.abs(p.distance-approach.turnStart)<1e-7);assert(Math.hypot(entry.x-NODES.n1[0],entry.y-NODES.n1[1])>210);
 const outgoing=trafficLeg('w1','w2','c',NODES,ROADS),end=trafficSample(path,path.length),start=trafficSample(outgoing,0);close(end.x,start.x);close(end.y,start.y);
 for(const leg of [['n3','c','s1'],['w2','c','e1'],['c','s1','f3']])for(const q of trafficLeg(...leg,NODES,ROADS).points)assert(inside(q.x,q.y,22));
});

test('curb assets, shopkeepers, buildings and utility sites clear the widened lanes without losing authored roles',()=>{
 const main=ROADS.filter(r=>r.lanes===4),g=createRun(11001);assert.equal(g.actors.length,180);assert.equal(g.traffic.length,14);
 for(const p of SCENERY)for(const r of main)assert(segmentDistance(p.x,p.y,NODES[r.a],NODES[r.b])>=r.width/2+p.radius+18,p.id+' occupies a boulevard');
 for(const a of ACTIVITY_SPOTS){assert(g.actors.some(n=>n.spotId===a.id));assert(inside(a.x,a.y));}
 for(const s of FUCHKA_STALLS){assert(inside(s.vendor.x,s.vendor.y));assert(inside(s.approach.x,s.approach.y));assert(g.fuchka.shops.some(shop=>shop.id===s.id));}
 for(const b of LANDMARKS)for(const dx of [-b.w/2,0,b.w/2])for(const dy of [-b.d/2,0,b.d/2])assert(!inside(b.x+dx,b.y+dy,-12),b.name+' intrudes on a street');
 for(const site of utilitySites(NODES,ROADS))assert(streetFurnitureClear(site,NODES,ROADS));
});
