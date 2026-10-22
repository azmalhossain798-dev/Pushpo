import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {Painter} from '../outputs/pushpo-demo/dist/art-v3.mjs';
import {createRun,spawnBoss,update} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {attack,finishStories} from '../outputs/pushpo-demo/tests/combat-helpers.mjs';
import {castHerculesFreeze} from '../outputs/pushpo-demo/dist/final-v9.mjs';
import {project} from '../outputs/pushpo-demo/dist/scene-v3.mjs';
const root=process.cwd(),require=createRequire(import.meta.url),{createCanvas,Image}=require(path.join(process.argv[2],'@napi-rs/canvas'));
Object.defineProperty(Image.prototype,'naturalWidth',{get(){return this.width;}});Object.defineProperty(Image.prototype,'naturalHeight',{get(){return this.height;}});
globalThis.Image=Image;globalThis.document={createElement(name){if(name!=='canvas')throw Error(name);return createCanvas(1,1);}};
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));const canvas=createCanvas(1280,800),painter=new Painter(canvas);await painter.ready;
const g=createRun(9901);g.player.invulnerable=9999;g.kills=10;g.spawnClock=999;
for(let stage=0;stage<2;stage++){g.points=stage?300:150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);Object.assign(g.player,{x:b.x+30,y:b.y,attack:0});b.hp=35;attack(g);finishStories(g);}
g.finalMission.investigationElapsed=90;for(let i=0;i<6000&&!g.finalMission.spawned;i++)update(g,.03);
Object.assign(g.player,{x:3730,y:2195});update(g,.03);const h=g.actors.find(a=>a.role==='hercules');h.freezeCooldown=0;castHerculesFreeze(g,h);
Object.assign(painter.view,{width:1280,height:800,dpr:1,scale:1.15});painter.camera=project(3860,2190);painter.camera.y-=55;painter.render(g,8,true);fs.writeFileSync(path.join(root,'outputs/pushpo-final-scene.png'),canvas.toBuffer('image/png'));
canvas.width=544;canvas.height=884;Object.assign(painter.view,{width:544,height:884,dpr:1,scale:.9});painter.render(g,8,true);fs.writeFileSync(path.join(root,'outputs/pushpo-final-phone-canvas.png'),canvas.toBuffer('image/png'));
const board=createCanvas(1240,680),c=board.getContext('2d');c.fillStyle='#172d3c';c.fillRect(0,0,1240,680);c.fillStyle='#f1dfc1';c.font='bold 24px sans-serif';c.fillText('FINAL ENCOUNTER · APPROVED RANA CUTOUT VARIATIONS',30,42);
const base={kind:'boss',finalEnemy:true,sprite:2,hp:300,maxHp:300,face:1,x:0,y:0,walk:0};
const poses=[{...base,id:1,finalRole:'sohel',label:'Sohel Rana',weapon:'knife'}, {...base,id:2,finalRole:'companion',label:'Companion 1',variant:1,weapon:'machete',moving:true,walk:1.4}, {...base,id:3,finalRole:'companion',label:'Companion 2',variant:2,weapon:'machete',attackKind:'punch',attackTime:.25,attackDuration:.46}, {...h,id:4,kind:'ally',role:'hercules',x:0,y:0,attackKind:'kick',attackTime:.31,attackDuration:.59}];
for(let i=0;i<poses.length;i++){c.save();c.translate(155+i*300,545);c.scale(3,3);painter.actor(c,poses[i],{player:{x:0,y:0},elapsed:0},2,false);c.restore();c.fillStyle='#eddbbb';c.font='17px sans-serif';c.fillText(['KNIFE · 300 HP','MACHETE · 200 HP','MACHETE STRIKE · 200 HP','HERCULES · KICK'][i],45+i*300,610);}
fs.writeFileSync(path.join(root,'outputs/pushpo-final-character-review.png'),board.toBuffer('image/png'));console.log('Rendered desktop/phone shared Canvas scenes and weapon/combat review. No browser UI emulated.');
