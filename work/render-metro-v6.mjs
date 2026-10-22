// Static shared-scene art verification; this does not emulate a browser or GPU.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Painter} from '../outputs/pushpo-demo/dist/art-v3.mjs';
import {createRun} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {updateMetro,metroPosition} from '../outputs/pushpo-demo/dist/city-systems.mjs';
import {project,METRO_LINE} from '../outputs/pushpo-demo/dist/scene-v3.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url);
const {createCanvas,Image}=require(path.join(process.argv[2],'@napi-rs/canvas'));
Object.defineProperty(Image.prototype,'naturalWidth',{get(){return this.width;}});Object.defineProperty(Image.prototype,'naturalHeight',{get(){return this.height;}});
globalThis.Image=Image;globalThis.document={createElement(name){if(name!=='canvas')throw Error(name);return createCanvas(1,1);}};
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));
const canvas=createCanvas(1280,800),painter=new Painter(canvas);await painter.ready;
for(const direction of [1,-1]){
 const g=createRun(806);updateMetro(g,g.metro.wait);g.metro.direction=direction;
 const distance=Math.hypot(METRO_LINE.to.x-METRO_LINE.from.x,METRO_LINE.to.y-METRO_LINE.from.y),extra=680/distance,p=(.37+extra)/(1+2*extra);
 updateMetro(g,34*(direction>0?p:1-p)+6);const head=metroPosition(g.metro);
 g.player.x=head.x-100;g.player.y=head.y+100;
 Object.assign(painter.view,{width:1280,height:800,dpr:1,scale:1.1});painter.camera=project(head.x,head.y);painter.camera.y-=100;
 painter.render(g,3,false);fs.writeFileSync(path.join(root,`outputs/pushpo-metro-${direction>0?'south':'north'}.png`),canvas.toBuffer('image/png'));
}
console.log(`Metro reference renders complete; ${painter.cityStats.poles} spaced utility poles.`);
