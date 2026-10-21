import test from 'node:test';
import assert from 'node:assert/strict';
import {RULES,TYPES,WORLD,NODES,ROADS,BOSSES,createRun,inside,route,useSight,attack,dash,update,spawnBoss,currentBoss,formatTime} from '../dist/engine-v2.mjs';
test('larger district is connected, every boss location is accessible, and starts are randomized',()=>{
 assert(WORLD.width*WORLD.height>7*1672*941);
 for(const id of Object.keys(NODES))assert(route('n0',id).length>0,`No route to ${id}`);
 for(const b of BOSSES)assert(inside(...NODES[b.node]));
 const a=createRun(1),b=createRun(2);assert(a.actors.every(n=>inside(n.x,n.y)));assert(inside(a.player.x,a.player.y));
 assert.equal(a.remaining,900);assert.equal(a.actors.filter(n=>n.kind==='enemy').length,4);
 assert.notDeepEqual(a.actors,b.actors);assert.deepEqual(a.actors,createRun(1).actors);
});
test('types preserve their distinct health and points',()=>{
 assert.deepEqual(TYPES.map(t=>[t.label,t.health,t.points]),[['Murderer',100,10],['Rapist',150,15],['Snatcher',70,5]]);
 for(let i=0;i<3;i++){
  const g=createRun(i+3);g.actors=[{id:77,x:g.player.x+30,y:g.player.y,kind:'enemy',type:i,known:true,hp:35,maxHp:TYPES[i].health,dead:false}];
  attack(g);assert.equal(g.points,TYPES[i].points);assert.equal(g.kills,1);
 }
});
test('sight identifies nearby targets, never damages civilians, respects cooldown and walls',()=>{
 const g=createRun(9);g.actors=[{id:1,kind:'civilian',x:g.player.x+20,y:g.player.y,hp:100},{id:2,kind:'enemy',type:0,x:g.player.x+45,y:g.player.y,hp:100}];
 attack(g);assert.equal(g.actors[1].hp,100);g.player.attack=0;
 assert(useSight(g));assert(g.actors.every(a=>a.known));assert(!useSight(g));attack(g);assert.equal(g.actors[0].hp,100);assert.equal(g.actors[1].hp,65);
});
test('bosses unlock in order at cumulative thresholds and only the final boss wins',()=>{
 const g=createRun(11);g.actors=[];
 for(let stage=0;stage<3;stage++){
  assert.equal(g.chapter,stage);g.points=BOSSES[stage].threshold-15;
  g.actors.push({id:70+stage,kind:'enemy',type:1,known:true,x:g.player.x+25,y:g.player.y,hp:35,maxHp:150});
  g.player.attack=0;attack(g);
  assert.equal(g.phase,'boss');assert.equal(g.points,BOSSES[stage].threshold);
  const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);assert.equal(b.label,BOSSES[stage].name);assert.equal(b.hp,BOSSES[stage].hp);
  g.remaining=60;g.player.hp=20;b.x=g.player.x+30;b.y=g.player.y;b.hp=35;g.player.attack=0;attack(g);
  if(stage<2){assert.equal(g.status,'playing');assert.equal(g.remaining,900);assert.equal(g.player.hp,100);}
 }
 assert.equal(g.status,'won');assert.deepEqual(g.defeated,BOSSES.map(b=>b.name));
});
test('replenishment never exceeds four regular enemies or two simultaneous attackers',()=>{
 const g=createRun(13);g.elapsed=6;g.actors=g.actors.filter(a=>a.kind==='enemy');
 g.actors.forEach((a,i)=>{a.x=g.player.x+40+i*8;a.y=g.player.y+5;});
 update(g,.02);assert(g.actors.filter(a=>a.aggro).length<=2);
 for(let i=0;i<6;i++){g.actors[0].dead=true;g.spawnClock=0;update(g,.02);assert(g.actors.filter(a=>a.kind==='enemy'&&!a.dead).length<=4);}
});
test('timer begins at 15 minutes, pauses, times out, and resets with a new run',()=>{
 const g=createRun(15);g.status='paused';update(g,20);assert.equal(g.remaining,900);
 g.status='playing';g.remaining=.01;update(g,.02);assert.equal(g.status,'lost');assert.equal(g.remaining,0);
 const fresh=createRun(16);assert.equal(fresh.remaining,900);assert.equal(fresh.chapter,0);assert.equal(fresh.points,0);
 assert.equal(formatTime(900),'15:00');
});
test('movement collides with buildings and the roundabout; dash grants invulnerability',()=>{
 const g=createRun(17);g.actors=[];const before={...g.player};update(g,.05,{x:0,y:1});assert(g.player.y>before.y);assert(inside(g.player.x,g.player.y));
 assert(!inside(1660,1750));assert(dash(g,1,0));assert(g.player.invulnerable>0);assert(!dash(g,1,0));
 for(let i=0;i<2000;i++)update(g,.02,{x:1,y:0});assert(inside(g.player.x,g.player.y));
});
test('lethal attack ends the run and bosses do not duplicate',()=>{
 const g=createRun(18);g.player.hp=7;
 g.actors=[{id:1,kind:'enemy',type:2,x:g.player.x+20,y:g.player.y,windup:.01,attackX:g.player.x,attackY:g.player.y,flash:0,cooldown:0}];
 update(g,.02);assert.equal(g.status,'lost');assert.equal(g.player.hp,0);
 const h=createRun(19);spawnBoss(h);spawnBoss(h);assert.equal(h.actors.filter(a=>a.kind==='boss').length,1);
});
