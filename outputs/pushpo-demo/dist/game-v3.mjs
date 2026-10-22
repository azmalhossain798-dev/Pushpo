import {project,screenDirection} from './scene-v3.mjs';
import {RULES,TYPES,BOSSES,createRun,update,useSight,attack,dash,formatTime,currentBoss,continueStory,useWaterMirror,eatFuchka,clearPath,pauseRun} from './engine-v3.mjs';
import {enemyIdentified} from './city-systems.mjs';
import {sightAvailable,mirrorAvailable,combatReady} from './combat-v7.mjs';
import {currentStoryBeat} from './story-v6.mjs';
import {presentStoryCard} from './story-ui-v8.mjs';
import {OPENING_STORY,AWAKENING_STORY,chapterClockActive} from './story-v8.mjs';
import {finalActive,finalGroup} from './final-v9.mjs';
import {presentWorldHud} from './world-ui-v10.mjs';
import {PixiPainter} from './pixi-renderer.mjs';
const $=id=>document.getElementById(id),painter=new PixiPainter($('game'));
$('story-summary').textContent=OPENING_STORY;$('awakening-summary').textContent=AWAKENING_STORY;
const lifecycle=new AbortController(),pendingSounds=new Set();let frameId=0,disposed=false;
const on=(target,event,handler)=>target.addEventListener(event,handler,{signal:lifecycle.signal});
const after=(fn,delay)=>{const id=setTimeout(()=>{pendingSounds.delete(id);if(!disposed)fn();},delay);pendingSounds.add(id);};
let game=createRun(4561),started=false,paused=false,mapOpen=false,clockLast=0,uiTick=0,shownMessage='',lastOutcome='',shownBeat='';
const keys=new Set();let touch={x:0,y:0},joyId=null,muted=true,audio=null;
let animTime=0;const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const resizeObserver=new ResizeObserver(()=>painter.resize());resizeObserver.observe($('arena'));painter.resize();
painter.ready.then(()=>{$('start').disabled=false;$('start-label').textContent='Get Revenge';}).catch(e=>{$('start-label').textContent='Game could not start — reload with WebGL enabled';console.error(e);});
function tone(f,d=.12,type='sine',vol=.025,end=0){
 if(muted)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);if(end)o.frequency.exponentialRampToValueAtTime(end,audio.currentTime+d);v.gain.setValueAtTime(vol,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch{}
}
function sounds(){
 for(const e of game.events){
  if(e==='metro'){tone(115,.8,'sine',.018,150);}
  if(e==='sight'){tone(520,.7,'sine',.04,1050);after(()=>tone(780,.6),100);}
  if(e==='swing')tone(230,.1,'triangle',.018,70);if(e==='hit')tone(100,.08,'square',.012,45);
  if(e==='hurt')tone(130,.17,'sawtooth',.02,60);if(e==='dash')tone(420,.16,'triangle',.02,90);if(e==='kill')tone(640,.2,'sine',.03,980);
  if(e==='mirror'||e==='block')tone(780,.3,'sine',.025,1200);if(e==='unlock')tone(880,.6,'sine',.03,1320);
  if(e==='freeze')tone(360,.75,'sine',.035,1400);
  if(e==='eat'){tone(660,.2,'sine',.025,880);after(()=>tone(990,.3),120);}
  if(e==='boss')tone(90,1,'triangle',.045,160);if(e==='lose')tone(160,.8,'triangle',.04,45);
  if(e==='win'||e==='chapter')[440,550,660,880].forEach((f,i)=>after(()=>tone(f,.6,'sine',.035),i*140));
 }game.events.length=0;
}
function clearInput(){keys.clear();touch={x:0,y:0};joyId=null;$('stick').style.transform='';}
function start(){
 game=createRun(crypto.getRandomValues(new Uint32Array(1))[0]);started=true;paused=false;mapOpen=false;lastOutcome='';shownMessage='';shownBeat='';clearInput();
 painter.camera=project(game.player.x,game.player.y);
 for(const id of ['start-screen','pause-screen','end-screen','map-screen','story-screen','casebook-screen','cinematic-walk'])$(id).classList.add('hidden');
 $('hud').classList.remove('hidden');$('controls').classList.remove('hidden');clockLast=performance.now();tone(440,.3);syncUI();
}
function setPause(value,forMap=false,forCases=false){
 if(!started||game.story||!['playing','paused'].includes(game.status))return;
 if(!pauseRun(game,value))return;paused=value;mapOpen=value&&forMap;clearInput();clockLast=performance.now();
 $('pause-screen').classList.toggle('hidden',!value||forMap||forCases);$('map-screen').classList.toggle('hidden',!mapOpen);$('casebook-screen').classList.toggle('hidden',!value||!forCases);
 $('controls').classList.toggle('hidden',value);$('message').classList.add('hidden');
 if(mapOpen)painter.map($('large-map'),game,true);
 if(forCases){$('casebook-summary').textContent=`${game.hercules.kills} independent hunts completed. These notes were left in the victims’ pockets. Hercules is still investigating Sohel Rana.`;
  $('casebook-notes').replaceChildren(...game.hercules.notes.map(n=>{const li=document.createElement('li');li.textContent=`Case ${n.id} · ${n.text}`;return li;}));
  if(!game.hercules.notes.length){const li=document.createElement('li');li.textContent='His first independent hunt is underway.';$('casebook-notes').append(li);}
 }
}
on($('start'),'click',start);on($('restart'),'click',start);on($('restart-pause'),'click',start);
on($('pause'),'click',()=>setPause(true));on($('resume'),'click',()=>setPause(false));
on($('story-next'),'click',()=>{continueStory(game);clearInput();clockLast=performance.now();syncStory();syncUI();});
on($('map-open'),'click',()=>setPause(true,true));on($('map-close'),'click',()=>setPause(false));
on($('casebook-open'),'click',()=>setPause(true,false,true));on($('casebook-close'),'click',()=>setPause(false));
on($('help-toggle'),'click',()=>{const open=$('help-content').classList.toggle('hidden');$('help-toggle').setAttribute('aria-expanded',String(!open));});
on($('sound'),'click',()=>{muted=!muted;$('sound').setAttribute('aria-label',muted?'Turn sound on':'Turn sound off');$('sound').classList.toggle('on',!muted);tone(650,.1);});
on($('fullscreen'),'click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').title='Fullscreen is unavailable here';}});
on(document,'fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');painter.resize();});
on(document,'visibilitychange',()=>{if(document.hidden&&started&&game.status==='playing')setPause(true);});
on(window,'blur',clearInput);
const gameKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','KeyE','KeyQ','KeyR','KeyF','ShiftLeft','ShiftRight','Escape','KeyM'];
on(window,'keydown',e=>{
 if(!gameKeys.includes(e.code)||!started)return;
 if(game.story){e.preventDefault();if(!e.repeat&&['Enter','Space'].includes(e.code))$('story-next').click();return;}
 if(e.code==='Escape'){e.preventDefault();setPause(!paused);return;}
 if(e.code==='KeyM'&&!e.repeat){e.preventDefault();setPause(!mapOpen,true);return;}
 if(paused||game.status!=='playing'||e.code==='Enter')return;e.preventDefault();keys.add(e.code);
 if(!e.repeat&&e.code==='KeyE')useSight(game);
 if(!e.repeat&&e.code==='KeyQ')attack(game,'slap');if(!e.repeat&&e.code==='Space')attack(game);if(!e.repeat&&e.code==='KeyR')useWaterMirror(game);
 if(!e.repeat&&e.code==='KeyF'){eatFuchka(game);syncUI();}
 if(!e.repeat&&e.code.startsWith('Shift')){const i=movement();dash(game,i.x,i.y);}
});
on(window,'keyup',e=>keys.delete(e.code));
function movement(){
 let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x;
 let y=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+touch.y;
 const d=Math.hypot(x,y);if(d>1){x/=d;y/=d;}return screenDirection(x,y);
}
const joy=$('joystick');
function stickAt(e){
 const r=joy.getBoundingClientRect(),radius=r.width*.28,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),f=d>radius?radius/d:1;
 touch={x:dx*f/radius,y:dy*f/radius};$('stick').style.transform=`translate(${dx*f}px,${dy*f}px)`;
}
on(joy,'pointerdown',e=>{if(joyId!==null)return;e.preventDefault();joyId=e.pointerId;joy.setPointerCapture(e.pointerId);stickAt(e);});
on(joy,'pointermove',e=>{if(e.pointerId===joyId)stickAt(e);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])on(joy,ev,e=>{if(e.pointerId===joyId){joyId=null;touch={x:0,y:0};$('stick').style.transform='';}});
on($('sight'),'click',()=>useSight(game));on($('dodge'),'click',()=>{const i=movement();dash(game,i.x,i.y);});
on($('slap'),'click',()=>attack(game,'slap'));on($('attack'),'click',()=>attack(game));on($('mirror'),'click',()=>useWaterMirror(game));
on($('fuchka-eat'),'click',()=>{eatFuchka(game);syncUI();});
on($('game'),'pointerdown',e=>{if(e.pointerType==='mouse'&&started&&!paused&&combatReady(game)){const r=$('game').getBoundingClientRect(),point=painter.screenToWorld(e.clientX-r.left,e.clientY-r.top),x=point.x-game.player.x,y=point.y-game.player.y,d=Math.hypot(x,y)||1;game.player.facingX=x/d;game.player.facingY=y/d;attack(game);}});
function syncUI(){
 const p=game.player,b=currentBoss(game),interlude=!chapterClockActive(game);$('timer').textContent=interlude?'—:—':formatTime(game.remaining);$('timer').parentElement.classList.toggle('urgent',!interlude&&game.remaining<60);
 $('chapter-time').textContent=interlude?'INTERLUDE · BORROWED LIFE':`CHAPTER ${Math.min(3,game.chapter+1)} · BORROWED TIME`;
 presentWorldHud(document,game,started&&!paused,clearPath);
 $('score').textContent=game.points;$('threshold').textContent=b.threshold;
 $('objective-text').textContent=`${game.phase==='boss'?'Defeat':'Find'} ${b.name}`;
 $('quest-detail').textContent=game.phase==='boss'?`${b.district} · Activate Sight to locate`:game.chapter===1?`${Math.max(0,game.points-game.chapterStartPoints)} / 150 new points · Reveal Hafizur`:`${game.points} / ${b.threshold} points · Reveal hidden enemies`;
 if(!sightAvailable(game))$('quest-detail').textContent=`${game.kills} / 5 defeated · Awaken Sight${game.tutorial?.guided&&!game.kills?' · Watch approaching attackers':''}`;
 if(interlude){$('objective-text').textContent=game.hercules.introComplete?'Await Hercules’s lead':'A figure around the corner';$('quest-detail').textContent=game.hercules.introComplete?`Sohel Rana · Investigation underway · ${game.hercules.kills} independent hunts`:'Hafizur defeated · Read the story';$('threshold').textContent='—';}
 const mission=game.finalMission,finale=finalActive(game),rescue=mission.state==='rescue',h=game.actors.find(a=>a.role==='hercules');
 if(mission.state==='travelling'){$('objective-text').textContent='Hercules has a lead';$('quest-detail').textContent='He is heading to East Junction roundabout';}
 if(finale){$('timer').textContent=rescue?formatTime(mission.remaining):'✓';$('timer').parentElement.classList.toggle('urgent',rescue&&mission.remaining<=20);$('chapter-time').textContent=rescue?'RESCUE · REACH HERCULES':'RESCUED · FIGHT TOGETHER';$('objective-text').textContent=rescue?'Hercules needs help!':'Defeat Rana and both companions';$('quest-detail').textContent=rescue?'East Junction roundabout · Follow violet marker':`${finalGroup(game).filter(a=>a.dead).length} / 3 defeated · Keep Hercules alive`;$('quest-lock').textContent='⚔';}
 $('ally-health').classList.toggle('hidden',!finale||!h);
 if(finale&&h){$('ally-name').textContent=`HERCULES · ${Math.ceil(h.hp)} / ${h.maxHp}`;$('ally-fill').style.width=`${Math.max(0,h.hp/h.maxHp*100)}%`;$('freeze-status').textContent=h.freezeTime>0?'TIME STILL · 3 SECOND FREEZE':h.freezeCooldown>0?`FREEZE · ${Math.ceil(h.freezeCooldown)}s`:'FREEZE READY · 3s / 12s';}
 $('casebook-open').classList.toggle('hidden',!game.hercules.introComplete);$('casebook-open').title=`Hercules: ${game.hercules.kills} pocket notes`;
 $('quest-lock').textContent=game.phase==='boss'||finale?'⚔':'⌑';
 for(let i=0;i<3;i++)$('pip-'+i).className=i<game.chapter?'done':i===game.chapter?'current':'';
 $('sight').classList.toggle('active',p.sight>0);$('sight-state').textContent=!sightAvailable(game)?`SIGHT LOCKED · ${Math.min(5,game.kills)} / 5` : p.sight>0?`SIGHT ACTIVE · ${Math.ceil(p.sight)}s`:p.sightCooldown>0?'SIGHT RECHARGING':'SIGHT AVAILABLE · E';$('sight').setAttribute('aria-pressed',String(p.sight>0));
 $('sight').classList.toggle('hidden',!sightAvailable(game));$('mirror').classList.toggle('hidden',!mirrorAvailable(game));
 const ready=started&&!paused&&combatReady(game);$('slap').disabled=$('attack').disabled=!ready||p.attack>0;$('sight').disabled=!ready||!sightAvailable(game)||p.sightCooldown>0;$('mirror').disabled=!ready||!mirrorAvailable(game)||p.mirrorCooldown>0;
 $('combo-next').textContent=`SPACE · NEXT: ${(p.nextCombo??'punch').toUpperCase()}`;$('mirror').classList.toggle('active',p.mirrorTime>0);$('mirror-status').textContent=p.mirrorTime>0?`PROTECTED · ${p.mirrorTime.toFixed(1)}s`:p.mirrorCooldown>0?'RECHARGING':'R · AUTO READY';
 for(const[id,value]of[['sight-cd',p.sightCooldown],['dodge-cd',p.dashCooldown],['mirror-cd',p.mirrorTime>0?0:p.mirrorCooldown??0]]){$(id).style.display=value>0?'grid':'none';$(id).textContent=Math.ceil(value);}
 const notice=started&&!paused&&!game.story&&game.status==='playing'&&game.unlockNotice?.time>0;$('unlock-notice').classList.toggle('hidden',!notice);if(notice)$('unlock-notice').textContent=game.unlockNotice.text;
 const boss=game.actors.find(a=>a.kind==='boss'&&enemyIdentified(a,game));$('boss-health').classList.toggle('hidden',!boss);
 if(boss){$('boss-name').textContent=boss.label.toUpperCase();$('boss-fill').style.width=`${boss.hp/boss.maxHp*100}%`;}
 if(finale&&finalGroup(game).some(a=>enemyIdentified(a,game))){const group=finalGroup(game),hp=group.reduce((n,a)=>n+a.hp,0),maximum=group.reduce((n,a)=>n+a.maxHp,0);$('boss-health').classList.remove('hidden');$('boss-name').textContent=`RANA’S GROUP · ${Math.ceil(hp)} / ${maximum}`;$('boss-fill').style.width=`${hp/maximum*100}%`;}
 const show=started&&!paused&&!game.story&&game.status==='playing'&&game.messageTime>0;$('message').classList.toggle('hidden',!show);
 if(show&&game.message!==shownMessage){$('message').textContent=game.message;shownMessage=game.message;}
 if(painter.loaded)painter.map($('mini-map'),game);
 if(['won','lost'].includes(game.status)&&lastOutcome!==game.status){
  clearInput();$('controls').classList.add('hidden');$('message').classList.add('hidden');$('end-screen').classList.remove('hidden');lastOutcome=game.status;
  const won=game.status==='won';$('end-kicker').textContent=won?'THREE NAMES. ONE RETURN.':'THE RIVER REMEMBERS';
  $('end-title').textContent=won?'আলোর রেখা বেঁচে থাকে।':'Your light has faded.';
  $('end-description').textContent=won?'পুষ্পোর বিদায়, হারকিউলিসের প্রতিজ্ঞা। নিরীহ মানুষের পাশে দাঁড়ানোর এই পথ এখানেই শেষ নয়।':game.reason;
  $('end-stats').replaceChildren(...[[game.points,'Points'],[`${game.defeated.length} / 3`,'Bosses defeated'],[formatTime(game.finalMission.spawned?game.finalMission.remaining:game.remaining),game.finalMission.spawned?'Rescue time left':'Time remaining']].map(([value,label])=>{const span=document.createElement('span'),strong=document.createElement('strong');strong.textContent=value;span.append(strong,label);return span;}));
 }
}
function syncStory(){
 const beat=currentStoryBeat(game),show=started&&!!beat&&game.status==='playing';$('story-screen').classList.toggle('hidden',!show);
 if(!show){if(shownBeat&&!paused&&game.status==='playing')$('controls').classList.remove('hidden');shownBeat='';return;}
 $('controls').classList.add('hidden');$('message').classList.add('hidden');
 $('fuchka-eat').classList.add('hidden');
 if(shownBeat===beat.id)return;shownBeat=beat.id;clearInput();
 presentStoryCard(document,game,beat);
}
function syncCinematic(){
 const active=!!game.cinematic;$('cinematic-walk').classList.toggle('hidden',!active||game.cinematic.phase!=='approach'||paused);
 if(started){$('hud').classList.toggle('cinematic-hud',active);if(active)$('controls').classList.add('hidden');else if(!paused&&!game.story&&game.status==='playing')$('controls').classList.remove('hidden');}
}
function frame(now){
 if(disposed)return;
 const dt=clockLast?(now-clockLast)/1000:0;clockLast=now;
 if(started&&!paused&&game.status==='playing'){update(game,dt,movement());sounds();}
 syncStory();
 syncCinematic();
 if(!paused)animTime+=Math.min(dt,.08);
 painter.render(game,reducedMotion?0:animTime,started);
 uiTick+=dt;if(uiTick>.08){syncUI();uiTick=0;}frameId=requestAnimationFrame(frame);
}
frameId=requestAnimationFrame(frame);

function disposeGame(){
 if(disposed)return;disposed=true;cancelAnimationFrame(frameId);resizeObserver.disconnect();lifecycle.abort();clearInput();
 for(const id of pendingSounds)clearTimeout(id);pendingSounds.clear();audio?.close().catch(()=>{});painter.destroy();
}
on(window,'pagehide',e=>{if(!e.persisted)disposeGame();});
on(window,'pageshow',()=>{clockLast=performance.now();});
