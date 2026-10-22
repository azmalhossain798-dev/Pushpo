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
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));const canvas=createCanvas(1280,800),painter=new Painter(canvas);await painter.ready;const g=createRun(10001),stall=FUCHKA_STALLS[0];Object.assign(g.player,stall.approach,{hp:42});eatFuchka(g);
Object.assign(painter.view,{width:1280,height:800,dpr:1,scale:1.15});
for(const [name,time]of [['day',100],['dusk',198],['night',300],['dawn',408]]){g.elapsed=time;painter.camera=project(stall.vendor.x,stall.vendor.y);painter.camera.y-=55;painter.render(g,5,true);fs.writeFileSync(path.join(root,`outputs/pushpo-world-${name}.png`),canvas.toBuffer('image/png'));}
canvas.width=544;canvas.height=884;Object.assign(painter.view,{width:544,height:884,dpr:1,scale:.9});painter.camera=project(stall.vendor.x,stall.vendor.y);painter.camera.y-=55;g.elapsed=300;painter.render(g,5,true);fs.writeFileSync(path.join(root,'outputs/pushpo-world-phone-canvas.png'),canvas.toBuffer('image/png'));
const board=createCanvas(900,450),c=board.getContext('2d');c.fillStyle='#173341';c.fillRect(0,0,900,450);c.fillStyle='#efd6a0';c.font='bold 23px sans-serif';c.fillText('FUCHKA · REUSED CART ART + BAKED FOOD DETAILS',25,35);c.drawImage(painter.fuchkaArt,65,65,290,319);
const items=painter.litter;const colors=['BOTTLE','PAPER','WRAPPER','PACKAGING','NEWSPAPER','CRUSHED CAN'];
for(let i=0;i<6;i++){const item=items.find(p=>p.type===i),small=createCanvas(36,28),sc=small.getContext('2d');sc.translate(17,14);sc.scale(1.6,1.6);sc.fillStyle='#af9c7a';sc.fillRect(-11,-9,22,18);const {drawRoadsideLitter}=await import('../outputs/pushpo-demo/dist/environment-v5.mjs');drawRoadsideLitter(sc,[{...item,x:0,y:0,angle:.1,scale:1}]);c.drawImage(small,420+(i%3)*150,100+Math.floor(i/3)*130,108,84);c.fillStyle='#e8dbc0';c.font='12px sans-serif';c.fillText(colors[i],420+(i%3)*150,205+Math.floor(i/3)*130);}
fs.writeFileSync(path.join(root,'outputs/pushpo-world-detail-review.png'),board.toBuffer('image/png'));console.log(JSON.stringify({litter:items.length,worldObjects:painter.objects.length,stalls:FUCHKA_STALLS.length,files:'day/dusk/night/dawn, phone scene and detail review'}));
