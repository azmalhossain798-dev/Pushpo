import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,update,useSight,attack,dash,inside,RULES,formatTime} from '../dist/engine.mjs';
test('run begins with 15 minutes, fair enemy supply, valid spawn points, and randomized layouts',()=>{
 const a=createRun(1),b=createRun(2);
 assert.equal(a.remaining,900);assert.equal(a.points,0);
 assert.equal(a.actors.filter(x=>x.kind==='enemy').length,14);
 assert(a.actors.every(x=>inside(x.x,x.y)));
 assert(a.actors.every(x=>Math.hypot(x.x-a.player.x,x.y-a.player.y)>=145));
 assert.notDeepEqual(a.actors.map(x=>[x.x,x.y,x.variant]),b.actors.map(x=>[x.x,x.y,x.variant]));
 assert.deepEqual(createRun(1).actors,a.actors);
});
test('sight reveals nearby actors, leaves distant ones hidden and respects cooldown',()=>{
 const g=createRun(3),near=g.actors[0],far=g.actors[1];
 near.x=g.player.x+20;near.y=g.player.y;far.x=100;far.y=100;
 assert(useSight(g));assert(near.known);assert(!far.known);assert(!useSight(g));
 assert.equal(g.player.sightCooldown,RULES.sightCooldown);
});
test('combat requires a revealed or aggressive enemy and cannot hurt civilians',()=>{
 const g=createRun(4);g.actors=g.actors.slice(0,1);
 const a=g.actors[0];a.x=g.player.x+30;a.y=g.player.y;
 attack(g);assert.equal(a.hp,150);g.player.attack=0;useSight(g);attack(g);assert.equal(a.hp,120);
 assert.equal(attack(g),false);
 g.player.attack=0;a.kind='civilian';attack(g);assert.equal(a.hp,120);assert.equal(g.points,0);
});
test('ten kills award 150 once, heal Pushpo, and unlock one boss; boss defeat wins',()=>{
 const g=createRun(5);g.actors=[];
 for(let i=0;i<10;i++){
   g.actors.push({id:i,x:g.player.x+30,y:g.player.y,kind:'enemy',known:true,hp:30,maxHp:150,dead:false});
   g.player.attack=0;attack(g);
 }
 assert.equal(g.points,150);assert.equal(g.kills,10);assert(g.bossSpawned);
 assert.equal(g.actors.filter(x=>x.kind==='boss').length,1);
 const boss=g.actors.find(x=>x.kind==='boss');boss.x=g.player.x+30;boss.y=g.player.y;boss.hp=30;
 g.player.attack=0;attack(g);assert.equal(g.status,'won');
 const remaining=g.remaining;update(g,1);assert.equal(g.remaining,remaining);
});
test('timeout ends the run, pauses freeze it and restart resets everything',()=>{
 const g=createRun(6);g.status='paused';update(g,30);assert.equal(g.remaining,900);
 g.status='playing';g.remaining=.02;update(g,.04);assert.equal(g.status,'lost');assert.equal(g.remaining,0);
 const fresh=createRun(7);assert.equal(fresh.remaining,900);assert.equal(fresh.player.hp,100);assert.equal(fresh.points,0);
});
test('incoming hit kills at zero health and dash grants temporary invulnerability',()=>{
 const g=createRun(8);g.player.hp=9;g.actors=[{id:1,x:g.player.x+25,y:g.player.y,kind:'enemy',hp:150,aggro:true,windup:.01,attackX:g.player.x,attackY:g.player.y,flash:0,cooldown:0}];
 update(g,.02);assert.equal(g.player.hp,0);assert.equal(g.status,'lost');
 const h=createRun(9);h.actors=[];assert(dash(h,1,0));assert(h.player.invulnerable>0);assert(!dash(h,1,0));
});
test('movement remains within the street, normalizes diagonals and countdown uses real elapsed time',()=>{
 const g=createRun(10);g.actors=[];
 const x=g.player.x,y=g.player.y;update(g,.05,{x:1,y:1});
 assert(Math.abs(Math.hypot(g.player.x-x,g.player.y-y)-RULES.moveSpeed*.05)<.001);
 for(let i=0;i<1000;i++)update(g,.05,{x:1,y:0});
 assert(inside(g.player.x,g.player.y));
 const before=g.remaining;update(g,10);assert.equal(g.remaining,before-10);
 assert.equal(formatTime(900),'15:00');assert.equal(formatTime(.1),'00:01');assert.equal(formatTime(0),'00:00');
});
