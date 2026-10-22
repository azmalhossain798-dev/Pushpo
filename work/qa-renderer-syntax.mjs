
import {Painter} from './art-v3.mjs';
import {PixiPainter} from './pixi-renderer.mjs';
import {createRun,update,useSight,attack,dash,spawnBoss,BOSSES,continueStory} from './engine-v3.mjs';
import {project,screenDirection} from './scene-v3.mjs';
const legacy=new Painter(document.querySelector('#baseline')),pixi=new PixiPainter(document.querySelector('#pixi'));
await Promise.all([legacy.ready,pixi.ready]);
let game=createRun(4561),time=2,showLegacy=false,stage=-1,disposed=false;
const output=document.querySelector('#result'),viewport=document.querySelector('#viewport');
function draw(){if(disposed)return;resetCamera();legacy.render(game,time,true);pixi.render(game,time,true);}
function resize(){const box=viewport.getBoundingClientRect();for(const painter of [legacy,pixi]){painter.resize();Object.assign(painter.view,{width:box.width,height:box.height});}draw();}
const observer=new ResizeObserver(resize);observer.observe(viewport);
function status(text){output.textContent=text;}
function resetCamera(){const q=project(game.player.x,game.player.y);for(const p of [legacy,pixi])p.camera={x:q.x,y:q.y-55};}
resetCamera();resize();status('Ready · PixiJS '+PIXI.VERSION+' · seeded scene 4561 · animation time 2s');
document.querySelector('#compare').onclick=()=>{showLegacy=!showLegacy;document.querySelector('#baseline').hidden=!showLegacy;document.querySelector('#pixi').hidden=showLegacy;document.querySelector('#compare').textContent=showLegacy?'Show PixiJS':'Show Canvas baseline';resize();};
document.querySelector('#step').onclick=()=>{for(let i=0;i<60;i++)update(game,1/60,screenDirection(1,0));time+=1;draw();status('Walked right for 60 fixed updates. Position: '+game.player.x.toFixed(1)+', '+game.player.y.toFixed(1));};
document.querySelector('#sight').onclick=()=>{game.kills=Math.max(5,game.kills);game.player.sightCooldown=0;useSight(game);attack(game);draw();status('Sight active, sword slash and fish orbit rendered.');};
document.querySelector('#boss').onclick=()=>{stage=(stage+1)%3;if(stage===2){status('Use /qa-final.html for the gated Sohel group and rescue.');return;}game=createRun(4561);game.chapter=stage;game.points=BOSSES[stage].threshold;spawnBoss(game);const b=game.actors.find(a=>a.kind==='boss');game.player.x=b.x-80;game.player.y=b.y;resetCamera();draw();status('Boss '+(stage+1)+': '+b.label);};
document.querySelector('#checks').onclick=()=>{
 const results=[],check=(name,condition)=>{if(!condition)throw Error(name);results.push(name);};
 try{
  check('WebGL renderer',pixi.app.renderer.type===PIXI.RendererType.WEBGL);
  check('automatic ticker stopped',!pixi.app.ticker.started);
  check('five scene layers including lighting',pixi.app.stage.children.length===5);
  const model=createRun(19);model.actors=[];const before=JSON.stringify(model);
  pixi.render(model,0,true);check('render does not mutate simulation',JSON.stringify(model)===before);
  const center=pixi.screenToWorld((project(model.player.x,model.player.y).x-pixi.view.x)*pixi.view.scale,(project(model.player.x,model.player.y).y-pixi.view.y)*pixi.view.scale);
  check('pointer projection',Math.hypot(center.x-model.player.x,center.y-model.player.y)<1e-6);
  model.status='paused';update(model,20);check('pause freezes clock',model.remaining===900);
  model.status='playing';model.remaining=.01;update(model,.02);check('timeout loses',model.status==='lost');
  const win=createRun(31);win.actors=[];win.traffic=[];win.kills=10;win.spawnClock=999;win.player.invulnerable=999;
  const strike=()=>{win.player.attack=0;attack(win);for(let i=0;i<40&&win.player.pendingHit;i++)update(win,.01);};
  const cards=()=>{for(let i=0;i<1600&&(win.story||win.cinematic);i++){if(win.story)continueStory(win);else update(win,.03);}};
  for(let chapter=0;chapter<2;chapter++){
   win.points=BOSSES[chapter].threshold;spawnBoss(win);const b=win.actors.find(a=>a.kind==='boss'&&!a.dead);Object.assign(win.player,{x:b.x+30,y:b.y});b.hp=35;strike();cards();
  }
  win.finalMission.investigationElapsed=90;for(let i=0;i<6000&&!win.finalMission.spawned;i++)update(win,.03);
  check('final encounter follows story gate',win.finalMission.spawned);Object.assign(win.player,{x:3730,y:2195});update(win,.03);
  const ally=win.actors.find(a=>a.role==='hercules');ally.attack=999;ally.pendingHit=null;
  for(const b of win.actors.filter(a=>a.finalEnemy)){Object.assign(win.player,{x:b.x-22,y:b.y});b.hp=35;b.windup=0;b.cooldown=999;strike();}
  check('farewell precedes victory',win.finalMission.state==='farewell'&&win.status==='playing');cards();check('three bosses and farewell win',win.status==='won'&&win.defeated.length===3);
  const fresh=createRun(32);check('fresh run resets',fresh.remaining===900&&fresh.chapter===0&&fresh.points===0);
  resetCamera();for(let i=0;i<5;i++)pixi.render(game,time,true);
  const count=()=>Object.values(pixi.draw.pools).reduce((n,p)=>n+p.items.length,0),allocated=count();
  for(let i=0;i<60;i++)pixi.render(game,time,true);
  check('display object pool stable',count()===allocated);
  check('DPR backing size',Math.abs(pixi.canvas.width-pixi.view.width*pixi.view.dpr)<2);
  status('PASS '+results.length+'/ '+results.length+': '+results.join(' · '));draw();
 }catch(error){status('FAIL: '+error.message);console.error(error);}
};
document.querySelector('#dispose').onclick=()=>{disposed=true;observer.disconnect();pixi.destroy();pixi.ready.then(()=>status('Disposed · Pixi resources released: '+pixi.released));};
window.addEventListener('pagehide',()=>{observer.disconnect();pixi.destroy();},{once:true});
