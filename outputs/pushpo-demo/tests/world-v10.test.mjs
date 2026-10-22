import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,eatFuchka,update,inside,clearPath,NODES,ROADS,segmentDistance,random} from '../dist/engine-v3.mjs';
import {FUCHKA_STALLS,SCENERY,ROUNDABOUTS,ACTIVITY_SPOTS} from '../dist/scene-v3.mjs';
import {daylightAt,WORLD_RULES,nearbyFuchka,canEatFuchka} from '../dist/world-v10.mjs';
import {roadsideLitter,drawRoadsideLitter} from '../dist/environment-v5.mjs';
import {pedestrianTrafficClearance} from '../dist/traffic-v5.mjs';
import {Painter} from '../dist/art-v3.mjs';
import {presentWorldHud} from '../dist/world-ui-v10.mjs';
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function atShop(g,s=FUCHKA_STALLS[0]){Object.assign(g.player,s.approach,{hp:40,attackTime:0,dash:0});return nearbyFuchka(g,clearPath);}

test('three accessible curb stalls retain the population, all old NPC activities, and protected individual vendors',()=>{
 for(const seed of [10001,10002,10003]){
  const g=createRun(seed);assert.equal(g.actors.length,180);assert.equal(g.fuchka.shops.length,3);assert.equal(new Set(g.fuchka.shops.map(s=>s.vendorId)).size,3);
  assert.equal(g.actors.filter(a=>a.homeId).length,9);assert.equal(g.actors.filter(a=>a.homeless).length,1);assert.equal(g.actors.filter(a=>a.specialTaunt).length,2);
  for(const original of ACTIVITY_SPOTS)assert(g.actors.some(a=>a.spotId===original.id&&a.activity===original.role));
  for(const s of FUCHKA_STALLS){const shop=g.fuchka.shops.find(a=>a.id===s.id),v=g.actors.find(a=>a.id===shop.vendorId);assert.equal(v.kind,'civilian');assert.equal(v.activity,'fuchka');assert(!v.homeId);assert(!v.specialTaunt);assert(inside(v.x,v.y));assert(inside(s.approach.x,s.approach.y));assert(clearPath(s.approach,v));assert(!inside(s.x,s.y));
   for(const r of ROADS)assert(segmentDistance(s.x,s.y,NODES[r.a],NODES[r.b])>=r.width/2+34,'cart footprint must stay outside the driving lane');
   for(const r of ROUNDABOUTS)assert(Math.hypot(s.x-r.x,s.y-r.y)>r.outer+80,'keep junction driving rings clear');
   for(const t of g.traffic)assert(pedestrianTrafficClearance(v,t)>=30);
  }
 }
});

test('every individual shop heals exactly twenty percent of maximum once, with correct feedback and no kill/score/timer changes',()=>{
 const g=createRun(10004);const kills=g.kills,points=g.points,remaining=g.remaining;
 for(const s of FUCHKA_STALLS){const shop=atShop(g,s);assert.equal(shop.id,s.id);assert(canEatFuchka(g,shop));assert(eatFuchka(g,s.id));assert.equal(g.player.hp,60);assert.equal(g.lastMeal.recovered,20);assert.equal(g.lastMeal.stallId,s.id);assert(g.message.includes('+20 health'));assert(g.effects.some(e=>e.text==='+20 health'));
  g.player.hp=40;const before=JSON.stringify(g);assert(!eatFuchka(g,s.id));assert.equal(JSON.stringify(g),before);assert(!canEatFuchka(g,nearbyFuchka(g,clearPath)));
 }assert(g.fuchka.shops.every(s=>s.used));assert.equal(g.kills,kills);assert.equal(g.points,points);assert.equal(g.remaining,remaining);
 const fresh=createRun(10004);assert(fresh.fuchka.shops.every(s=>!s.used));
});

test('recovery uses maximum rather than current health, clamps without overflow, and saves the meal at full health',()=>{
 for(const maximum of [100,133,200]){const g=createRun(10005);atShop(g);g.player.maxHp=maximum;g.player.hp=maximum*.3;assert(eatFuchka(g));near(g.player.hp,maximum*.5);near(g.lastMeal.recovered,maximum*.2);}
 const g=createRun(10006);atShop(g);g.player.hp=100;assert(!eatFuchka(g));assert(g.fuchka.shops.every(s=>!s.used));g.player.hp=96;assert(eatFuchka(g));assert.equal(g.player.hp,100);assert.equal(g.lastMeal.recovered,4);assert(g.message.includes('+4 health'));assert(g.fuchka.shops[0].used);
});

