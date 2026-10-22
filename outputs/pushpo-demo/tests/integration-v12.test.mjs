import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as engine from '../dist/engine-v3.mjs';
import * as combat from '../dist/combat-v7.mjs';
import * as city from '../dist/city-systems.mjs';
import * as scene from '../dist/scene-v3.mjs';
import * as story6 from '../dist/story-v6.mjs';
import * as story8 from '../dist/story-v8.mjs';
import * as final9 from '../dist/final-v9.mjs';
import {presentStoryCard} from '../dist/story-ui-v8.mjs';
import {presentWorldHud} from '../dist/world-ui-v10.mjs';
import {initFuchka} from '../dist/world-v10.mjs';
import {Painter} from '../dist/art-v3.mjs';
const tick=(g,t)=>{for(let s=0;s<t-1e-8;s+=.01)engine.update(g,Math.min(.01,t-s));};
function isolated(){const g=engine.createRun(1201);g.actors=[];g.traffic=[];g.spawnClock=999;g.phase='boss';return g;}
function attacker(g,type=0){const a={id:g.nextId++,kind:'enemy',type,x:g.player.x+35,y:g.player.y,hp:200,maxHp:200,coverSprite:2,sprite:2,known:true,sightRevealed:true,aggro:false,cooldown:999,wait:999,flash:0,speed:0,windup:0,walk:0,node:'w2'};g.actors.push(a);return a;}
function recorder(){const calls=[];const c=new Proxy({calls,measureText:t=>({width:t.length*7}),createRadialGradient:()=>({addColorStop(){}})},{get(o,k){return k in o?o[k]:(...args)=>calls.push([k,...args]);}});return c;}

test('all identities, artwork, labels and both map sizes follow active Sight, ignoring stale known/aggro flags',()=>{
 const g=isolated(),actors=[0,1,2].map(t=>attacker(g,t));g.phase='hunt';actors.forEach(a=>{a.aggro=true;});
 const painter=Object.create(Painter.prototype);painter.rig=()=>{};painter.fish=()=>{};painter.light={night:0};
 const labels=['Murderer','Rapist','Snatcher'];
 const check=(revealed)=>{for(const a of actors){assert.equal(city.enemyIdentified(a,g),revealed);const c=recorder();painter.actor(c,a,g,1);assert.equal(c.calls.some(x=>x[0]==='fillText'&&labels.includes(x[1])),revealed);if(!revealed)assert.deepEqual(city.actorArtwork(a,false,false),{key:'characters',index:2});}
  for(const large of [false,true]){const c=recorder();painter.map({width:155,height:155,getContext:()=>c},g,large);assert.equal(c.calls.filter(x=>x[0]==='ellipse'&&x[1]===actors[0].x&&x[2]===actors[0].y).length,revealed?3:0);}
 };
 check(false);g.kills=4;g.player.sight=3;check(false);g.player.sight=0;assert(!engine.useSight(g));g.kills=5;check(false);assert(engine.useSight(g));check(true);assert(engine.objectivePosition(g));
 g.player.x+=1000;check(false);g.player.x-=1000;check(true);g.player.sight=0;check(false);assert.equal(engine.objectivePosition(g),null);engine.update(g,.01);assert(actors.every(a=>!a.sightRevealed));
});

test('exactly three bound fuchka sellers survive reinitialization and long play; each retains one-use 20-percent recovery',()=>{
 const g=engine.createRun(1202),scenery=scene.SCENERY.filter(s=>s.fuchka);assert.equal(scenery.length,3);assert.equal(scene.FUCHKA_STALLS.length,3);const ids=g.fuchka.shops.map(s=>s.vendorId);assert.equal(new Set(ids).size,3);assert.equal(new Set(ids.map(id=>g.actors.find(a=>a.id===id).sprite)).size,3);
 for(const s of scene.FUCHKA_STALLS){const shop=g.fuchka.shops.find(p=>p.id===s.id),a=g.actors.find(a=>a.id===shop.vendorId);assert.equal(a.stallId,s.id);assert(Math.hypot(a.x-s.x,a.y-s.y)<80);assert(engine.inside(s.approach.x,s.approach.y));assert(engine.clearPath(s.approach,a));Object.assign(g.player,s.approach,{hp:40});assert(engine.eatFuchka(g,s.id));assert.equal(g.player.hp,60);assert(!engine.eatFuchka(g,s.id));}
 g.actors.push({...g.actors.find(a=>a.stallId===scene.FUCHKA_STALLS[0].id),id:9991},{...g.actors.find(a=>a.stallId===scene.FUCHKA_STALLS[1].id),id:9992,stallId:'obsolete-fuchka'});initFuchka(g);assert.deepEqual(g.fuchka.shops.map(s=>s.vendorId),ids);assert(g.fuchka.shops.every(s=>s.used));assert.equal(g.actors.filter(a=>a.activity==='fuchka').length,3);
 g.actors=g.actors.filter(a=>a.kind==='civilian');g.phase='boss';g.player.invulnerable=999;tick(g,12);for(const s of scene.FUCHKA_STALLS){const a=g.actors.find(a=>a.stallId===s.id);assert(Math.hypot(a.x-s.vendor.x,a.y-s.vendor.y)<4);}
});

