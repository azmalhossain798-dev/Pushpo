import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,update,spawnBoss,continueStory,inside,TYPES,objectivePosition,attack as beginAttack} from '../dist/engine-v3.mjs';
import {attack,finishStories} from './combat-helpers.mjs';
import {FINAL_RULES,FINAL_DIALOGUE,finalGroup,castHerculesFreeze,beginFinalFarewell,finishFinalFarewell} from '../dist/final-v9.mjs';
import {currentStoryBeat} from '../dist/story-v6.mjs';
import {pedestrianTrafficClearance} from '../dist/traffic-v5.mjs';
import {actorArtwork} from '../dist/city-systems.mjs';
import {presentStoryCard} from '../dist/story-ui-v8.mjs';
export function finalFixture(seed=9901,full=false){
 const g=createRun(seed);if(!full){g.actors=[];g.traffic=[];}g.spawnClock=9999;g.player.invulnerable=9999;g.kills=10;
 for(let stage=0;stage<2;stage++){
  g.points=stage?300:150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);Object.assign(g.player,{x:b.x+30,y:b.y,attack:0});b.hp=35;attack(g);finishStories(g);
 }
 return g;
}
export function tickFinal(g,seconds,step=.03){for(let t=0;t<seconds-1e-8&&g.status==='playing'&&!g.story;t+=step)update(g,Math.min(step,seconds-t));}
export function reachFinal(g){
 g.hercules.kills=Math.max(1,g.hercules.kills);g.finalMission.investigationElapsed=30;
 for(let i=0;i<6000&&!g.finalMission.spawned&&g.status==='playing';i++)update(g,.03);
 assert(g.finalMission.spawned,`Hercules route stalled: ${JSON.stringify({mission:g.finalMission,h:g.actors.find(a=>a.role==='hercules')})}`);return g;
}
export function joinFinal(g){const r=FINAL_RULES.roundabout;Object.assign(g.player,{x:r.x-140,y:r.y+85});update(g,.03);assert.equal(g.finalMission.state,'combat');return g;}

test('actual boss story order leads to investigation, a physical journey, and exactly one three-enemy ambush',()=>{
 const g=finalFixture();assert(g.hercules.introComplete);assert.equal(g.finalMission.state,'investigating');g.points=9999;spawnBoss(g);assert.equal(finalGroup(g).length,0);
 const h=g.actors.find(a=>a.role==='hercules'),previous={x:h.x,y:h.y};g.hercules.kills=1;g.finalMission.investigationElapsed=29.9;tickFinal(g,.2);assert.equal(g.finalMission.state,'travelling');assert(Math.hypot(h.x-previous.x,h.y-previous.y)<40);
 reachFinal(g);assert.equal(g.finalMission.state,'rescue');assert.equal(g.finalMission.remaining,60);assert.equal(finalGroup(g).length,3);assert.equal(g.actors.filter(a=>a.role==='hercules').length,1);assert(g.message.includes('৬০'));assert.equal(h.hp,FINAL_RULES.herculesHealth);
 const [rana,left,right]=finalGroup(g);assert.equal(rana.label,'Sohel Rana');assert.deepEqual([rana.maxHp,left.maxHp,right.maxHp],[TYPES[0].health*3,TYPES[0].health*2,TYPES[0].health*2]);assert.deepEqual([rana.weapon,left.weapon,right.weapon],['knife','machete','machete']);assert(left.y>rana.y&&right.y<rana.y);assert(left.x<rana.x&&right.x>rana.x);
 for(const a of [h,...finalGroup(g)])assert(inside(a.x,a.y));for(const back of [false,true]){assert.equal(actorArtwork(rana,back).key,back?'backs':'bosses');assert.deepEqual(actorArtwork(left,back),{key:'companions',index:back?2:0});assert.deepEqual(actorArtwork(right,back),{key:'companions',index:back?3:1});}
 const ids=finalGroup(g).map(a=>a.id);tickFinal(g,1);spawnBoss(g);assert.deepEqual(finalGroup(g).map(a=>a.id),ids);assert(g.finalMission.remaining<60);assert.equal(objectivePosition(g),FINAL_RULES.roundabout);
});

