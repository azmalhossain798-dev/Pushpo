import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,update,attack,useSight,useWaterMirror,spawnBoss,continueStory,inside,clearPath,objectivePosition} from '../dist/engine-v3.mjs';
import {COMBAT_ACTIONS,MURDERER_LINES,ESCAPE_LINES,SPECIAL_LINE,sightAvailable,mirrorAvailable,combatPose} from '../dist/combat-v7.mjs';
import {pedestrianTrafficClearance} from '../dist/traffic-v5.mjs';
import {SCENERY} from '../dist/scene-v3.mjs';
function tick(g,time){for(let t=0;t<time-1e-8;t+=.01)update(g,Math.min(.01,time-t));}
function fixture(seed=900){const g=createRun(seed);g.actors=[];g.traffic=[];g.phase='boss';g.spawnClock=999;return g;}
function enemy(g,type=2,hp=150){const a={id:g.nextId++,kind:'enemy',type,label:'test',x:g.player.x+36,y:g.player.y,hp,maxHp:hp,known:true,sightRevealed:true,sprite:3,face:1,speed:40,wanderSpeed:40,walk:0,wait:999,aggro:false,windup:0,cooldown:999,flash:0,node:'w2',hasFled:true};g.actors.push(a);return a;}
function strike(g,mode='combo'){g.player.attack=0;assert(attack(g,mode));const kind=g.player.attackKind;tick(g,COMBAT_ACTIONS[kind].contact+.001);return kind;}

test('slap, face punch and kick hit exactly once at contact and cause distinct poses and reactions',()=>{
 for(const kind of ['slap','punch','kick']){
  const g=fixture(),a=enemy(g);g.player.nextCombo=kind==='kick'?'kick':'punch';assert(attack(g,kind==='slap'?'slap':'combo'));const spec=COMBAT_ACTIONS[kind];
  assert.equal(a.hp,150);assert.equal(g.player.attackKind,kind);tick(g,spec.contact-.02);assert.equal(a.hp,150,'windup cannot deal damage');tick(g,.021);assert.equal(a.hp,150-spec.damage);
  assert(a.reaction>0);assert(a.stun>0);assert.equal(a.reactionKind,kind);const atContact=combatPose({...g.player,attackTime:spec.duration-spec.contact});
  assert(kind==='kick'?Math.abs(atContact.leg)>1:Math.abs(atContact.arm)>1);const hp=a.hp;tick(g,.35);assert.equal(a.hp,hp,'recovery cannot hit twice');
 }
});

test('combo advances only for accepted clicks; invalid, paused, story and expired actions cannot fire',()=>{
 const g=fixture();enemy(g,0,500);assert(attack(g));assert.equal(g.player.attackKind,'punch');assert(!attack(g));assert.equal(g.player.nextCombo,'kick');tick(g,.5);
 assert(attack(g));assert.equal(g.player.attackKind,'kick');tick(g,.7);assert(attack(g,'slap'));assert.equal(g.player.nextCombo,'punch');tick(g,.6);assert(attack(g));assert.equal(g.player.attackKind,'punch');
 const next=g.player.nextCombo;g.player.attack=0;assert(!attack(g,'invalid'));assert.equal(g.player.nextCombo,next);
 for(const status of ['paused','won','lost']){g.status=status;assert(!attack(g));assert(!useWaterMirror(g));}
 g.status='playing';g.story={beats:[],index:0};assert(!attack(g));assert(!useSight(g));assert(!useWaterMirror(g));
});

test('contact rechecks moving targets, defeated targets, range and solid obstructions',()=>{
 const g=fixture(),a=enemy(g);assert(attack(g));a.x+=300;tick(g,.2);assert.equal(a.hp,150);
 a.x=g.player.x+30;g.player.attack=0;assert(attack(g));a.dead=true;tick(g,.3);assert.equal(a.hp,150);
 const h=fixture(),prop=SCENERY.find(p=>p.id==='east-cng');Object.assign(h.player,{x:prop.x,y:prop.y+43});const b=enemy(h,0,100);Object.assign(b,{x:prop.x,y:prop.y-43});assert(inside(h.player.x,h.player.y)&&inside(b.x,b.y));assert(!clearPath(b,h.player));assert(attack(h));tick(h,.3);assert.equal(b.hp,100);
});

test('Sight is locked through four actual defeats and unlocks on the fifth, with a single notice and no free points',()=>{
 const g=fixture();assert(!sightAvailable(g));assert(!useSight(g));for(let i=0;i<5;i++){
  const a=enemy(g,2,35);a.known=true;strike(g);assert.equal(g.kills,i+1);if(i<4)assert(!useSight(g));
 }assert(sightAvailable(g));assert.equal(g.points,25);assert(g.unlockNotice.text.includes('SIGHT AWAKENED'));assert.equal(g.events.filter(e=>e==='unlock').length,1);
 const hidden=enemy(g,1);hidden.sightRevealed=false;hidden.known=false;assert(useSight(g));assert(hidden.sightRevealed);assert(!useSight(g));
});