test('interaction rejects distant/walled, missing, paused, story, cinematic, dead and active-strike requests',()=>{
 const g=createRun(10007);assert(!eatFuchka(g));atShop(g);assert(!eatFuchka(g,'unknown'));assert(!eatFuchka(g,FUCHKA_STALLS[1].id));
 for(const mode of ['paused','lost','won','story','cinematic','dead','strike','dash']){
  const h=createRun(10008);atShop(h);if(['paused','lost','won'].includes(mode))h.status=mode;else if(mode==='story')h.story={beats:[],index:0};else if(mode==='cinematic')h.cinematic={phase:'approach'};else if(mode==='dead')h.player.hp=0;else if(mode==='strike')h.player.attackTime=.2;else h.player.dash=.1;
  assert(!eatFuchka(h));assert(h.fuchka.shops.every(s=>!s.used));
 }
 const absent=createRun(10009);atShop(absent);absent.actors=absent.actors.filter(a=>a.id!==absent.fuchka.shops[0].vendorId);assert(!eatFuchka(absent));
 const s=FUCHKA_STALLS[0],blocked=createRun(10010);Object.assign(blocked.player,{x:s.x,y:s.y,hp:40});assert(!inside(blocked.player.x,blocked.player.y));assert(!eatFuchka(blocked));assert.equal(nearbyFuchka(g,()=>false),null);
});

test('day and night repeat in 210-second phases with continuous dusk/dawn and distinct sky/ambient/sunlight',()=>{
 assert.equal(WORLD_RULES.phaseSeconds,210);assert.equal(daylightAt(0).phase,'day');assert.equal(daylightAt(210).phase,'night');assert.equal(daylightAt(420).phase,'day');assert.equal(daylightAt(630).phase,'night');assert.deepEqual(daylightAt(10),daylightAt(850));
 assert.equal(daylightAt(100).night,0);assert.equal(daylightAt(300).night,1);assert.equal(daylightAt(198).label,'DUSK');assert.equal(daylightAt(408).label,'DAWN');near(daylightAt(198).night,.5);near(daylightAt(408).night,.5);
 assert.notEqual(daylightAt(0).sky,daylightAt(300).sky);assert.equal(daylightAt(300).sunlight,0);assert.equal(daylightAt(0).sunlight,1);
 for(const t of [186,210,396,420]){assert(Math.abs(daylightAt(t-.001).night-daylightAt(t+.001).night)<.001);assert(Math.abs(daylightAt(t-.001).sunX-daylightAt(t+.001).sunX)<.001);}
 for(let t=0;t<1260;t+=.5){const l=daylightAt(t);assert(l.night>=0&&l.night<=1);assert(l.sunlight>=0&&l.sunlight<=1);}
});

test('cycle follows the existing paused game clock without touching chapter or rescue timers and stalls work in all phases',()=>{
 const g=createRun(10011);g.traffic=[];g.spawnClock=999;const actors=g.actors.filter(a=>a.activity==='fuchka');g.actors=actors;
 g.elapsed=185;const remaining=g.remaining;update(g,14);near(g.remaining,remaining-14);assert.equal(daylightAt(g.elapsed).label,'DUSK');
 for(const state of ['paused','story','cinematic']){const before=g.elapsed;if(state==='paused')g.status='paused';else if(state==='story')g.story={beats:[],index:0};else g.cinematic={phase:'dialogue'};update(g,24);assert.equal(g.elapsed,before);g.status='playing';g.story=null;g.cinematic=null;}
 g.finalMission.state='rescue';g.finalMission.remaining=59;g.elapsed=420;g.remaining=321;atShop(g);assert(eatFuchka(g));assert.equal(g.finalMission.remaining,59);assert.equal(g.remaining,321);assert.equal(g.elapsed,420);
 for(const time of [0,198,210,408,420])for(const [i,s]of FUCHKA_STALLS.entries()){const fresh=createRun(10012+i);fresh.elapsed=time;atShop(fresh,s);assert(eatFuchka(fresh));assert.equal(fresh.player.hp,60);fresh.elapsed+=420;fresh.player.hp=40;assert(!eatFuchka(fresh),'a new day must not replenish the shopkeeper’s meal');}
 const rescue=createRun(10015);rescue.chapter=2;rescue.hercules.introComplete=true;rescue.hercules.introStarted=true;rescue.phase='final';Object.assign(rescue.finalMission,{state:'rescue',remaining:60,arrived:false});rescue.elapsed=206;const chapterTime=rescue.remaining;update(rescue,8);assert.equal(rescue.finalMission.remaining,52);assert.equal(rescue.remaining,chapterTime);assert.equal(rescue.elapsed,214);assert.equal(daylightAt(rescue.elapsed).label,'NIGHT');
});

test('increased six-kind litter is deterministic, static, outside traffic lanes and away from stall entrances',()=>{
 const items=roadsideLitter(NODES,ROADS,random(93015));assert(items.length>700&&items.length<1800);assert.equal(new Set(items.map(p=>p.type)).size,6);assert.deepEqual(items,roadsideLitter(NODES,ROADS,random(93015)));
 for(const p of items){assert(!('radius'in p));assert(ROADS.every(r=>segmentDistance(p.x,p.y,NODES[r.a],NODES[r.b])>=r.width/2));assert(FUCHKA_STALLS.every(s=>Math.hypot(p.x-s.approach.x,p.y-s.approach.y)>55));}
 const calls=[],c=new Proxy({}, {get:(_,name)=>(...args)=>calls.push([name,...args]),set:()=>true});drawRoadsideLitter(c,Array.from({length:6},(_,type)=>({x:0,y:0,angle:0,scale:1,type})));assert(calls.some(a=>a[0]==='roundRect')||calls.some(a=>a[0]==='fill'));assert(calls.filter(a=>a[0]==='fillRect').length>20);
 const art=fs.readFileSync(new URL('../dist/art-v3.mjs',import.meta.url),'utf8');assert.equal(art.match(/drawRoadsideLitter\(c,this.litter\)/g).length,1);assert(!art.slice(art.indexOf(' render(g,t,started)')).includes('drawRoadsideLitter('),'no per-frame litter drawing/spawning');
});