test('60-second arrival clock pauses, does not reset on leaving, and expiry kills Hercules exactly once',()=>{
 const g=reachFinal(finalFixture(9902));g.status='paused';const before=JSON.stringify(g);update(g,120);assert.equal(JSON.stringify(g),before);g.status='playing';
 // The elapsed-time clock must work even after one delayed frame.
 update(g,59);assert.equal(g.finalMission.remaining,1);assert.equal(g.status,'playing');update(g,1);assert.equal(g.status,'lost');assert.equal(g.finalMission.state,'failed');const h=g.actors.find(a=>a.role==='hercules');assert(h.dead);assert.equal(h.hp,0);
 const events=g.events.filter(e=>e==='lose').length;update(g,60);assert.equal(g.events.filter(e=>e==='lose').length,events);assert(!g.finalMission.endingStarted);
 const timely=reachFinal(finalFixture(9903));timely.finalMission.remaining=.03;joinFinal(timely);const remaining=timely.finalMission.remaining,arrivedAt=timely.finalMission.arrivedAt;Object.assign(timely.player,{x:780,y:2370});tickFinal(timely,.5);joinFinal(timely);assert.equal(timely.finalMission.remaining,remaining);assert.equal(timely.finalMission.arrivedAt,arrivedAt);assert.equal(finalGroup(timely).length,3);
 const late=reachFinal(finalFixture(9904));late.finalMission.remaining=.01;Object.assign(late.player,{x:FINAL_RULES.roundabout.x-140,y:FINAL_RULES.roundabout.y+85});update(late,.02);assert.equal(late.status,'lost','a late arrival cannot beat an expired timer');
});

test('Hercules freeze immobilizes multiple enemies for three seconds and uses one twelve-second cooldown',()=>{
 const g=joinFinal(reachFinal(finalFixture(9905))),h=g.actors.find(a=>a.role==='hercules'),group=finalGroup(g);Object.assign(h,{x:3910,y:2220,freezeCooldown:0});assert(castHerculesFreeze(g,h));assert(!castHerculesFreeze(g,h));assert.equal(h.freezeCooldown,12);assert.equal(group.filter(a=>a.frozenUntil===g.elapsed+3).length,3);
 const positions=group.map(a=>({x:a.x,y:a.y})),ends=group.map(a=>a.frozenUntil);tickFinal(g,2.94);group.forEach((a,i)=>{assert.equal(a.x,positions[i].x);assert.equal(a.y,positions[i].y);assert.equal(a.frozenUntil,ends[i]);});assert(h.freezeCooldown>9&&h.freezeCooldown<9.1);
 tickFinal(g,.12);assert(group.some((a,i)=>a.x!==positions[i].x||a.y!==positions[i].y||a.windup>0));assert(!castHerculesFreeze(g,h));assert(g.effects.some(e=>e.type==='freeze')||g.elapsed>=ends[0]);
});

