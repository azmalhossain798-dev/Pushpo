// Shared Canvas scene/rig render, not a browser or GPU test.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Painter} from '../outputs/pushpo-demo/dist/art-v3.mjs';
import {createRun} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {COMBAT_ACTIONS} from '../outputs/pushpo-demo/dist/combat-v7.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),require=createRequire(import.meta.url);
const {createCanvas,Image}=require(path.join(process.argv[2],'@napi-rs/canvas'));
Object.defineProperty(Image.prototype,'naturalWidth',{get(){return this.width;}});Object.defineProperty(Image.prototype,'naturalHeight',{get(){return this.height;}});
globalThis.Image=Image;globalThis.document={createElement(name){if(name!=='canvas')throw Error(name);return createCanvas(1,1);}};
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));const canvas=createCanvas(1400,1000),painter=new Painter(canvas);await painter.ready;
const c=canvas.getContext('2d');c.fillStyle='#173844';c.fillRect(0,0,1400,1000);c.fillStyle='#ffdf99';c.font='bold 25px sans-serif';c.fillText('PUSHPO · CONTACT-FRAME COMBAT',36,40);
const labels=['WINDUP','CONTACT','FOLLOW THROUGH','RECOVERY'];for(let i=0;i<4;i++){c.font='15px sans-serif';c.fillText(labels[i],250+i*290,82);}
for(const [row,kind]of ['slap','punch','kick'].entries()){
 const spec=COMBAT_ACTIONS[kind];c.font='bold 19px sans-serif';c.fillStyle='#ffdf99';c.fillText(kind.toUpperCase(),30,180+row*220);
 const samples=[spec.contact*.45,spec.contact,spec.contact+(spec.duration-spec.contact)*.25,spec.duration-.01];
 for(const [i,time]of samples.entries()){
  c.save();c.translate(280+i*290,253+row*220);c.scale(1.6,1.6);
  const a={...createRun(970).player,sprite:0,id:0,attackKind:kind,attackTime:spec.duration-time,attackDuration:spec.duration,face:1,moving:false};
  painter.rig(c,a,0,0,96,0);if(i===1){c.strokeStyle='#f2d783';c.lineWidth=1;c.beginPath();c.ellipse(40,-65,15,15,0,0,Math.PI*2);c.stroke();}c.restore();
 }
}
c.save();c.translate(390,945);c.scale(1.65,1.65);const g=createRun(971);Object.assign(g.player,{mirrorTime:1,x:0,y:0});painter.actor(c,g.player,g,1,true);c.restore();c.font='bold 20px sans-serif';c.fillStyle='#ffdf99';c.fillText('WATER MIRROR',550,850);c.font='17px sans-serif';c.fillText('Overlapping translucent golden fish scales',550,885);c.fillText('Reactive protection · 10-second shared cooldown',550,916);
fs.writeFileSync(path.join(root,'outputs/pushpo-combat-v7.png'),canvas.toBuffer('image/png'));console.log('Rendered combat poses and golden-scale shield.');