test('tutorial guides a nearby snatcher between 10 and 15 seconds and preserves playable enemy counts',()=>{
 for(const seed of [901,902,903]){
  const g=createRun(seed);assert.equal(g.actors.filter(a=>a.kind==='enemy').length,4);assert(g.actors.filter(a=>a.kind==='enemy').every(a=>a.type!==1));
  assert(!useSight(g));tick(g,11.9);assert(!g.tutorial.guided);tick(g,.2);assert(g.tutorial.guided);const a=g.actors.find(a=>a.id===g.tutorial.target);
  assert(a&&a.type===2&&a.hp>0);assert(Math.hypot(a.x-g.player.x,a.y-g.player.y)<310);assert.equal(objectivePosition(g),null);assert(g.message.includes('preparing to attack'));assert(g.actors.filter(a=>a.aggro).length<=2);
 }
});

test('snatchers survive nonlethal hits, randomly flee with added dialogue and keep their existing attack taunt',()=>{
 const outcomes=[];for(const roll of [0,.99]){
  const g=fixture(),a=enemy(g,2,70);a.hasFled=false;g.rng=()=>roll;strike(g,'slap');assert.equal(a.hp,52);assert(!a.dead);assert.equal(g.kills,0);outcomes.push(a.fleeTime>0);
  if(roll===0){assert(ESCAPE_LINES.includes(a.speech));assert(!a.aggro);assert.equal(a.windup,0);const start={x:a.x,y:a.y};tick(g,4);assert(Math.hypot(a.x-start.x,a.y-start.y)>90);assert(inside(a.x,a.y));assert.equal(g.player.hp,100);}
 }assert.deepEqual(outcomes,[true,false]);
 const spoken=new Set();for(const roll of [.1,.9]){const g=fixture(),a=enemy(g,2,70);a.hasFled=false;let call=0;g.rng=()=>++call===1?0:roll;strike(g,'slap');spoken.add(a.speech);}assert.deepEqual(spoken,new Set(ESCAPE_LINES));
});

test('murderer lines are randomized once per actor and do not restart in the same encounter',()=>{
 const choices=new Set();for(let seed=910;seed<930;seed++){const g=createRun(seed);for(const a of g.actors.filter(a=>a.type===0)){assert(MURDERER_LINES.includes(a.murderLine));choices.add(a.murderLine);}}
 assert.equal(choices.size,3);const g=fixture(),a=enemy(g,0);g.phase='hunt';g.elapsed=10;a.murderLine=MURDERER_LINES[1];update(g,.02);assert.equal(a.speech,a.murderLine);const t=a.speechTime;update(g,.02);assert(a.speechTime<t);a.speechTime=0;update(g,.02);assert(!a.speech);assert(a.murderSpoken);
 g.player.x=0;g.player.y=0;tick(g,9);assert(!a.murderSpoken);assert.equal(a.murderLine,MURDERER_LINES[1]);
});

test('two special civilians taunt once, accept one nonlethal slap and flee without points or kills',()=>{
 const full=createRun(930),special=full.actors.filter(a=>a.specialTaunt);assert.equal(special.length,Math.round(full.actors.length*.01));assert(special.every(a=>!a.activity&&!a.homeId&&!a.homeless));
 const g=fixture(),a={...special[0],x:g.player.x+40,y:g.player.y,wait:999},normal={...special[1],id:9999,specialTaunt:false,x:g.player.x-45,y:g.player.y,wait:999};g.actors=[a,normal];
 update(g,.01);assert.equal(a.speech,SPECIAL_LINE);assert(a.specialSpoken);assert(attack(g));tick(g,.2);assert.equal(a.hp,100);assert(!a.specialSlapped,'punch cannot hit a civilian');
 g.player.attack=0;assert(attack(g,'slap'));tick(g,.2);assert(a.specialSlapped);assert(a.fleeTime>0);assert.equal(a.hp,100);assert.equal(g.kills,0);assert.equal(g.points,0);const start={x:a.x,y:a.y};tick(g,4);assert(Math.hypot(a.x-start.x,a.y-start.y)>90);assert(!a.aggro);assert(!a.speech);
 a.x=g.player.x+35;a.y=g.player.y;g.player.attack=0;assert(attack(g,'slap'));tick(g,.2);assert.equal(a.hp,100);assert.equal(normal.hp,100);assert(!normal.specialSlapped);
});