test('Hercules alternates contact attacks, changes dead targets, guards, takes damage and never uses a weapon',()=>{
 const g=joinFinal(reachFinal(finalFixture(9906))),h=g.actors.find(a=>a.role==='hercules'),group=finalGroup(g);assert(!h.weapon);g.player.x=3500;g.player.y=2080;const kinds=new Set(),targets=new Set();let damaged=false,defended=false;
 for(let i=0;i<1800&&g.status==='playing'&&!g.story;i++){update(g,.03);if(h.attackTime>0)kinds.add(h.attackKind);if(g.hercules.targetId)targets.add(g.hercules.targetId);damaged||=h.hp<h.maxHp;defended||=h.guardTime>0;}
 assert(kinds.has('punch'));assert(kinds.has('kick'));assert(targets.size>=2);assert(group.some(a=>a.dead));assert(h.hp>=0);assert(inside(h.x,h.y));
 // A connecting weapon strike must damage the ally; guard must block the same strike.
 const v=joinFinal(reachFinal(finalFixture(9917))),ally=v.actors.find(a=>a.role==='hercules'),enemy=finalGroup(v)[0];Object.assign(ally,{x:3962,y:2174,attack:999,pendingHit:null,freezeCooldown:999,guardCooldown:999});Object.assign(enemy,{x:3988,y:2174,stun:0,frozenUntil:0,windup:.01,attackX:ally.x,attackY:ally.y,targetId:ally.id});update(v,.02);tickFinal(v,.18,.01);assert(ally.hp<ally.maxHp,JSON.stringify({ally,enemy}));const health=ally.hp;Object.assign(ally,{invulnerable:0,guardTime:.5});Object.assign(enemy,{windup:.01,attackX:ally.x,attackY:ally.y});update(v,.02);tickFinal(v,.18,.01);assert.equal(ally.hp,health);assert(v.events.includes('block'));
});

test('all three enemies are required; Sohel alone cannot win; Bengali farewell is reader-paced and ends once',()=>{
 const g=joinFinal(reachFinal(finalFixture(9907))),h=g.actors.find(a=>a.role==='hercules'),group=finalGroup(g);h.attack=999;h.pendingHit=null;h.freezeCooldown=999;const hp=g.player.hp;
 for(let i=0;i<3;i++){
  const a=group[i];Object.assign(g.player,{x:a.x-22,y:a.y,attack:0});a.hp=35;a.cooldown=999;a.windup=0;assert(attack(g));assert(a.dead);
  if(i<2){assert(!g.story);assert.equal(g.status,'playing');assert.equal(g.chapter,2);assert(!g.defeated.includes('Sohel Rana'));}
 }
 assert.equal(g.player.hp,hp,'kills must not heal');assert.equal(g.finalMission.state,'farewell');assert.equal(g.defeated.filter(n=>n==='Sohel Rana').length,1);assert(g.cinematic);assert.equal(g.status,'playing');assert(!beginFinalFarewell(g));assert(!finishFinalFarewell(g));
 const before=JSON.stringify(g);update(g,100,{x:1,y:0,attack:true});assert.equal(JSON.stringify(g),before);assert(!beginAttack(g));const seen=[];
 while(g.story){const beat=currentStoryBeat(g);seen.push(beat.id);assert.equal(beat.text,FINAL_DIALOGUE[seen.length-1].text);assert(!/[a-z]/i.test(beat.text));continueStory(g);}
 assert.equal(seen.length,8);assert.equal(new Set(seen).size,8);assert.equal(g.status,'won');assert.equal(g.finalMission.state,'complete');assert(g.finalMission.endingFinished);assert(!g.cinematic);assert(!finishFinalFarewell(g));const wins=g.events.filter(e=>e==='win').length;update(g,120);continueStory(g);assert.equal(g.events.filter(e=>e==='win').length,wins);
 const text=FINAL_DIALOGUE.map(t=>t.text).join(' ');for(const word of ['ষাট','কয়েকটা দিন','কষ্ট','নিরীহ','আলোর রেখা','বিদায়'])assert(text.includes(word));
});

test('the full 700-health group is defeatable through normal alternating player strikes',()=>{
 const g=joinFinal(reachFinal(finalFixture(9918))),h=g.actors.find(a=>a.role==='hercules');h.attack=999;h.pendingHit=null;h.freezeCooldown=999;let contacts=0;
 for(const a of finalGroup(g)){
  const maximum=a.hp;for(let i=0;i<12&&!a.dead;i++){
   Object.assign(g.player,{x:a.x-20,y:a.y,attack:0});a.cooldown=999;a.windup=0;const before=a.hp;assert(attack(g));assert.equal(a.hp,Math.max(0,before-35));contacts++;
  }assert(a.dead);assert.equal(a.maxHp,maximum);
 }
 assert.equal(contacts,21);assert.equal(g.finalMission.state,'farewell');finishStories(g);assert.equal(g.status,'won');
});