test('night lighting is bounded to visible sources, preserves its context, and keeps fixed gradient colors',()=>{
 const calls=[],c=new Proxy({globalAlpha:1}, {get:(o,key)=>key==='createRadialGradient'?()=>({addColorStop:(...args)=>calls.push(['color',...args])}):key in o?o[key]:(...args)=>calls.push([key,...args]),set:(o,key,val)=>{o[key]=val;return true;}}),scene={view:{x:0,y:0,width:1280,height:800,scale:1},light:daylightAt(300)};
 const visible=Array.from({length:100},(_,i)=>({kind:'lamp',p:{x:i*30,y:100}}));Painter.prototype.drawLighting.call(scene,c,visible);assert.equal(calls.filter(a=>a[0]==='scale').length,WORLD_RULES.maxLightPools);const colors=calls.filter(a=>a[0]==='color').map(a=>a[2]);assert(colors.every(v=>['#ffe0a055','#ffc268aa','#ffd18466','transparent'].includes(v)));assert(calls.some(a=>a[0]==='restore'));
});

test('Hercules navigates around a stall using connected roads rather than chasing across a non-walkable block',()=>{
 const g=createRun(10016),vendor=g.actors.find(a=>a.stallId===FUCHKA_STALLS[1].id),h={id:g.nextId++,kind:'ally',role:'hercules',x:505,y:2505,hp:100,maxHp:100,speed:126,face:1,walk:0,attack:0,attackTime:0},target={id:g.nextId++,kind:'enemy',type:1,owner:'hercules',x:280,y:2960,hp:35,maxHp:150,speed:76,wanderSpeed:40,wait:999,cooldown:999,windup:0,flash:0,walk:0,node:'g0'};
 assert(inside(h.x,h.y));assert(!clearPath(h,target,true),'direct ground route crosses a city block even without props');g.actors=[vendor,h,target];g.traffic=[];g.chapter=2;g.phase='interlude';g.player.x=0;g.player.y=0;g.spawnClock=999;Object.assign(g.hercules,{introStarted:true,introComplete:true,actorId:h.id,targetId:target.id,caseClock:999});g.finalMission.state='investigating';g.finalMission.investigationElapsed=-9999;
 for(let i=0;i<1200&&!target.dead;i++){const old={x:h.x,y:h.y};update(g,.03);assert(inside(h.x,h.y));assert(Math.hypot(h.x-old.x,h.y-old.y)<12);}
 assert(target.dead,'Hercules must finish the case instead of stalling at the new cart');assert.equal(g.hercules.kills,1);assert.equal(g.points,0);
});

test('the shared live HUD shows actual recovery, one-use/full-health states, phase and capped health width',()=>{
 const elements=new Map(),doc={getElementById(id){if(!elements.has(id)){const classes=new Set();elements.set(id,{style:{},setAttribute(k,v){this[k]=v;},classList:{toggle(k,on){if(on)classes.add(k);else classes.delete(k);},contains:k=>classes.has(k)}});}return elements.get(id);}};
 const g=createRun(10017);atShop(g);presentWorldHud(doc,g,true,clearPath);assert.equal(doc.getElementById('health-fill').style.width,'40%');assert.equal(doc.getElementById('health-text').textContent,'40 / 100');assert(!doc.getElementById('fuchka-eat').disabled);assert(doc.getElementById('fuchka-action').textContent.includes('+20 health'));
 g.player.hp=96;presentWorldHud(doc,g,true,clearPath);assert(doc.getElementById('fuchka-action').textContent.includes('+4 health'));assert(eatFuchka(g));presentWorldHud(doc,g,true,clearPath);assert.equal(doc.getElementById('health-fill').style.width,'100%');assert(doc.getElementById('fuchka-eat').disabled);assert(doc.getElementById('fuchka-action').textContent.includes('Already enjoyed'));
 atShop(g,FUCHKA_STALLS[1]);g.player.hp=100;presentWorldHud(doc,g,true,clearPath);assert(doc.getElementById('fuchka-action').textContent.includes('meal saved'));assert(!g.fuchka.shops[1].used);
 g.elapsed=300;presentWorldHud(doc,g,false,clearPath);assert(doc.getElementById('world-time').textContent.includes('NIGHT'));assert(doc.getElementById('fuchka-eat').classList.contains('hidden'));g.player.x=0;g.player.y=0;presentWorldHud(doc,g,true,clearPath);assert(doc.getElementById('fuchka-eat').classList.contains('hidden'));
});
