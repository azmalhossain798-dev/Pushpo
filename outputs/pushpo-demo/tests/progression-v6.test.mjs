import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,update,useSight,dash,spawnBoss,continueStory,currentBoss,NODES,ROADS,inside,random} from '../dist/engine-v3.mjs';
import {attack,finishStories,finishFinalEncounter} from './combat-helpers.mjs';
import {BOSS_STORY,RAPIST_APPROACH_LINE,beginBossStory,currentStoryBeat} from '../dist/story-v6.mjs';
import {HOUSE_PORTALS,houseVisible,houseCollidable,updateHouseVisit} from '../dist/homes-v6.mjs';
import {separateCrowd,crowdNeighbors} from '../dist/city-systems.mjs';
import {utilitySites,paintAsphalt} from '../dist/environment-v5.mjs';
import {pedestrianTrafficClearance} from '../dist/traffic-v5.mjs';

function hit(g,a){if(a.type===1){g.kills=Math.max(g.kills,5);g.player.sight=5;}a.x=g.player.x+25;a.y=g.player.y;a.hp=35;a.known=true;a.sightRevealed=true;g.player.attack=0;assert(attack(g));assert(a.dead);}
function killBoss(g){spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);assert(b);hit(g,b);return b;}
function reward(g,type){const a={id:g.nextId++,kind:'enemy',type,maxHp:150,dead:false};g.actors.push(a);hit(g,a);}

test('Sumon verdict and reflection are ordered, one-shot, and freeze combat, countdown and metro until dismissed',()=>{
 const g=createRun(801);g.actors=[];g.points=195;g.player.hp=31;g.remaining=20;killBoss(g);
 assert.equal(g.status,'playing');assert.equal(g.chapter,1);assert.equal(g.phase,'hunt');assert.equal(g.points,195);assert.equal(g.player.hp,31);
 assert.equal(currentStoryBeat(g),BOSS_STORY[0]);assert.equal(currentBoss(g).threshold,345);assert.equal(g.remaining,900);
 const before=JSON.stringify(g);update(g,120,{x:1,y:1,attack:true});assert.equal(JSON.stringify(g),before);
 assert(!attack(g));assert(!useSight(g));assert(!dash(g,1,0));assert(!beginBossStory(g,0));
 assert(!continueStory(g));assert.equal(currentStoryBeat(g),BOSS_STORY[1]);assert(continueStory(g));assert(!g.story);
 assert.equal(g.points,195,'reading story must not grant free points');assert(g.message.includes('150 more points'));assert(!g.actors.some(a=>a.kind==='boss'&&!a.dead));
 for(let i=0;i<9;i++)reward(g,1);assert.equal(g.points,330);assert.equal(g.phase,'hunt');
 reward(g,1);assert.equal(g.points,345);assert.equal(g.phase,'boss');assert.equal(g.actors.filter(a=>a.kind==='boss'&&!a.dead).length,1);assert(g.message.includes('Hafizur Rahman awaits'));
 const hafiz=g.actors.find(a=>a.kind==='boss'&&!a.dead);hit(g,hafiz);assert.equal(currentStoryBeat(g),BOSS_STORY[2]);assert(!beginBossStory(g,1));assert.equal(g.player.hp,31);
 assert(continueStory(g));assert.equal(g.chapter,2);assert.equal(g.phase,'interlude');assert(!g.story);finishStories(g);assert(g.hercules.introComplete);assert(!g.finalMission.enabled);g.points=999;spawnBoss(g);assert(!g.actors.some(a=>a.kind==='boss'&&!a.dead));g.points=345;finishFinalEncounter(g);
 assert.equal(g.status,'won');assert.equal(g.defeated.length,3);assert(!g.story,'victory follows the completed farewell');assert.equal(g.player.hp,31);
});

