import {project,screenDirection} from './scene-v3.mjs';
import {RULES,TYPES,BOSSES,createRun,update,useSight,attack,dash,formatTime,currentBoss} from './engine-v3.mjs';
import {PixiPainter} from './pixi-renderer.mjs';
const $=id=>document.getElementById(id),painter=new PixiPainter($('game'));
const lifecycle=new AbortController(),pendingSounds=new Set();let frameId=0,disposed=false;
const on=(target,event,handler)=>target.addEventListener(event,handler,{signal:lifecycle.signal});
const after=(fn,delay)=>{const id=setTimeout(()=>{pendingSounds.delete(id);if(!disposed)fn();},delay);pendingSounds.add(id);};
let game=createRun(4561),started=false,paused=false,mapOpen=false,clockLast=0,uiTick=0,shownMessage='',lastOutcome='';
const keys=new Set();let touch={x:0,y:0},holdingAttack=false,joyId=null,muted=true,audio=null;
let animTime=0;const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const resizeObserver=new ResizeObserver(()=>painter.resize());resizeObserver.observe($('arena'));painter.resize();
painter.ready.then(()=>{$('start').disabled=false;$('start-label').textContent='Return to Mirpur';}).catch(e=>{$('start-label').textContent='Game could not start — reload with WebGL enabled';console.error(e);});
function tone(f,d=.12,type='sine',vol=.025,end=0){
 if(muted)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);if(end)o.frequency.exponentialRampToValueAtTime(end,audio.currentTime+d);v.gain.setValueAtTime(vol,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+d);}catch{}
}
function sounds(){
 for(const e of game.events){
  if(e==='sight'){tone(520,.7,'sine',.04,1050);after(()=>tone(780,.6),100);}
  if(e==='swing')tone(230,.1,'triangle',.018,70);if(e==='hit')tone(100,.08,'square',.012,45);
  if(e==='hurt')tone(130,.17,'sawtooth',.02,60);if(e==='dash')tone(420,.16,'triangle',.02,90);if(e==='kill')tone(640,.2,'sine',.03,980);
  if(e==='boss')tone(90,1,'triangle',.045,160);if(e==='lose')tone(160,.8,'triangle',.04,45);
  if(e==='win'||e==='chapter')[440,550,660,880].forEach((f,i)=>after(()=>tone(f,.6,'sine',.035),i*140));
 }game.events.length=0;
}
function clearInput(){keys.clear();touch={x:0,y:0};holdingAttack=false;joyId=null;$('stick').style.transform='';}
function start(){
 game=createRun(crypto.getRandomValues(new Uint32Array(1))[0]);started=true;paused=false;mapOpen=false;lastOutcome='';shownMessage='';clearInput();
 painter.camera=project(game.player.x,game.player.y);
 for(const id of ['start-screen','pause-screen','end-screen','map-screen'])$(id).classList.add('hidden');
 $('hud').classList.remove('hidden');$('controls').classList.remove('hidden');clockLast=performance.now();tone(440,.3);syncUI();
}
function setPause(value,forMap=false){
 if(!started||!['playing','paused'].includes(game.status))return;
 paused=value;mapOpen=value&&forMap;game.status=value?'paused':'playing';clearInput();clockLast=performance.now();
 $('pause-screen').classList.toggle('hidden',!value||forMap);$('map-screen').classList.toggle('hidden',!mapOpen);
 $('controls').classList.toggle('hidden',value);$('message').classList.add('hidden');
 if(mapOpen)painter.map($('large-map'),game,true);
}
on($('start'),'click',start);on($('restart'),'click',start);on($('restart-pause'),'click',start);
on($('pause'),'click',()=>setPause(true));on($('resume'),'click',()=>setPause(false));
on($('map-open'),'click',()=>setPause(true,true));on($('map-close'),'click',()=>setPause(false));
on($('help-toggle'),'click',()=>{const open=$('help-content').classList.toggle('hidden');$('help-toggle').setAttribute('aria-expanded',String(!open));});
on($('sound'),'click',()=>{muted=!muted;$('sound').setAttribute('aria-label',muted?'Turn sound on':'Turn sound off');$('sound').classList.toggle('on',!muted);tone(650,.1);});
on($('fullscreen'),'click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').title='Fullscreen is unavailable here';}});
on(document,'fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');painter.resize();});
on(document,'visibilitychange',()=>{if(document.hidden&&started&&game.status==='playing')setPause(true);});
on(window,'blur',clearInput);
const gameKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE','ShiftLeft','ShiftRight','Escape','KeyM'];
on(window,'keydown',e=>{
 if(!gameKeys.includes(e.code)||!started)return;
 if(e.code==='Escape'){e.preventDefault();setPause(!paused);return;}
 if(e.code==='KeyM'&&!e.repeat){e.preventDefault();setPause(!mapOpen,true);return;}
 if(paused||game.status!=='playing')return;e.preventDefault();keys.add(e.code);
 if(!e.repeat&&e.code==='KeyE')useSight(game);
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
on($('attack'),'pointerdown',e=>{e.preventDefault();holdingAttack=true;$('attack').setPointerCapture(e.pointerId);attack(game);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])on($('attack'),ev,()=>holdingAttack=false);
on($('attack'),'click',e=>{if(e.detail===0)attack(game);});
on($('game'),'pointerdown',e=>{if(e.pointerType==='mouse'&&started&&!paused){const r=$('game').getBoundingClientRect(),point=painter.screenToWorld(e.clientX-r.left,e.clientY-r.top),x=point.x-game.player.x,y=point.y-game.player.y,d=Math.hypot(x,y)||1;game.player.facingX=x/d;game.player.facingY=y/d;attack(game);}});
function syncUI(){
 const p=game.player,b=currentBoss(game);$('timer').textContent=formatTime(game.remaining);$('timer').parentElement.classList.toggle('urgent',game.remaining<60);
 $('chapter-time').textContent=`CHAPTER ${Math.min(3,game.chapter+1)} · BORROWED TIME`;
 $('health-text').textContent=`${Math.ceil(p.hp)} / 100`;$('health-fill').style.width=`${p.hp}%`;
 $('score').textContent=game.points;$('threshold').textContent=b.threshold;
 $('objective-text').textContent=`${game.phase==='boss'?'Defeat':'Find'} ${b.name}`;
 $('quest-detail').textContent=game.phase==='boss'?`${b.district} · Follow the red marker`:`${game.points} / ${b.threshold} points · Reveal hidden enemies`;
 $('quest-lock').textContent=game.phase==='boss'?'⚔':'⌑';
 for(let i=0;i<3;i++)$('pip-'+i).className=i<game.chapter?'done':i===game.chapter?'current':'';
 $('sight').classList.toggle('active',p.sight>0);
 for(const[id,value]of[['sight-cd',p.sightCooldown],['dodge-cd',p.dashCooldown]]){$(id).style.display=value>0?'grid':'none';$(id).textContent=Math.ceil(value);}
 const boss=game.actors.find(a=>a.kind==='boss'&&!a.dead);$('boss-health').classList.toggle('hidden',!boss);
 if(boss){$('boss-name').textContent=boss.label.toUpperCase();$('boss-fill').style.width=`${boss.hp/boss.maxHp*100}%`;}
 const show=started&&!paused&&game.status==='playing'&&game.messageTime>0;$('message').classList.toggle('hidden',!show);
 if(show&&game.message!==shownMessage){$('message').textContent=game.message;shownMessage=game.message;}
 if(painter.loaded)painter.map($('mini-map'),game);
 if(['won','lost'].includes(game.status)&&lastOutcome!==game.status){
  clearInput();$('controls').classList.add('hidden');$('message').classList.add('hidden');$('end-screen').classList.remove('hidden');lastOutcome=game.status;
  const won=game.status==='won';$('end-kicker').textContent=won?'THREE NAMES. ONE RETURN.':'THE RIVER REMEMBERS';
  $('end-title').textContent=won?'The final name falls.':'Your light has faded.';
  $('end-description').textContent=won?'Sumon Mia, Hafizur Rahman, and Sohel Rana have fallen. Pushpo’s borrowed life has brought the truth to light.':game.reason;
  $('end-stats').replaceChildren(...[[game.points,'Points'],[`${game.defeated.length} / 3`,'Bosses defeated'],[formatTime(game.remaining),'Time remaining']].map(([value,label])=>{const span=document.createElement('span'),strong=document.createElement('strong');strong.textContent=value;span.append(strong,label);return span;}));
 }
}
function frame(now){
 if(disposed)return;
 const dt=clockLast?(now-clockLast)/1000:0;clockLast=now;
 if(started&&!paused&&game.status==='playing'){update(game,dt,{...movement(),attack:holdingAttack||keys.has('Space')});sounds();}
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