test('Hercules can fall in the joined fight and restarting clears all final mission state',()=>{
 const g=joinFinal(reachFinal(finalFixture(9919))),h=g.actors.find(a=>a.role==='hercules'),enemy=finalGroup(g)[0];Object.assign(h,{hp:1,attack:999,pendingHit:null,freezeCooldown:999,guardCooldown:999,guardTime:0,invulnerable:0});Object.assign(enemy,{x:h.x+20,y:h.y,stun:0,frozenUntil:0,windup:.01,targetId:h.id,attackX:h.x,attackY:h.y});update(g,.02);tickFinal(g,.18,.01);assert.equal(g.status,'lost');assert(h.dead);assert(!g.story);assert(!g.finalMission.endingStarted);
 const fresh=createRun(9919);assert(!fresh.finalMission.spawned);assert(!fresh.finalMission.arrived);assert(!fresh.finalMission.endingStarted);assert.equal(fresh.finalMission.state,'unknown');assert.equal(finalGroup(fresh).length,0);
});

test('Pushpo can reach the rescue on foot through connected roads within sixty seconds',()=>{
 const g=reachFinal(finalFixture(9920)),route=[{x:1240,y:2280},{x:1790,y:2180},{x:2370,y:2220},{x:2880,y:2380},{x:3910,y:2550},{x:3890,y:2290}];let index=0,time=0;
 while(g.finalMission.state==='rescue'&&time<60){const target=route[index],dx=target.x-g.player.x,dy=target.y-g.player.y,d=Math.hypot(dx,dy);if(d<18&&index<route.length-1){index++;continue;}update(g,.03,{x:dx/(d||1),y:dy/(d||1)});time+=.03;assert(inside(g.player.x,g.player.y));}
 assert.equal(g.finalMission.state,'combat');assert(time<40);assert(g.finalMission.remaining>20);
});

test('rescue is viable with the full retained crowd and moving traffic; Hercules survives the whole arrival window',()=>{
 for(const seed of [9910,9911,9912]){
  const g=finalFixture(seed,true),ids=g.actors.filter(a=>a.kind==='civilian').map(a=>a.id);reachFinal(g);const h=g.actors.find(a=>a.role==='hercules');let travel=0,last={x:h.x,y:h.y};
  for(let i=0;i<1960&&g.status==='playing';i++){update(g,.03);travel+=Math.hypot(h.x-last.x,h.y-last.y);last={x:h.x,y:h.y};assert(inside(h.x,h.y));for(const v of g.traffic)assert(pedestrianTrafficClearance(h,v)>=15-1e-7);}
  assert.equal(g.status,'playing',`rescue ended unfairly before 60s, seed ${seed}, health ${h.hp}`);assert(h.hp>0);assert(travel>50,'Hercules must move in combat');assert.equal(g.traffic.length,14);assert(ids.every(id=>g.actors.some(a=>a.id===id)));assert(finalGroup(g).some(a=>!a.dead));assert(g.finalMission.remaining>1);
 }
});

test('final HUD and subtitle presenter share existing responsive UI and Bengali farewell action',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');for(const id of ['ally-health','ally-name','ally-fill','freeze-status'])assert(html.includes(`id="${id}"`));
 const elements=new Map(),card={scrollTop:9};const doc={getElementById(id){if(!elements.has(id))elements.set(id,{firstChild:{},classList:{toggle(){},add(){},remove(){}},querySelector:()=>card,focus(){}});return elements.get(id);}};
 const beat={id:'farewell-7',sequence:'farewell',kind:'conversation',speaker:'Hercules',title:'হারকিউলিস',text:FINAL_DIALOGUE.at(-1).text},g={story:{index:7,beats:FINAL_DIALOGUE}};presentStoryCard(doc,g,beat);assert.equal(doc.getElementById('story-next').firstChild.textContent,'বিদায় ');assert.equal(doc.getElementById('story-text').textContent,beat.text);assert.equal(card.scrollTop,0);
});