test('Water Mirror unlocks only after Sumon, blocks gun/weapon/grab contacts and shares a ten-second cooldown',()=>{
 const locked=fixture();assert(!mirrorAvailable(locked));assert(!useWaterMirror(locked));locked.chapter=1;assert(!useWaterMirror(locked));
 for(const type of [0,1,2]){
  const g=fixture(),a=enemy(g,type);g.defeated=['Sumon Mia'];g.kills=5;g.player.sight=5;g.player.hp=40;Object.assign(a,{aggro:true,windup:.01,attackX:g.player.x,attackY:g.player.y,cooldown:0});update(g,.02);
  assert.equal(g.player.hp,40);assert(g.player.mirrorTime>0);assert.equal(g.player.mirrorCooldown,10);assert(g.events.includes('block'));assert(!useWaterMirror(g));a.windup=0;a.aggro=false;a.cooldown=999;
  tick(g,9.9);assert(g.player.mirrorCooldown>0);assert(!useWaterMirror(g));tick(g,.11);assert(useWaterMirror(g));
  const before=g.player.mirrorCooldown;g.status='paused';update(g,20);assert.equal(g.player.mirrorCooldown,before);
 }
});

test('Sumon defeat enables Mirror without skipping his existing notes, and restart relocks both abilities',()=>{
 const g=fixture();g.phase='hunt';g.points=150;spawnBoss(g);const a=g.actors.find(a=>a.kind==='boss');a.x=g.player.x+30;a.y=g.player.y;a.hp=35;strike(g);assert(mirrorAvailable(g));assert(g.story);assert(!useWaterMirror(g));while(g.story)continueStory(g);assert(useWaterMirror(g));
 const fresh=createRun(950);assert(!sightAvailable(fresh));assert(!mirrorAvailable(fresh));assert(!fresh.player.pendingHit);
});

test('live murderer gun windup aims at Pushpo, can miss, and triggers one Mirror cast for simultaneous contacts',()=>{
 const g=fixture();g.phase='hunt';g.elapsed=5;g.defeated=['Sumon Mia'];const a=enemy(g,0);Object.assign(a,{x:g.player.x-200,cooldown:0,aggro:true});assert(clearPath(a,g.player));
 update(g,.01);assert(a.windup>0);assert.equal(g.player.mirrorCooldown,0);tick(g,.86);assert.equal(g.player.hp,100);assert(g.player.mirrorCooldown>9);assert(g.events.includes('block'));
 const h=fixture();h.phase='hunt';h.elapsed=5;h.defeated=['Sumon Mia'];const b=enemy(h,0);Object.assign(b,{x:h.player.x-200,cooldown:0,aggro:true});update(h,.01);h.player.y+=75;tick(h,.86);assert.equal(h.player.hp,100);assert.equal(h.player.mirrorCooldown,0,'a missed shot must not consume reactive protection');
 const k=fixture();k.defeated=['Sumon Mia'];k.kills=5;k.player.sight=5;for(let i=0;i<2;i++){const e=enemy(k,i);Object.assign(e,{aggro:true,windup:.01,attackX:k.player.x,attackY:k.player.y});}update(k,.02);assert.equal(k.player.hp,100);assert.equal(k.events.filter(e=>e==='mirror').length,1);assert.equal(k.events.filter(e=>e==='block').length,2);
});

test('fleeing follows existing traffic colliders and returns to ordinary navigation without attacking',()=>{
 const g=createRun(972),a=g.actors[0];g.actors=[a];g.phase='boss';g.rng=()=>0;Object.assign(a,{x:g.player.x+35,y:g.player.y,hp:70,known:true,hasFled:false,tutorialGuard:false,wait:999});
 strike(g,'slap');assert(a.fleeTime>0);const start={x:a.x,y:a.y};let travelled=0;
 for(let i=0;i<1100;i++){const old={x:a.x,y:a.y};update(g,.01);travelled+=Math.hypot(a.x-old.x,a.y-old.y);assert(Math.hypot(a.x-old.x,a.y-old.y)<4,'fleeing cannot teleport');for(const v of g.traffic)assert(pedestrianTrafficClearance(a,v)>=15-1e-7);assert(!a.aggro);}
 assert(travelled>150);assert(Math.hypot(a.x-start.x,a.y-start.y)>90);assert.equal(a.fleeTime,0);assert(a.node);assert.equal(g.player.hp,100);
});

test('post-unlock replenishment introduces a disguised rapist without replacing existing actors',()=>{
 const g=fixture();g.phase='hunt';g.kills=5;g.spawnClock=0;g.actors=[enemy(g,0),enemy(g,2),enemy(g,2)];const ids=g.actors.map(a=>a.id);update(g,.01);
 assert.equal(g.actors.filter(a=>a.kind==='enemy').length,4);assert(ids.every(id=>g.actors.some(a=>a.id===id)));const rapist=g.actors.find(a=>a.type===1);assert(rapist);assert(!rapist.sightRevealed);assert(!rapist.aggro);assert(g.tutorial.rapistIntroduced);
});

test('combat markup starts with two attacks, hidden locked abilities, and preserved dodge and movement',()=>{
 const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');for(const id of ['slap','attack','sight','mirror','dodge','joystick'])assert(html.includes(`id="${id}"`));
 for(const id of ['sight','mirror'])assert(new RegExp(`id="${id}"[^>]*class="[^"]*hidden[^>]*disabled`).test(html));assert(html.includes('id="unlock-notice"'));
});
