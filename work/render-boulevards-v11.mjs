// Shared Canvas renderer review. This does not emulate browser HUD or WebGL.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {Painter} from '../outputs/pushpo-demo/dist/art-v3.mjs';
import {createRun,eatFuchka} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {FUCHKA_STALLS,project} from '../outputs/pushpo-demo/dist/scene-v3.mjs';
const root=process.cwd(),require=createRequire(import.meta.url),{createCanvas,Image}=require(path.join(process.argv[2],'@napi-rs/canvas'));
Object.defineProperty(Image.prototype,'naturalWidth',{get(){return this.width;}});Object.defineProperty(Image.prototype,'naturalHeight',{get(){return this.height;}});
globalThis.Image=Image;globalThis.document={createElement(name){if(name!=='canvas')throw Error(name);return createCanvas(1,1);}};
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));const canvas=createCanvas(1280,800),painter=new Painter(canvas);await painter.ready;const g=createRun(4561),stall={vendor:{x:1630,y:1780}};Object.assign(g.player,{x:1490,y:1740,hp:100});
Object.assign(painter.view,{width:1280,height:800,dpr:1,scale:1.15});
for(const [name,time]of [['day',100],['night',300]]){g.elapsed=time;painter.camera=project(stall.vendor.x,stall.vendor.y);painter.camera.y-=55;painter.render(g,5,true);fs.writeFileSync(path.join(root,`outputs/pushpo-boulevards-${name}.png`),canvas.toBuffer('image/png'));}
canvas.width=544;canvas.height=884;Object.assign(painter.view,{width:544,height:884,dpr:1,scale:.9});painter.camera=project(stall.vendor.x,stall.vendor.y);painter.camera.y-=55;g.elapsed=300;painter.render(g,5,true);fs.writeFileSync(path.join(root,'outputs/pushpo-boulevards-phone-canvas.png'),canvas.toBuffer('image/png'));
console.log(JSON.stringify({buildings:painter.blockCount,objects:painter.objects.length,marks:painter.boulevardMarks.length,litter:painter.litter.length}));
