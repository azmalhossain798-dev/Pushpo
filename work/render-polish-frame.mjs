// Static artifact rendering through the game's shared Canvas scene; no browser emulation.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Painter} from '../outputs/pushpo-demo/dist/art-v3.mjs';
import {createRun,update} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {project} from '../outputs/pushpo-demo/dist/scene-v3.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url);
const {createCanvas,Image}=require(path.join(process.argv[2],'@napi-rs/canvas'));
Object.defineProperty(Image.prototype,'naturalWidth',{get(){return this.width;}});Object.defineProperty(Image.prototype,'naturalHeight',{get(){return this.height;}});
globalThis.Image=Image;globalThis.document={createElement(name){if(name!=='canvas')throw Error(name);return createCanvas(1,1);}};
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));
const canvas=createCanvas(1280,800),painter=new Painter(canvas);await painter.ready;
const game=createRun(12349);game.phase='boss';game.actors.forEach(a=>{if(a.kind==='enemy')a.kind='civilian';});
for(let i=0;i<1200;i++)update(game,.03);
Object.assign(painter.view,{width:1280,height:800,dpr:1,scale:1});
painter.camera=project(game.player.x,game.player.y);painter.camera.y-=55;painter.render(game,3,false);
fs.writeFileSync(path.join(root,'outputs/pushpo-polish-canvas.png'),canvas.toBuffer('image/png'));
const board=createCanvas(1600,1000),c=board.getContext('2d');c.fillStyle='#af9778';c.fillRect(0,0,1600,1000);
for(let i=0;i<8;i++){
 const atlas=i<4?'buildings':'city',art=i%4,o=painter.objects.find(o=>o.kind==='building'&&(o.atlas??'buildings')===atlas&&o.art===art&&o.w===150);
 const x=i%4*400+200,y=Math.floor(i/4)*500+410;c.save();c.translate(x-o.p.x,y-o.p.y);
 for(let a=-150;a<=150;a+=50){for(const points of[[project(o.x+a,o.y-150),project(o.x+a,o.y+150)],[project(o.x-150,o.y+a),project(o.x+150,o.y+a)]]){c.beginPath();c.moveTo(points[0].x,points[0].y);c.lineTo(points[1].x,points[1].y);c.strokeStyle='#7d705e';c.lineWidth=.7;c.stroke();}}
 painter.drawObject(c,o,{x:100000,y:100000},0);c.restore();c.font='16px sans-serif';c.fillStyle='#162f36';c.fillText(atlas+' '+art,x-50,y+75);
}
fs.writeFileSync(path.join(root,'outputs/pushpo-building-alignment.png'),board.toBuffer('image/png'));
canvas.width=544;canvas.height=884;Object.assign(painter.view,{width:544,height:884,dpr:1,scale:.78});painter.camera=project(game.player.x,game.player.y);painter.camera.y-=55;painter.render(game,3,false);
fs.writeFileSync(path.join(root,'outputs/pushpo-polish-phone-canvas.png'),canvas.toBuffer('image/png'));
console.log(`Rendered shared Canvas scene: ${painter.blockCount} buildings, ${painter.litter.length} litter pieces, ${game.traffic.length} rickshaws.`);
