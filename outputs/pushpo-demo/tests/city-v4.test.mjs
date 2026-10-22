import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,update,useSight,spawnBoss,RULES,BOSSES,inside,route,objectivePosition,random,continueStory} from '../dist/engine-v3.mjs';
import {attack,finishStories,finishFinalEncounter} from './combat-helpers.mjs';
import {ROUNDABOUTS,METRO_LINE,LANDMARKS,ACTIVITY_SPOTS} from '../dist/scene-v3.mjs';
import {OPENING_STORY,AWAKENING_STORY} from '../dist/story-v8.mjs';
import {CITY_POPULATION,SNATCHER_TAUNT,enemyIdentified,actorArtwork,createMetro,updateMetro,metroPosition} from '../dist/city-systems.mjs';
test('180 NPCs preserve original activities and one roaming homeless resident remains approximately 0.5 percent',()=>{
 const g=createRun(700),homeless=g.actors.filter(a=>a.homeless);
 assert.equal(g.actors.length,CITY_POPULATION);assert.equal(homeless.length,1);assert(Math.abs(homeless.length/g.actors.length-.005)<.001);
 assert.equal(g.actors.filter(a=>a.activity&&!a.stallId).length,ACTIVITY_SPOTS.length);
 assert(g.actors.some(a=>a.spotId==='tea-seller'));assert(g.actors.some(a=>a.spotId==='chat-a'));
 assert(homeless[0].resident);assert(!homeless[0].activity);assert(inside(homeless[0].x,homeless[0].y));
});
test('expanded intersections and circular roads are connected and their islands are solid',()=>{
 for(const id of ['j3','k6','t3','u6','u0'])assert(route('n0',id).length>1);
 assert.equal(ROUNDABOUTS.length,3);
 for(const r of ROUNDABOUTS){assert(!inside(r.x,r.y));assert(inside(r.x+(r.outer+r.inner)/2,r.y));}
 for(const b of LANDMARKS.filter(l=>l.atlas==='city'))for(const dx of [-b.w/2,b.w/2])for(const dy of [-b.d/2,b.d/2])assert(!inside(b.x+dx,b.y+dy),b.name+' intrudes on a walkable road');
});
test('rapist appearance, markers and objective stay civilian-like until Sight, including attempted auto-aggro',()=>{
 const g=createRun(701),a={id:1,kind:'enemy',type:1,sprite:6,x:g.player.x+40,y:g.player.y,hp:150,maxHp:150,speed:76,wanderSpeed:40,known:true,aggro:true,windup:0,cooldown:0,flash:0,wait:1};
 g.actors=[a];g.elapsed=10;assert(!enemyIdentified(a,g));assert.equal(objectivePosition(g),null);
 for(const back of [false,true])assert.deepEqual(actorArtwork(a,back),actorArtwork({...a,kind:'civilian',type:-1},back));
 update(g,.02);assert(!a.aggro);assert(!a.windup);const hp=g.player.hp;attack(g);assert.equal(a.hp,150);assert.equal(g.player.hp,hp);
 g.kills=5;assert(useSight(g));assert(enemyIdentified(a,g));assert(a.sightRevealed);assert(objectivePosition(g));
 g.player.attack=0;attack(g);assert.equal(a.hp,115);
 g.player.sight=0;assert(!enemyIdentified(a,g),'identity must conceal again after Sight');
});
test('regular kills and all boss kills never restore player health',()=>{
 const g=createRun(702);g.actors=[];g.player.hp=23;g.kills=5;g.player.sight=5;
 for(let type=0;type<3;type++){
  g.actors.push({id:type+20,kind:'enemy',type,known:true,sightRevealed:true,x:g.player.x+20,y:g.player.y,hp:35,maxHp:150});
  g.player.attack=0;attack(g);assert.equal(g.player.hp,23);assert.equal(g.kills,type+6);
 }
 for(let stage=0;stage<2;stage++){
  g.points=BOSSES[stage].threshold;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);b.x=g.player.x+20;b.y=g.player.y;b.hp=35;
  g.player.attack=0;attack(g);assert.equal(g.player.hp,23);assert.equal(g.remaining,900);finishStories(g);
 }finishFinalEncounter(g);assert.equal(g.player.hp,23);assert.equal(g.status,'won');
});
test('combat drives Pushpo and enemy arm animation phases and snatcher taunt verbatim',()=>{
 const g=createRun(703);g.actors=[{id:1,kind:'enemy',type:2,variant:1,known:true,x:g.player.x+35,y:g.player.y,hp:70,maxHp:70,speed:105,aggro:true,windup:0,cooldown:0,flash:0,wait:0}];
 g.rng=()=>.99;attack(g);assert(g.player.attackTime>0);const first=g.player.attackTime;update(g,.02);assert(g.player.attackTime<first);
 const enemy=g.actors[0];for(let i=0;i<50;i++)update(g,.02);assert(enemy.windup>0);assert.equal(enemy.speech,SNATCHER_TAUNT);assert.equal(SNATCHER_TAUNT,'এই শুয়োরের বাচ্চা, যা আছে দে কইলাম');
 enemy.windup=.01;update(g,.02);assert(enemy.attackTime>0);assert(g.player.hp<100);
});
test('metro moves, dwells at its real station, exits, and randomizes gaps of at least 90 seconds',()=>{
 const g={rng:random(704),events:[]};g.metro=createMetro(g.rng);let lastEnd=null;
 for(let i=0;i<12;i++){
  const gap=g.metro.wait;assert(gap>=90&&gap<=METRO_LINE.maxGap);updateMetro(g,gap+.01);assert(g.metro.active);
  if(lastEnd!==null)assert(g.metro.lastStart-lastEnd>=90-1e-7);
  const first=metroPosition(g.metro);updateMetro(g,1);assert.notDeepEqual(metroPosition(g.metro),first);
  updateMetro(g,METRO_LINE.travelSeconds+METRO_LINE.dwellSeconds-g.metro.travel+.001);assert(!g.metro.active);lastEnd=g.metro.lastEnd;
 }
 const h={rng:random(11),events:[]};h.metro=createMetro(h.rng);updateMetro(h,h.metro.wait);
 const distance=Math.hypot(METRO_LINE.to.x-METRO_LINE.from.x,METRO_LINE.to.y-METRO_LINE.from.y),overshoot=680/distance;
 const progress=(METRO_LINE.station+overshoot)/(1+2*overshoot),stop=METRO_LINE.travelSeconds*(h.metro.direction>0?progress:1-progress);
 updateMetro(h,stop+1);const atStation=metroPosition(h.metro);updateMetro(h,2);assert.deepEqual(metroPosition(h.metro),atStation);
 const expected={x:METRO_LINE.from.x+(METRO_LINE.to.x-METRO_LINE.from.x)*METRO_LINE.station,y:METRO_LINE.from.y+(METRO_LINE.to.y-METRO_LINE.from.y)*METRO_LINE.station};
 assert(Math.hypot(atStation.x-expected.x,atStation.y-expected.y)<1e-7);
 assert.notEqual(createMetro(random(3)).wait,createMetro(random(4)).wait);
});
test('pause freezes metro and restarting creates a fresh random schedule',()=>{
 const g=createRun(705),before={...g.metro};g.status='paused';update(g,120);assert.deepEqual(g.metro,before);
 const fresh=createRun(706);assert(!fresh.metro.active);assert.equal(fresh.metro.passes,0);assert.notEqual(fresh.metro.wait,g.metro.wait);
});
test('homeless NPC asks a nearby passerby, receives a reply and resumes roaming',()=>{
 const g=createRun(707),a=g.actors.find(n=>n.homeless),passer=g.actors.find(n=>n.kind==='civilian'&&!n.activity&&!n.homeless);
 Object.assign(a,{x:g.player.x-25,y:g.player.y,askCooldown:0,wait:0});Object.assign(passer,{x:g.player.x-50,y:g.player.y,wait:0});g.actors=[a,passer];g.spawnClock=999;
 update(g,.02);assert(a.speech.includes('খাবার'));assert(a.speechTime>0);assert(passer.speech);assert(a.wait>0);
 const before={x:a.x,y:a.y};for(let i=0;i<450;i++)update(g,.02);assert(!a.speech);assert(Math.hypot(a.x-before.x,a.y-before.y)>1);
});
test('opening summary matches the requested replacement exactly',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const summary=html.match(/<p id="story-summary">([^<]+)<\/p>/)[1];
 assert.equal(summary,OPENING_STORY);assert(html.includes(AWAKENING_STORY));assert(summary.includes('60 days'));
 assert(!html.includes('At 18, Pushpo was abducted'));assert(!html.includes('renewed health'));
});
