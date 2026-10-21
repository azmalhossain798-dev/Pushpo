import {RULES,WORLD,createRun,update,useSight,attack,dash,formatTime} from './engine.mjs';

const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});
const bg=new Image();bg.src='assets/mirpur-plaza.png';
let game=createRun(92817),started=false,paused=false,last=0,view={width:0,height:0,scale:1,x:0,y:0};
let keys=new Set(),touch={x:0,y:0},heldAttack=false,joyPointer=null,muted=true,audio=null;
let camera={x:835,y:510},shake=0,shownMessage='',lastStatus='playing';
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const shirts=['#e7d3ac','#a65752','#528a8c','#6c8260','#72759e','#b88b55','#503e4b'];
const pants=['#2f4149','#354449','#304751','#344b42','#333346','#4d3e36'];
function resize(){
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
  view.width=rect.width;view.height=rect.height;view.dpr=dpr;
  view.scale=Math.max(rect.width/1450,rect.height/900);
}
new ResizeObserver(resize).observe($('arena'));resize();
bg.onload=()=>{$('start').disabled=false;$('start-label').textContent='Enter Mirpur 10';};
bg.onerror=()=>{$('start').disabled=false;$('start-label').textContent='Enter Mirpur 10';};
if(bg.complete&&bg.naturalWidth)bg.onload();