test('Water Mirror covers exactly three seconds, expires without lingering protection, and cannot recast before ten seconds',()=>{
 for(const type of [0,1,2]){
  const g=isolated(),a=attacker(g,type);g.defeated=['Sumon Mia'];g.kills=5;g.player.sight=5;g.player.hp=60;
  assert(engine.useWaterMirror(g));assert.equal(g.player.mirrorTime,3);assert.equal(g.player.mirrorCooldown,10);tick(g,2.98);assert(g.player.mirrorTime>0);
  Object.assign(a,{aggro:true,windup:.005,attackX:g.player.x,attackY:g.player.y});engine.update(g,.01);assert.equal(g.player.hp,60);assert(g.events.includes('block'));a.aggro=false;a.cooldown=999;tick(g,.02);assert.equal(g.player.mirrorTime,0);assert(g.player.mirrorFade>0);assert(!engine.useWaterMirror(g));
  Object.assign(a,{aggro:true,windup:.005,attackX:g.player.x,attackY:g.player.y});engine.update(g,.01);assert(g.player.hp<60,'cosmetic dissolve must not protect');a.aggro=false;a.cooldown=999;tick(g,.5);assert.equal(g.player.mirrorFade,0);tick(g,6.47);assert(!engine.useWaterMirror(g));tick(g,.02);assert(engine.useWaterMirror(g));
 }
});

test('machete windup, contact and recovery use one hit and recheck target, range and obstruction',()=>{
 for(const scenario of ['hit','dodge','wall','interrupt']){
  const g=isolated();g.phase='final';g.finalMission={state:'combat',arrived:true};const a={...attacker(g),kind:'boss',finalEnemy:true,weapon:'machete',range:91,damage:12,targetId:0,windup:.01,windupMax:.95,attackX:g.player.x,attackY:g.player.y};g.actors=[a];let hits=0,clear=true;
  const api={clear:()=>clear,enemyHit(){hits++;},navigate(){}};
  final9.updateFinalEnemy(g,a,.02,api);assert.equal(hits,0);assert.equal(a.attackKind,'machete');assert.equal(a.pendingWeaponHit.time,.32);
  const wind=combat.combatPose({weapon:'machete',windup:.001,windupMax:.95}),start=combat.combatPose({...a,attackTime:.78});assert(Math.abs(wind.arm-start.arm)<.01,'windup must join the slash continuously');const before=combat.combatPose({...a,attackTime:.78-.31}),contact=combat.combatPose({...a,attackTime:.78-.32});assert(Math.abs(contact.arm)>Math.abs(before.arm));assert.equal(contact.arm,-1.6);
  final9.updateFinalEnemy(g,a,.30,api);assert.equal(hits,0);
  if(scenario==='dodge')g.player.x-=300;if(scenario==='wall')clear=false;if(scenario==='interrupt')a.pendingWeaponHit=null;
  final9.updateFinalEnemy(g,a,.021,api);assert.equal(hits,scenario==='hit'?1:0);final9.updateFinalEnemy(g,a,.1,api);assert.equal(hits,scenario==='hit'?1:0);
 }
});

