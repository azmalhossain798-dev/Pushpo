import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRun,spawnBoss,continueStory,update,useSight,useWaterMirror,inside,attack as startAttack} from '../dist/engine-v3.mjs';
import {attack,finishStories} from './combat-helpers.mjs';
import {BOSS_STORY,currentStoryBeat,beginBossStory} from '../dist/story-v6.mjs';
import {BORROWED_LIFE_DAYS,OPENING_STORY,AWAKENING_STORY,HERCULES_DIALOGUE,HERCULES_NOTE,herculesBeats,beginHerculesConversation,chapterClockActive,finalMissionReady} from '../dist/story-v8.mjs';
import {beginHerculesIntro,finishHerculesIntro,recordHerculesKill} from '../dist/hercules-v8.mjs';
import {mirrorAvailable} from '../dist/combat-v7.mjs';
import {actorArtwork} from '../dist/city-systems.mjs';
import {pedestrianTrafficClearance} from '../dist/traffic-v5.mjs';
import {presentStoryCard} from '../dist/story-ui-v8.mjs';
function tick(g,time){for(let t=0;t<time-1e-8;t+=.03)update(g,Math.min(.03,time-t));}
function firstTwo(seed=8802,full=false){
 const g=createRun(seed);if(!full){g.actors=[];g.traffic=[];}g.spawnClock=999;g.player.invulnerable=999;g.kills=10;
 for(let stage=0;stage<2;stage++){
  g.points=stage?300:150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);assert(b);Object.assign(g.player,{x:b.x+30,y:b.y,attack:0});b.hp=35;attack(g);
  assert.equal(currentStoryBeat(g),BOSS_STORY[stage?2:0]);if(stage===0)finishStories(g);
 }return g;
}
function finishEntrance(g){continueStory(g);assert(g.cinematic);let frames=0;while(!g.story&&frames++<1000)update(g,.03);assert(g.story,'Hercules must reach the conversation');return frames;}

test('opening establishes the unknown fish, apartment awakening and 60-day narrative deadline without a day simulation',()=>{
 assert.equal(BORROWED_LIFE_DAYS,60);assert(OPENING_STORY.includes('part of its own life force'));assert(OPENING_STORY.includes('only 60 days'));assert(AWAKENING_STORY.includes('alone in an apartment'));assert(AWAKENING_STORY.includes('freedom to choose'));
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert(html.includes(OPENING_STORY));assert(html.includes(AWAKENING_STORY));assert(html.includes('id="start-label">Get Revenge</span>'));assert(html.includes('BORROWED LIFE · 60 DAYS'));
 const g=createRun(8800);g.status='paused';update(g,60*86400);assert.equal(g.remaining,900);assert(!('day'in g));assert(!('daysRemaining'in g));
});

test('Sumon preserves both existing beats, unlocks Mirror and announces the ten-second cooldown exactly once',()=>{
 const g=createRun(8801);g.actors=[];g.traffic=[];g.points=150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss');b.x=g.player.x+25;b.y=g.player.y;b.hp=35;attack(g);
 assert(mirrorAvailable(g));assert.equal(currentStoryBeat(g),BOSS_STORY[0]);assert(g.unlockNotice.text.includes('10s cooldown'));assert(!useWaterMirror(g));assert(!beginBossStory(g,0));
 continueStory(g);assert.equal(currentStoryBeat(g),BOSS_STORY[1]);continueStory(g);assert(!g.story);assert(!g.cinematic);assert(useWaterMirror(g));assert.equal(g.player.mirrorCooldown,10);assert(!g.hercules.introStarted);
});

test('Hafizur note precedes a physical corner approach and the one-time Hercules conversation, freezing unsafe input and countdown',()=>{
 const g=firstTwo();assert.equal(g.chapter,2);assert.equal(g.phase,'interlude');assert(!g.hercules.introStarted);assert(!finalMissionReady(g));assert(!beginHerculesConversation(g));
 const remaining=g.remaining,frames=finishEntrance(g);assert(frames>5);assert.equal(g.remaining,remaining);assert(g.cinematic.corner);assert(g.actors.some(a=>a.role==='hercules'));assert.equal(currentStoryBeat(g).speaker,'Hercules');assert.equal(currentStoryBeat(g).text,HERCULES_DIALOGUE[0].text);
 assert(!finishHerculesIntro(g),'the introduction cannot finish while subtitles remain');const before=JSON.stringify(g);update(g,120,{x:1,y:0,attack:true});assert.equal(JSON.stringify(g),before);assert(!startAttack(g));assert(!useSight(g));assert(!useWaterMirror(g));
 const seen=[];while(g.story){seen.push(currentStoryBeat(g).id);continueStory(g);}assert.deepEqual(seen,herculesBeats().map(b=>b.id));assert.equal(new Set(seen).size,seen.length);assert(g.hercules.introComplete);assert(!g.cinematic);assert.equal(g.finalMission.lead,'Sohel Rana');assert.equal(g.finalMission.identity,'Anu');assert.equal(g.finalMission.state,'investigating');
 assert(!beginHerculesIntro(g,{}));assert(!beginHerculesConversation(g));assert(!beginBossStory(g,1));assert.equal(g.actors.filter(a=>a.role==='hercules').length,1);
});