function tone(f,d=.1,type='sine',volume=.035,slide=0){
  if(muted)return;
  try{
    audio??=new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume();
    const o=audio.createOscillator(),gain=audio.createGain();
    o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,audio.currentTime+d);
    gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);
    o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+d);
  }catch{}
}
function sounds(){
  for(const e of game.events){
    if(e==='sight'){tone(520,.7,'sine',.05,1050);setTimeout(()=>tone(780,.6,'sine',.035),100);}
    if(e==='swing')tone(230,.1,'triangle',.02,70);
    if(e==='hit')tone(100,.08,'square',.015,45);
    if(e==='hurt'){tone(130,.17,'sawtooth',.025,60);if(!reduceMotion)shake=6;}
    if(e==='dash')tone(420,.16,'triangle',.02,90);
    if(e==='kill')tone(640,.2,'sine',.035,980);
    if(e==='boss'){tone(90,1,'triangle',.05,160);if(!reduceMotion)shake=8;}
    if(e==='win'){[440,550,660,880].forEach((f,i)=>setTimeout(()=>tone(f,.6,'sine',.04),i*150));}
    if(e==='lose')tone(160,.8,'triangle',.04,45);
  }
  game.events.length=0;
}
function clearInput(){keys.clear();touch={x:0,y:0};heldAttack=false;joyPointer=null;$('stick').style.transform='';}
function start(){
  game=createRun(crypto.getRandomValues(new Uint32Array(1))[0]);started=true;paused=false;lastStatus='playing';
  camera={x:game.player.x,y:game.player.y-35};clearInput();
  for(const id of ['start-screen','pause-screen','end-screen'])$(id).classList.add('hidden');
  for(const id of ['hud','controls'])$(id).classList.remove('hidden');
  last=performance.now();tone(440,.3);syncUI();
}
function setPaused(value){
  if(!started||!['playing','paused'].includes(game.status))return;
  paused=value;game.status=value?'paused':'playing';clearInput();last=performance.now();
  $('pause-screen').classList.toggle('hidden',!value);
  $('controls').classList.toggle('hidden',value);$('message').classList.add('hidden');
}
$('start').addEventListener('click',start);
$('restart').addEventListener('click',start);$('restart-pause').addEventListener('click',start);
$('pause').addEventListener('click',()=>setPaused(true));$('resume').addEventListener('click',()=>setPaused(false));
$('sound').addEventListener('click',()=>{muted=!muted;$('sound-label').textContent=muted?'Sound off':'Sound on';$('sound').setAttribute('aria-label',muted?'Turn sound on':'Turn sound off');tone(600,.1);});
$('fullscreen').addEventListener('click',async()=>{
  try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
  catch{$('fullscreen').title='Fullscreen is unavailable in this browser';}
});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');resize();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.status==='playing'&&started)setPaused(true);});
window.addEventListener('blur',clearInput);
const gameKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE','ShiftLeft','ShiftRight','Escape'];
window.addEventListener('keydown',e=>{
  if(!gameKeys.includes(e.code)||!started)return;
  if(e.code==='Escape'){e.preventDefault();setPaused(!paused);return;}
  if(paused||game.status!=='playing')return;
  e.preventDefault();keys.add(e.code);
  if(!e.repeat&&e.code==='KeyE')useSight(game);
  if(!e.repeat&&e.code.startsWith('Shift')){const i=movement();dash(game,i.x,i.y);}
});
window.addEventListener('keyup',e=>keys.delete(e.code));
function movement(){
  let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+touch.x;
  let y=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+touch.y;
  const d=Math.hypot(x,y);if(d>1){x/=d;y/=d;}return{x,y};
}
const joystick=$('joystick');
function positionStick(e){
  const r=joystick.getBoundingClientRect(),radius=r.width*.32,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
  const d=Math.hypot(dx,dy),f=d>radius?radius/d:1;
  touch={x:dx*f/radius,y:dy*f/radius};
  $('stick').style.transform=`translate(${dx*f}px,${dy*f}px)`;
}
joystick.addEventListener('pointerdown',e=>{if(joyPointer!==null)return;e.preventDefault();joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);positionStick(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)positionStick(e);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,e=>{if(e.pointerId===joyPointer){joyPointer=null;touch={x:0,y:0};$('stick').style.transform='';}});
$('sight').addEventListener('click',()=>useSight(game));
$('dodge').addEventListener('click',()=>{const i=movement();dash(game,i.x,i.y);});
$('attack').addEventListener('pointerdown',e=>{e.preventDefault();heldAttack=true;$('attack').setPointerCapture(e.pointerId);attack(game);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('attack').addEventListener(name,()=>heldAttack=false);
$('attack').addEventListener('click',e=>{if(e.detail===0)attack(game);});
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&started&&!paused){const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)/view.scale+view.x-game.player.x,y=(e.clientY-r.top)/view.scale+view.y-game.player.y;const d=Math.hypot(x,y)||1;game.player.facingX=x/d;game.player.facingY=y/d;attack(game);}});
function syncUI(){
  const p=game.player;$('timer').textContent=formatTime(game.remaining);
  $('timer').parentElement.classList.toggle('urgent',game.remaining<60);
  $('health-text').textContent=`${Math.ceil(p.hp)} / 100`;$('health-fill').style.width=`${p.hp}%`;
  $('score').textContent=game.points;$('score-fill').style.width=`${Math.min(100,game.points/150*100)}%`;
  $('objective-text').textContent=game.bossSpawned?'Sumon Mia has arrived. Follow the crimson marker.':`Reveal targets · ${game.kills} / 10 defeated · Find Sumon Mia`;
  $('sight').classList.toggle('active',p.sight>0);
  for(const [id,value]of[['sight-cd',p.sightCooldown],['dodge-cd',p.dashCooldown]]){
    const el=$(id);el.style.display=value>0?'grid':'none';el.textContent=value>0?Math.ceil(value):'';
  }
  const boss=game.actors.find(a=>a.kind==='boss'&&!a.dead);
  $('boss-health').classList.toggle('hidden',!boss);
  if(boss)$('boss-fill').style.width=`${boss.hp/boss.maxHp*100}%`;
  const show=started&&!paused&&game.status==='playing'&&game.messageTime>0;
  $('message').classList.toggle('hidden',!show);
  if(show&&shownMessage!==game.message){$('message').textContent=game.message;shownMessage=game.message;}
  if(['won','lost'].includes(game.status)&&lastStatus!==game.status){
    clearInput();$('controls').classList.add('hidden');$('message').classList.add('hidden');$('end-screen').classList.remove('hidden');
    const won=game.status==='won';
    $('end-kicker').textContent=won?'CHAPTER 01 COMPLETE':'THE RIVER REMEMBERS';
    $('end-title').textContent=won?'The first name falls.':'Your light has faded.';
    $('end-description').textContent=won?'Sumon Mia is defeated. Two names remain in Pushpo’s story.':game.reason;
    $('end-stats').replaceChildren(...[
      [String(game.points),'Points earned'],[String(game.kills),'Targets defeated'],[formatTime(game.remaining),'Time remaining']
    ].map(([value,label])=>{const el=document.createElement('span'),strong=document.createElement('strong');strong.textContent=value;el.append(strong,label);return el;}));
    lastStatus=game.status;
  }
}
function ellipse(x,y,rx,ry,color,stroke=null,line=1.4){
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}
}
function path(points,fill,stroke='#182a2d',width=1.7){
  ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}
}
function line(x1,y1,x2,y2,color,width=1.5){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function fish(x,y,time,alpha=1){
  ctx.save();ctx.translate(x,y);ctx.rotate(-.18+Math.sin(time*1.4)*.08);ctx.globalAlpha=alpha;
  ctx.shadowColor='#ffcf68';ctx.shadowBlur=12;ctx.strokeStyle='#ffe5a0';ctx.lineWidth=1.8;
  ctx.beginPath();ctx.moveTo(32,0);ctx.bezierCurveTo(17,-20,-14,-16,-32,0);ctx.bezierCurveTo(-14,15,17,15,32,0);ctx.stroke();
  path([[-28,-2],[-43,-12],[-38,3],[-44,12],[-27,5]],'#f5cb5c22','#ffdb8e',1.3);
  ctx.beginPath();ctx.moveTo(24,1);ctx.quadraticCurveTo(46,5,41,13);ctx.moveTo(25,3);ctx.quadraticCurveTo(34,14,28,19);ctx.stroke();
  ellipse(21,-4,1.7,1.7,'#fff0b8');line(-5,-11,3,-19,'#ffe5a0',1.3);line(3,-19,10,-12,'#ffe5a0',1.3);
  ctx.shadowBlur=0;ctx.restore();
}
function person(a,isPlayer=false,time=0){
  const boss=a.kind==='boss',hostile=!isPlayer&&a.kind!=='civilian'&&(a.known||a.aggro);
  const scale=boss?1.23:isPlayer?1.08:1,walk=a.moving?Math.sin(a.walk):0,bob=a.moving?Math.abs(Math.sin(a.walk))*1.6:Math.sin(time*2+a.id)*.4;
  ctx.save();ctx.translate(a.x,a.y);ctx.scale(scale,scale);
  ellipse(2,3,17,6,'#08192350');
  if(hostile){
    glow(0,-14,35,'#11121dd0');ellipse(0,0,22,10,'#321b2d44','#bb776955',1);
    for(let i=0;i<5;i++){const a=time*1.6+i*1.26;ellipse(Math.cos(a)*19,-15+Math.sin(a)*17,8,10,'#14141b55');}
  }
  if(isPlayer){
    glow(0,-20,56,'#f7cb5348');ctx.strokeStyle='#f8cf77aa';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.ellipse(0,1,25,11,-.1,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<6;i++){const angle=time*.8+i*Math.PI/3;ellipse(Math.cos(angle)*29,-15+Math.sin(angle*1.4)*22,1.5,1.5,'#ffe8a7');}
  }
  ctx.translate(0,-bob);
  const face=a.face||1,skin='#b67a51',lightSkin='#dba072';
  const cloth=isPlayer?'#d55760':boss?'#75464e':shirts[a.variant%shirts.length],trousers=isPlayer?'#268071':pants[a.variant%pants.length];
  // Boots, trouser legs, shaped coat, and individual folds give the live actors painted volume.
  ellipse(-6+walk*2,1-walk*2,5,3.1,'#292e2e','#13252a');
  ellipse(7-walk*2,1+walk*2,5,3.1,'#292e2e','#13252a');
  path([[-11,-24],[-1,-23],[-2+walk*2,-1-walk*2],[-9+walk*2,-1-walk*2]],trousers);
  path([[1,-24],[10,-24],[10-walk*2,-1+walk*2],[3-walk*2,-1+walk*2]],trousers);
  line(-6,-19,-5+walk*2,-5-walk*2,isPlayer?'#73af8e':'#ffffff30',1.4);
  line(5,-20,6-walk*2,-5+walk*2,'#0d252e55',1.4);
  if(isPlayer)path([[-9,-49],[-14,-39],[-13,-19],[11,-17],[14,-37],[8,-49]],'#172c30','#102329');
  const leftSwing=walk*3,rightSwing=-walk*3;
  path([[-9,-41],[-15,-36],[-17,-24+leftSwing],[-12,-23+leftSwing],[-8,-33]],cloth);
  path([[9,-41],[15,-35],[17,-24+rightSwing],[12,-23+rightSwing],[8,-32]],cloth);
  ellipse(-14,-22+leftSwing,3,4,lightSkin,'#403d31',1);
  ellipse(14,-22+rightSwing,3,4,lightSkin,'#403d31',1);
  path([[-9,-44],[7,-44],[11,-38],[11,isPlayer?-16:-23],[-12,isPlayer?-16:-23],[-11,-36]],cloth);
  path([[3,-42],[8,-40],[9,isPlayer?-18:-24],[3,isPlayer?-18:-24]],'#00000016',null);
  line(-7,-36,-7,isPlayer?-20:-26,'#ffe6b044',1.3);
  if(isPlayer){
    path([[-9,-43],[-5,-38],[4,-34],[10,-41],[7,-45],[1,-39],[-5,-45]],'#2f9d89','#174a48',1);
    path([[5,-36],[11,-33],[15+Math.sin(time*4)*2,-21],[10,-19]],'#2f9d89','#174a48',1);
    line(-10,-38,9,-19,'#5f412e',2.4);ellipse(11,-19,5,7,'#86603e','#392f28',1.4);
  }else{
    path([[-5,-44],[0,-39],[5,-44]],'#dbc7a566',null);
    line(0,-36,0,-25,'#161e2733',1);
    for(let i=0;i<3;i++)ellipse(1,-34+i*4,.7,.7,'#dfd4b3');
  }
  ellipse(0,-45,4,5,skin,'#4c3a2f',1);
  ellipse(0,-55,10,12,'#192b2c','#112326',1.5);
  ellipse(face*2,-53,8,9.5,lightSkin,'#493f32',1);
  path([[-9,-56],[-7,-65],[0,-68],[8,-63],[10,-55],[4,-58],[0,-62],[-3,-57]],'#19282c','#152428',1);
  if(isPlayer){
    ctx.beginPath();ctx.moveTo(-6,-62);ctx.bezierCurveTo(-21,-54,-14,-39,-19,-31);ctx.quadraticCurveTo(-9,-32,-8,-49);ctx.fillStyle='#1c2a2c';ctx.fill();ctx.strokeStyle='#11242b';ctx.lineWidth=1.5;ctx.stroke();
    line(-10,-57,-14,-42,'#4b4a3c',1);ellipse(7,-49,1.3,2.2,'#f4cb6a');
  }
  line(face*1,-54,face*4,-54,'#242c29',1.5);
  line(face*7,-52,face*8,-50,'#946248',1);
  line(face*2,-48,face*5,-48,'#7f493e',1);
  if(boss||(!isPlayer&&a.variant%3===1))path([[-5,-49],[0,-47],[7,-50],[5,-43],[-2,-44]],'#28302d',null);
  if(a.flash>0){ctx.globalAlpha=.42;ellipse(0,-33,16,34,isPlayer?'#ffae84':'#fff1b9');ctx.globalAlpha=1;}
  ctx.restore();
  if(isPlayer){
    if(a.sight>0)fish(a.x+Math.sin(time*2)*32,a.y-95,time,.85);
    else fish(a.x-28,a.y-80,time,.45);
    return;
  }
  if(a.windup>0) {
    // A gray warning describes the incoming attack; the crimson ground circle shows its reach.
    ellipse(a.x,a.y-85*scale,10,10,'#626b6b','#e4dfcf',1.5);
    ctx.fillStyle='#fff5e1';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('!',a.x,a.y-80*scale);
  }else if(hostile){
    const y=a.y-80*scale;
    ctx.strokeStyle='#ff967a';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(a.x,y,8,0,Math.PI*2);ctx.stroke();
    line(a.x-12,y,a.x-5,y,'#ff967a');line(a.x+5,y,a.x+12,y,'#ff967a');line(a.x,y-12,a.x,y-5,'#ff967a');line(a.x,y+5,a.x,y+12,'#ff967a');
    if(a.hp<a.maxHp){ctx.fillStyle='#16252ad9';ctx.fillRect(a.x-19,a.y-69*scale,38,4);ctx.fillStyle='#f48d77';ctx.fillRect(a.x-19,a.y-69*scale,38*a.hp/a.maxHp,4);}
  }else if(a.known||game.player.sight>0){
    path([[a.x,a.y-77],[a.x+4,a.y-72],[a.x,a.y-67],[a.x-4,a.y-72]],'#58d6ed','#123e4b',1);
  }
}
function drawEffects(){
  for(const e of game.effects){
    ctx.save();
    if(e.type==='slash'){
      const progress=e.age/.3;if(progress>1){ctx.restore();continue;}
      ctx.translate(e.x,e.y-20);ctx.rotate(e.angle);ctx.globalAlpha=1-progress;
      ctx.strokeStyle='#ffe4a6';ctx.shadowColor='#ffbe4d';ctx.shadowBlur=12;ctx.lineWidth=8*(1-progress)+2;
      ctx.beginPath();ctx.arc(0,0,54,-.9+progress*.6,.65+progress*.6);ctx.stroke();
    }
    if(e.type==='pulse'){
      const r=e.age/1.4*RULES.sightRange;ctx.globalAlpha=(1-e.age/1.4)*.65;
      ctx.strokeStyle='#ffe0a1';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y,r,r*.72,0,0,Math.PI*2);ctx.stroke();
    }
    if(e.type==='number'){
      ctx.globalAlpha=Math.min(1,(1.2-e.age)*3);ctx.font='bold 16px "DM Sans",sans-serif';ctx.textAlign='center';ctx.shadowColor='#10252d';ctx.shadowBlur=4;ctx.fillStyle=e.color;ctx.fillText(e.text,e.x,e.y-e.age*36);
    }
    if(e.type==='vanish'||e.type==='arrival'){
      for(let i=0;i<14;i++){const a=i*Math.PI/7,r=e.age*90;ctx.globalAlpha=Math.max(0,1-e.age*1.6);ellipse(e.x+Math.cos(a)*r,e.y-25+Math.sin(a)*r*.6,2.5,2.5,'#f8d68b');}
    }
    if(e.type==='impact'){
      ctx.globalAlpha=Math.max(0,1-e.age*3);ctx.strokeStyle='#ff987b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y,(e.boss?100:49)+e.age*25,(e.boss?65:32)+e.age*15,0,0,Math.PI*2);ctx.stroke();
    }
    if(e.type==='trail'){ctx.globalAlpha=Math.max(0,.3-e.age*.7);ellipse(e.x,e.y-25,13,28,'#f8d68b');}
    ctx.restore();
  }
}
function render(time){
  const p=game.player,scale=view.scale,visibleW=view.width/scale,visibleH=view.height/scale;
  const tx=started?p.x:835,ty=started?p.y-20:505;
  camera.x+=(tx-camera.x)*.09;camera.y+=(ty-camera.y)*.09;
  view.x=Math.max(0,Math.min(WORLD.width-visibleW,camera.x-visibleW/2));
  view.y=Math.max(0,Math.min(WORLD.height-visibleH,camera.y-visibleH/2));
  if(visibleW>WORLD.width)view.x=(WORLD.width-visibleW)/2;
  if(visibleH>WORLD.height)view.y=(WORLD.height-visibleH)/2;
  ctx.setTransform(view.dpr,0,0,view.dpr,0,0);ctx.fillStyle='#213333';ctx.fillRect(0,0,view.width,view.height);
  ctx.scale(scale,scale);ctx.translate(-view.x,-view.y);
  if(shake>0){ctx.translate(Math.sin(time*100)*shake,Math.cos(time*112)*shake*.5);shake*=.88;}
  if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,WORLD.width,WORLD.height);
  else{ctx.fillStyle='#697268';ctx.fillRect(0,0,WORLD.width,WORLD.height);}
  if(p.sight>0){
    ctx.fillStyle='#132c3e44';ctx.fillRect(0,0,WORLD.width,WORLD.height);
    glow(p.x,p.y-20,RULES.sightRange,'#ffd27b35');
  }
  for(const a of game.actors)if(!a.dead&&a.windup>0){
    const range=a.kind==='boss'?100:49,fraction=1-a.windup/a.windupMax;
    ellipse(a.attackX,a.attackY,range,range*.65,`rgba(208,65,53,${.12+fraction*.22})`,'#f69073',1.5);
    ctx.beginPath();ctx.ellipse(a.attackX,a.attackY,range,range*.65,0,-Math.PI/2,-Math.PI/2+Math.PI*2*fraction);ctx.lineWidth=4;ctx.strokeStyle='#ffd5a5';ctx.stroke();
  }
  const sorted=[...game.actors.filter(a=>!a.dead),{...p,id:1000,isPlayer:true}].sort((a,b)=>a.y-b.y);
  for(const a of sorted)person(a,!!a.isPlayer,time);
  drawEffects();
  if(!reduceMotion)for(let i=0;i<14;i++){
    const x=(i*153+time*(5+i%3))%WORLD.width,y=260+((i*71+Math.sin(time*.4+i)*22)%580);
    ctx.save();ctx.translate(x,y);ctx.rotate(time*.3+i);ctx.globalAlpha=.45;ellipse(0,0,3.5,1.7,i%2?'#efc76d':'#bed081');ctx.restore();
  }
  const boss=game.actors.find(a=>a.kind==='boss'&&!a.dead);
  if(boss&&(boss.x<view.x+70||boss.x>view.x+visibleW-70||boss.y<view.y+160||boss.y>view.y+visibleH-90)){
    const x=Math.max(view.x+60,Math.min(view.x+visibleW-60,boss.x));
    const y=Math.max(view.y+160,Math.min(view.y+visibleH-90,boss.y));
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(boss.y-y,boss.x-x));path([[12,0],[-6,-8],[-6,8]],'#ffad89','#4c2831',2);ctx.restore();
    ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff2d2';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillText('SUMON MIA',x,y+24);ctx.shadowBlur=0;
  }
}
let uiTick=0;
function frame(now){
  const dt=last?(now-last)/1000:0;last=now;
  if(started&&!paused&&game.status==='playing'){
    const i=movement();update(game,dt,{...i,attack:heldAttack||keys.has('Space')});sounds();
  }
  render(now/1000);uiTick+=dt;
  if(uiTick>.06){syncUI();uiTick=0;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
