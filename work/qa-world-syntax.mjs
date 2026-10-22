
import {PixiPainter} from './pixi-renderer.mjs';
import {createRun,eatFuchka,update,clearPath} from './engine-v3.mjs';
import {FUCHKA_STALLS,project} from './scene-v3.mjs';
import {daylightAt} from './world-v10.mjs';
import {presentWorldHud} from './world-ui-v10.mjs';
const markup=new DOMParser().parseFromString(await(await fetch('./index.html')).text(),'text/html'),scene=document.querySelector('#scene'),hud=document.createElement('div');hud.className='hud';
hud.append(document.importNode(markup.querySelector('.hero-hud'),true),document.importNode(markup.getElementById('world-time'),true));scene.append(hud,document.importNode(markup.getElementById('fuchka-eat'),true));
const painter=new PixiPainter(document.querySelector('#stage'));await painter.ready;let game,last=performance.now(),time=0,frameId=0;
function go(i){Object.assign(game.player,FUCHKA_STALLS[i].approach);painter.camera=project(game.player.x,game.player.y);painter.camera.y-=55;}
function fresh(){game=createRun(10001);game.remaining=100000;game.phase='boss';game.player.invulnerable=100000;game.player.hp=42;go(0);}
fresh();for(let i=0;i<3;i++)document.querySelector('#shop-'+i).onclick=()=>go(i);
for(const [name,elapsed]of [['day',100],['dusk',198],['night',300],['dawn',408]])document.querySelector('#'+name).onclick=()=>{game.elapsed=elapsed;};
document.querySelector('#hurt').onclick=()=>{game.player.hp=Math.max(1,game.player.hp-40);};document.querySelector('#advance').onclick=()=>update(game,210);
document.querySelector('#pause-world').onclick=()=>{game.status=game.status==='paused'?'playing':'paused';last=performance.now();};document.querySelector('#reset').onclick=fresh;document.querySelector('#fuchka-eat').onclick=()=>eatFuchka(game);
window.addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat){e.preventDefault();eatFuchka(game);}});
const observer=new ResizeObserver(()=>painter.resize());observer.observe(scene);painter.resize();
function frame(now){const dt=Math.min(.06,(now-last)/1000);last=now;update(game,dt);if(game.status==='playing')time+=dt;presentWorldHud(document,game,true,clearPath);painter.render(game,time,true);document.querySelector('#result').textContent=`${daylightAt(game.elapsed).label} · clock ${game.elapsed.toFixed(1)}s · ${game.status} · health ${game.player.hp}/${game.player.maxHp} · meals ${game.fuchka.shops.filter(s=>s.used).length}/3 · litter ${painter.litter.length} (baked) · ${game.lastMeal?'last recovery +'+game.lastMeal.recovered:'no meals yet'}`;frameId=requestAnimationFrame(frame);}
frameId=requestAnimationFrame(frame);window.addEventListener('pagehide',()=>{cancelAnimationFrame(frameId);observer.disconnect();painter.destroy();},{once:true});
