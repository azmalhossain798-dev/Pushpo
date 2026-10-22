// Static scene and rig review through the shared Canvas renderer; HTML subtitles are not emulated.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Painter} from '../outputs/pushpo-demo/dist/art-v3.mjs';
import {createRun,spawnBoss,continueStory,update} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {attack,finishStories} from '../outputs/pushpo-demo/tests/combat-helpers.mjs';
import {project} from '../outputs/pushpo-demo/dist/scene-v3.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url);
const {createCanvas,Image}=require(path.join(process.argv[2],'@napi-rs/canvas'));
Object.defineProperty(Image.prototype,'naturalWidth',{get(){return this.width;}});Object.defineProperty(Image.prototype,'naturalHeight',{get(){return this.height;}});
globalThis.Image=Image;globalThis.document={createElement(name){if(name!=='canvas')throw Error(name);return createCanvas(1,1);}};
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));const canvas=createCanvas(1280,800),painter=new Painter(canvas);await painter.ready;
const g=createRun(8811);g.kills=10;g.player.invulnerable=999;g.spawnClock=999;
for(let stage=0;stage<2;stage++){g.points=stage?300:150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);Object.assign(g.player,{x:b.x+30,y:b.y,attack:0});b.hp=35;attack(g);if(stage===0)finishStories(g);}
continueStory(g);for(let i=0;i<1000&&!g.story;i++)update(g,.03);
Object.assign(painter.view,{width:1280,height:800,dpr:1,scale:1.12});painter.camera=project(g.cinematic.focus.x,g.cinematic.focus.y);painter.camera.y-=55;painter.render(g,8,true);
fs.writeFileSync(path.join(root,'outputs/pushpo-hercules-scene.png'),canvas.toBuffer('image/png'));
canvas.width=544;canvas.height=884;Object.assign(painter.view,{width:544,height:884,dpr:1,scale:.9});painter.render(g,8,true);fs.writeFileSync(path.join(root,'outputs/pushpo-hercules-phone-canvas.png'),canvas.toBuffer('image/png'));
const board=createCanvas(1120,650),c=board.getContext('2d');c.fillStyle='#172d3c';c.fillRect(0,0,1120,650);c.fillStyle='#ecd5ff';c.font='bold 25px sans-serif';c.fillText('HERCULES · REFERENCE-BASED GAME SPRITE',35,45);
for(let i=0;i<3;i++){c.save();c.translate(235+i*330,545);c.scale(3,3);const a={id:900+i,role:'hercules',kind:'ally',x:0,y:0,hp:100,maxHp:100,face:1,walk:i===2?1.4:0,moving:i===2,velocityX:i===1?-1:1,velocityY:0};painter.actor(c,a,{player:{x:0,y:0}},1.2,false);c.restore();c.fillStyle='#dcc0fa';c.font='18px sans-serif';c.fillText(['FRONT','REAR','WALKING'][i],180+i*330,600);}
fs.writeFileSync(path.join(root,'outputs/pushpo-hercules-sprite-review.png'),board.toBuffer('image/png'));console.log('Rendered Hercules scene, phone scene and front/rear/walk review.');