test('Bengali story strings retain the requested exact text',()=>{
 assert.equal(BOSS_STORY[0].text,'সঠিক আইন ও বিচারের অভাবে নিজের উপর হওয়া অন্যায়ের বিচার আমি নিজে নিজেই করবো!\n\nআমাকে CNG করে তুলে নিয়ে যাওয়ার অপরাধে সুমন মিয়ার মৃত্যুদণ্ড কার্যকর হলো');
 assert.equal(BOSS_STORY[1].text,'সুমন মিয়া কি যেন বললো? .... উম... ও সব দোষ ঐ হাফিজুর রহমানের?? তার মানে আমাকে ১ সপ্তাহ ধরে চোখে কাপড় বেঁধে যে এত কিছু করেছে, সেই হাফিজুর রহমান!');
 assert.equal(BOSS_STORY[2].text,'CNG চালক আমাকে তোর হাতে তুলে দিলো আর তুই আমার সাথে এক সপ্তাহ ধরে যে অন্যায় অত্যাচার করেছিস, সেই অন্যায়ের জন্য তোর মৃত্যুদণ্ড কার্যকর হলো।');
});

test('rapist approach dialogue stays hidden before Sight and speaks once per encounter with a distant reset',()=>{
 const g=createRun(802),a=g.actors.find(a=>a.kind==='enemy');Object.assign(a,{type:1,known:false,sightRevealed:false,x:g.player.x+100,y:g.player.y,wait:999,cooldown:999,windup:0,aggro:false});
 g.actors=[a];g.traffic=[];g.spawnClock=999;g.elapsed=10;update(g,.03);assert(!a.speech);assert(!a.encounterSpoken);
 g.kills=5;assert(useSight(g));update(g,.03);assert.equal(a.speech,RAPIST_APPROACH_LINE);assert(a.encounterSpoken);const remaining=a.speechTime;
 update(g,.03);assert(a.speechTime<remaining,'same encounter must not restart dialogue');
 a.speechTime=0;update(g,.03);assert.equal(a.speech,'');assert(a.encounterSpoken);
 const original={x:g.player.x,y:g.player.y};g.player.x=0;g.player.y=0;
 for(let i=0;i<280;i++)update(g,.03);assert(!a.encounterSpoken);
 Object.assign(g.player,original);a.x=g.player.x+100;a.y=g.player.y;assert(useSight(g));update(g,.03);assert.equal(a.speech,RAPIST_APPROACH_LINE);
});

test('home visits preserve NPC identities, reserve doors, fade inside and wait for a clear exit',()=>{
 const g=createRun(803),visitors=g.actors.filter(a=>a.homeId),a=visitors[0],h=HOUSE_PORTALS.find(h=>h.id===a.homeId),b=visitors.find(v=>v!==a&&v.homeId===a.homeId);
 assert.equal(g.actors.length,180);assert.equal(visitors.length,9);assert.equal(g.actors.filter(a=>a.activity&&!a.stallId).length,10);assert.equal(g.actors.filter(a=>a.homeless).length,1);
 assert(inside(h.approach.x,h.approach.y));const ids=g.actors.map(a=>a.id);Object.assign(a,{...h.approach,homeClock:0});
 const navigate=()=>assert.fail('already at doorway');updateHouseVisit(g,a,.03,navigate,()=>false);assert.equal(a.homePhase,'approach','occupied threshold must delay entering');
 updateHouseVisit(g,a,.03,navigate,()=>true);assert.equal(a.homePhase,'entering');assert.equal(g.houseLocks[h.id],a.id);assert(!houseCollidable(a));
 Object.assign(b,{...h.approach,homeClock:0});updateHouseVisit(g,b,.03,navigate,()=>true);assert.equal(b.homePhase,'approach');
 for(let i=0;i<50;i++)updateHouseVisit(g,a,.03,navigate,()=>true);assert.equal(a.homePhase,'indoors');assert(!houseVisible(a));assert(!houseCollidable(a));assert(!g.houseLocks[h.id]);assert(a.homeClock>0);
 a.homeClock=0;updateHouseVisit(g,a,.03,navigate,()=>false);assert(a.insideHouse,'do not emerge into a pedestrian or vehicle');
 updateHouseVisit(g,a,.03,navigate,()=>true);assert.equal(a.homePhase,'exiting');assert(houseVisible(a));assert(g.houseDoors[h.id]>0);
 for(let i=0;i<45;i++)updateHouseVisit(g,a,.03,navigate,()=>true);assert.equal(a.homePhase,'roam');assert(houseCollidable(a));assert.equal(a.x,h.approach.x);assert.equal(a.y,h.approach.y);assert(a.homeClock>60);assert.deepEqual(g.actors.map(a=>a.id),ids);
});