test('the approach works among retained crowds and rickshaws, and keeps feet on the street plane',()=>{
 for(const seed of [8803,8804,8805]){
  const g=firstTwo(seed,true),civilianIds=g.actors.filter(a=>a.kind==='civilian').map(a=>a.id),remaining=g.remaining;continueStory(g);assert(g.cinematic);let frames=0;
  while(!g.story&&frames++<1000){update(g,.03);const h=g.actors.find(a=>a.role==='hercules');assert(inside(h.x,h.y));for(const v of g.traffic)assert(pedestrianTrafficClearance(h,v)>=15-1e-7);}
  assert(g.story,`crowded approach stalled for seed ${seed}`);assert.equal(g.remaining,remaining);assert.equal(g.traffic.length,14);assert(civilianIds.every(id=>g.actors.some(a=>a.id===id)));finishStories(g);assert(g.hercules.introComplete);
 }
});

test('Bengali dialogue preserves all seven turns and every paragraph, including Anu, DNA, the river and the offer to help',()=>{
 assert.deepEqual(HERCULES_DIALOGUE.map(t=>t.speaker),['Hercules','Pushpo','Hercules','Pushpo','Hercules','Pushpo','Hercules']);
 assert.equal(HERCULES_DIALOGUE[0].text,'এই যে পুষ্প, আমি হারকিউলিস।');assert.equal(HERCULES_DIALOGUE[1].text,'ও হ্যাঁ, আমি আপনাকে চিনি। আপনার বিষয়ে পত্রিকায় পড়ছিলাম।');assert.equal(HERCULES_DIALOGUE[2].text,'আমি তো তোমার ভক্ত হয়ে গেলাম! একা একজন মেয়ে হয়ে যা করতেছো—insane!');
 const beats=herculesBeats();assert.equal(beats.length,12);for(let i=0;i<7;i++)assert.equal(beats.filter(b=>b.turn===i).map(b=>b.text).join('\n\n'),HERCULES_DIALOGUE[i].text);
 assert(HERCULES_DIALOGUE[5].text.includes("'মালটারে নদীতে ফেলে দিয়ে আয়, হাত-পা বেঁধে।'"));for(const phrase of ['DNA','অনু','আপনার আসল নাম','আপনাকে সাহায্য করবো','খোঁজ নিয়ে আপনাকে জানাচ্ছি'])assert(HERCULES_DIALOGUE[6].text.includes(phrase));
});

test('the shared subtitle presenter exposes readable speaker text and portraits, and ends with investigation rather than a final mission',()=>{
 const elements=new Map(),card={scrollTop:999};const make=()=>{const classes=new Set();return {textContent:'',firstChild:{textContent:''},focus(){this.focused=true;},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,value){if(value)classes.add(c);else classes.delete(c);},contains:c=>classes.has(c)},querySelector:()=>card,offsetWidth:600};};
 const doc={getElementById(id){if(!elements.has(id))elements.set(id,make());return elements.get(id);}},beats=herculesBeats(),g={story:{beats,index:0}};
 for(let i=0;i<beats.length;i++){g.story.index=i;presentStoryCard(doc,g,beats[i]);assert.equal(doc.getElementById('story-text').textContent,beats[i].text);assert.equal(doc.getElementById('story-heading').textContent,beats[i].title);assert(doc.getElementById('story-screen').classList.contains('conversation'));assert.equal(doc.getElementById('story-speaker-hercules').classList.contains('hidden'),beats[i].speaker!=='Hercules');assert.equal(card.scrollTop,0);assert(doc.getElementById('story-next').focused);}
 assert.equal(doc.getElementById('story-next').firstChild.textContent,'Let Hercules investigate ');
});