function uiHarness(){
 const elements=new Map();function element(){const classes=new Set(['hidden']),events=new Map();return {style:{},dataset:{},firstChild:{},children:[],disabled:false,textContent:'',classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},contains:x=>classes.has(x),toggle(x,force){const on=force??!classes.has(x);on?classes.add(x):classes.delete(x);return on;}},addEventListener(k,fn){events.set(k,fn);},click(){events.get('click')?.({});},setAttribute(k,v){this[k]=v;},focus(){},replaceChildren(...xs){this.children=xs;},append(x){this.children.push(x);},querySelector(){return this;},getBoundingClientRect(){return {width:544,height:884,left:0,top:0};},setPointerCapture(){}};}
 const doc={hidden:false,getElementById(id){if(!elements.has(id)){const el=element();el.parentElement=el;elements.set(id,el);}return elements.get(id);},createElement:element,addEventListener(){}};const win={addEventListener(){}};
 const context={...engine,...combat,...city,...scene,...story6,...story8,...final9,presentStoryCard,presentWorldHud,document:doc,window:win,console,crypto:{getRandomValues:a=>{a[0]=1203;return a;}},performance:{now:()=>1000},matchMedia:()=>({matches:false}),AbortController,ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout,clearTimeout,PixiPainter:class{constructor(){this.ready=Promise.resolve();this.loaded=false;}resize(){}map(){}render(){}destroy(){}}};vm.createContext(context);
 const code=fs.readFileSync(new URL('../dist/game-v3.mjs',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');vm.runInContext(code,context);return {doc,eval:s=>vm.runInContext(s,context)};
}

test('actual pause/resume/restart button handlers freeze the full run and block actions; Sight HUD reports locked/available/active',()=>{
 const h=uiHarness();h.doc.getElementById('start').click();const g=h.eval('game');g.kills=5;g.defeated=['Sumon Mia'];g.player.hp=37;g.player.sightCooldown=0;
 h.doc.getElementById('pause').click();assert.equal(g.status,'paused');assert(!h.doc.getElementById('pause-screen').classList.contains('hidden'));const snapshot=JSON.stringify(g);
 h.eval('frame(601000)');for(const id of ['attack','slap','sight','mirror','fuchka-eat'])h.doc.getElementById(id).click();assert.equal(JSON.stringify(g),snapshot);h.doc.getElementById('resume').click();assert.equal(g.status,'playing');h.eval('frame(1030)');assert.equal(g.remaining,899.97);
 h.eval('game.kills=4;syncUI()');assert.equal(h.doc.getElementById('sight-state').textContent,'SIGHT LOCKED · 4 / 5');assert(h.doc.getElementById('sight').classList.contains('hidden'));h.eval('game.kills=5;syncUI()');assert.equal(h.doc.getElementById('sight-state').textContent,'SIGHT AVAILABLE · E');h.doc.getElementById('sight').click();h.eval('syncUI()');assert.equal(h.doc.getElementById('sight-state').textContent,'SIGHT ACTIVE · 5s');
 h.doc.getElementById('pause').click();h.doc.getElementById('restart-pause').click();const fresh=h.eval('game');assert.notEqual(fresh,g);assert.equal(fresh.player.hp,100);assert.equal(fresh.remaining,900);assert.equal(fresh.kills,0);assert.equal(fresh.chapter,0);assert.deepEqual(fresh.defeated,[]);assert(!fresh.finalMission.spawned);assert(fresh.fuchka.shops.every(s=>!s.used));assert.equal(fresh.player.sight,0);assert.equal(fresh.status,'playing');
});

test('boss nameplates, health UI, targeting and map locations conceal outside active Sight',()=>{
 const h=uiHarness();h.doc.getElementById('start').click();const g=h.eval('game');g.actors=[];g.kills=5;g.points=150;engine.spawnBoss(g);const a=g.actors.find(a=>a.kind==='boss');Object.assign(a,{x:g.player.x+45,y:g.player.y});const painter=Object.create(Painter.prototype);painter.rig=()=>{};painter.light={night:0};
 for(const active of [false,true,false]){g.player.sight=active?3:0;h.eval('syncUI()');assert.equal(h.doc.getElementById('boss-health').classList.contains('hidden'),!active);assert.equal(!!engine.objectivePosition(g),active);const c=recorder();painter.actor(c,a,g,1);assert.equal(c.calls.some(x=>x[0]==='fillText'&&x[1]==='Sumon Mia'),active);}
});