test('engine routes home visitors through a complete visit without vehicle or visible NPC overlap',()=>{
 const g=createRun(804),a=g.actors.find(a=>a.homeId),h=HOUSE_PORTALS.find(h=>h.id===a.homeId);g.actors=[a];g.player.x=0;g.player.y=0;g.phase='boss';Object.assign(a,{x:h.approach.x+30,y:h.approach.y+10,homeClock:0});
 const phases=new Set();for(let i=0;i<2200;i++){update(g,.03);phases.add(a.homePhase);if(houseCollidable(a))for(const v of g.traffic)assert(pedestrianTrafficClearance(a,v)>=15-1e-7);}
 for(const phase of ['approach','entering','indoors','exiting','roam'])assert(phases.has(phase),`missing ${phase}`);
});

test('crowd separation resolves exact overlap and keeps anchored activities fixed',()=>{
 const actors=[{id:1,x:0,y:0},{id:2,x:0,y:0},{id:3,x:15,y:0,activity:'talk'}];
 for(let i=0;i<15;i++)separateCrowd(actors,(a,x,y)=>{a.x+=x;a.y+=y;});
 for(const a of actors)for(const b of actors)if(a.id<b.id)assert(Math.hypot(a.x-b.x,a.y-b.y)>=27.9);assert.equal(actors[2].x,15);assert.equal(actors[2].y,0);
 actors.push({id:4,x:0,y:0,insideHouse:true});crowdNeighbors(actors,{x:5,y:0});assert(actors[0].nearby.some(a=>a.id===0));assert(!actors[0].nearby.some(a=>a.id===4));
});

test('opposing pedestrian streams pass each other with body spacing instead of a head-on deadlock',()=>{
 const g=createRun(807),template=g.actors.find(a=>a.kind==='civilian'&&!a.activity);g.traffic=[];g.phase='boss';g.player.x=0;g.player.y=0;
 g.actors=Array.from({length:10},(_,i)=>({...template,id:100+i,resident:true,wait:0,speed:44,x:i<5?350-i*32:620+(i-5)*32,y:i<5?1875:1845,node:i<5?'w1':'w0',previous:i<5?'w0':'w1'}));
 const passed=new Set();let closest=Infinity;
 for(let i=0;i<1400;i++){update(g,.03);for(const a of g.actors){if(a.id<105?a.x>590:a.x<400)passed.add(a.id);for(const b of g.actors)if(b.id>a.id)closest=Math.min(closest,Math.hypot(a.x-b.x,a.y-b.y));}}
 assert.equal(passed.size,10,'both walking streams must pass the encounter');assert(closest>=22,'body spacing must remain stable while passing');
});

test('utility sites have logical world and screen spacing and asphalt contains seeded aggregate',()=>{
 const sites=utilitySites(NODES,ROADS),oldCount=ROADS.reduce((n,r)=>n+Math.max(0,Math.ceil((Math.hypot(NODES[r.a][0]-NODES[r.b][0],NODES[r.a][1]-NODES[r.b][1])-250)/340)),0);assert(sites.length>25&&sites.length<oldCount,'reduce duplicate roadside poles');assert.deepEqual(sites,utilitySites(NODES,ROADS));
 for(const a of sites)for(const b of sites)if(a!==b){assert(Math.hypot(a.x-b.x,a.y-b.y)>=250);assert(Math.hypot(a.p.x-b.p.x,a.p.y-b.p.y)>=115);}
 const calls=[],c=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});paintAsphalt(c,random(1));assert(calls.filter(c=>c[0]==='fillRect').length>2400);assert(calls.some(c=>c[0]==='stroke'));
});