test('Hercules hunts his own targets, leaves the exact pocket note once per kill and grants no player rewards',()=>{
 const g=firstTwo(8806);finishEntrance(g);finishStories(g);g.finalMission.investigationElapsed=-9999;g.player.x=4370;g.player.y=4200;g.player.invulnerable=999;g.spawnClock=999;const points=g.points,kills=g.kills,hp=g.player.hp,remaining=g.remaining;let last,travel=0;
 for(let i=0;i<4500;i++){const h=g.actors.find(a=>a.role==='hercules');last={x:h.x,y:h.y};update(g,.03);const moved=Math.hypot(h.x-last.x,h.y-last.y);assert(moved<12,'independent movement cannot teleport');travel+=moved;assert(inside(h.x,h.y));}
 assert(g.hercules.kills>=3);assert.equal(g.hercules.notes.length,g.hercules.kills);assert.equal(new Set(g.hercules.notes.map(n=>n.targetId)).size,g.hercules.kills);for(const note of g.hercules.notes){assert.equal(note.text,'Be careful Rapist Hercules is coming');assert.equal(note.location,'victim pocket');}
 assert(travel>900);const h=g.actors.find(a=>a.role==='hercules');assert(Math.hypot(h.x-g.player.x,h.y-g.player.y)>1000,'Hercules must not follow Pushpo');assert.equal(g.points,points);assert.equal(g.kills,kills);assert.equal(g.player.hp,hp);assert.equal(g.remaining,remaining);assert.equal(g.status,'playing');assert(!chapterClockActive(g));
 const target={id:99991,x:h.x,y:h.y,owner:'hercules',dead:false};assert(!recordHerculesKill(g,target));target.dead=true;assert(recordHerculesKill(g,target));assert(!recordHerculesKill(g,target));assert.equal(target.pocketNote,HERCULES_NOTE);
});

test('Hercules is an ally; player intervention in a revealed private case uses normal combat credit without fabricating a Hercules note',()=>{
 const g=firstTwo(8807);finishEntrance(g);finishStories(g);g.spawnClock=999;const h=g.actors.find(a=>a.role==='hercules');g.actors=[h];h.attack=0;h.pendingHit=null;g.player.attack=0;Object.assign(g.player,{x:h.x-30,y:h.y});attack(g);assert.equal(h.hp,100);
 const a={id:g.nextId++,kind:'enemy',type:1,owner:'hercules',x:g.player.x+25,y:g.player.y,hp:35,maxHp:150,known:true,sightRevealed:true,wait:999,speed:40,windup:0,cooldown:999};g.actors.push(a);g.hercules.caseClock=999;g.hercules.targetId=null;g.kills=Math.max(5,g.kills);g.player.sight=5;const points=g.points,kills=g.kills,count=g.hercules.kills;g.player.attack=0;attack(g);assert(a.dead);assert.equal(g.points,points+15);assert.equal(g.kills,kills+1);assert.equal(g.hercules.kills,count);assert(!a.pocketNote);
});

test('independent hunts continue in the populated district without exceeding the regular-enemy cap or ignoring rickshaw colliders',()=>{
 const g=firstTwo(8810,true);finishEntrance(g);finishStories(g);g.finalMission.investigationElapsed=-9999;g.player.invulnerable=999;let clearance=Infinity;
 for(let i=0;i<5000;i++){update(g,.03);const h=g.actors.find(a=>a.role==='hercules');assert(inside(h.x,h.y));for(const v of g.traffic)clearance=Math.min(clearance,pedestrianTrafficClearance(h,v));assert(g.actors.filter(a=>a.kind==='enemy'&&!a.owner&&!a.dead).length<=4);}
 assert(g.hercules.kills>=2,'Hercules must complete his own cases among real crowds and traffic');assert(clearance>=15-1e-7);assert.equal(g.status,'playing');assert.equal(g.points,300);assert.equal(g.kills,10);assert(!g.actors.some(a=>a.label==='Sohel Rana'));
});

test('Sohel Rana stays unavailable from score alone; the investigation interlude has no chapter countdown',()=>{
 const g=firstTwo(8808);g.points=9999;spawnBoss(g);assert(!g.actors.some(a=>a.label==='Sohel Rana'));finishEntrance(g);spawnBoss(g);assert(!g.actors.some(a=>a.label==='Sohel Rana'));finishStories(g);g.phase='hunt';spawnBoss(g);assert(!g.actors.some(a=>a.label==='Sohel Rana'));assert(!finalMissionReady(g));g.phase='interlude';g.remaining=.01;g.player.invulnerable=999;g.finalMission.investigationElapsed=-9999;update(g,901);assert.equal(g.status,'playing');assert.equal(g.remaining,.01);
 const fresh=createRun(8809);assert(!fresh.hercules.introStarted);assert(!fresh.hercules.introComplete);assert.equal(fresh.hercules.notes.length,0);assert(!fresh.finalMission.enabled);
});

test('Hercules front/rear sprites use the generated reference-based RGBA atlas and keep his defining identity',()=>{
 const bytes=fs.readFileSync(new URL('../dist/assets/hercules-v8.png',import.meta.url));assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);assert.equal(bytes[25],6,'RGBA atlas required');
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'74f8ec987da75109920be3b907b8cdebd260e62ce0108e8bcb6032174e73867f');assert.deepEqual(actorArtwork({role:'hercules'},false),{key:'hercules',index:0});assert.deepEqual(actorArtwork({role:'hercules'},true),{key:'hercules',index:1});
});
