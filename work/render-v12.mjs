// Static shared-renderer review; does not verify browser UI, WebGL or touch input.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {Painter} from '../outputs/pushpo-demo/dist/art-v3.mjs';
import {createRun,update} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {FUCHKA_STALLS,project} from '../outputs/pushpo-demo/dist/scene-v3.mjs';
const root=process.cwd(),require=createRequire(import.meta.url),{createCanvas,Image,GlobalFonts}=require(path.join(process.argv[2],'@napi-rs/canvas'));
GlobalFonts.registerFromPath('C:/Windows/Fonts/Nirmala.ttf','Nirmala UI');
Object.defineProperty(Image.prototype,'naturalWidth',{get(){return this.width;}});Object.defineProperty(Image.prototype,'naturalHeight',{get(){return this.height;}});
globalThis.Image=Image;globalThis.document={createElement:()=>createCanvas(1,1)};
process.chdir(path.join(root,'outputs/pushpo-demo/dist'));const canvas=createCanvas(1280,800),painter=new Painter(canvas);await painter.ready;
const save=(name,cv=canvas)=>fs.writeFileSync(path.join(root,'outputs',name),cv.toBuffer('image/png'));
const g=createRun(4561);g.actors=g.actors.filter(a=>a.kind==='civilian');g.phase='boss';g.spawnClock=999;for(let i=0;i<100;i++)update(g,.03);
Object.assign(painter.view,{width:1280,height:800,dpr:1,scale:1.1});
for(const [i,s]of FUCHKA_STALLS.entries()){Object.assign(g.player,s.approach);painter.camera=project(s.x,s.y);painter.camera.y-=55;painter.render(g,5,true);save(`pushpo-v12-stall-${i+1}.png`);}
const chars=createCanvas(1200,560),c=chars.getContext('2d');c.fillStyle='#233b41';c.fillRect(0,0,1200,560);c.fillStyle='#ffdfaa';c.font='18px sans-serif';c.fillText('Rana / Companion 1 / Companion 2 · movement, wind-up, contact and recovery',30,30);
for(let row=0;row<2;row++)for(let i=0;i<5;i++){
 const kind=i<2?'idle':i===2?'windup':i===3?'contact':'recovery',a={id:12,kind:'boss',finalEnemy:true,finalRole:row?'companion':'sohel',variant:row?2:0,sprite:2,weapon:row?'machete':'knife',face:1,walk:2,moving:i===1,velocityX:i===1?-1:1,velocityY:0,windup:kind==='windup'?.2:0,windupMax:.95,attackKind:row?'machete':'punch',attackDuration:row?.78:.46,attackTime:kind==='contact'?(row?.46:.29):kind==='recovery'?.15:0};
 // Companion 1 is a separate column in the third row of the detailed sheet below.
 painter.rig(c,a,100+i*235,260+row*260,175,5,true);c.fillStyle='#fff0ca';c.font='13px sans-serif';c.fillText(`${row?'Companion 2':'Rana'} · ${kind}`,25+i*235,280+row*260);
}save('pushpo-v12-combat-review.png',chars);
const sheet=createCanvas(1200,420),sc=sheet.getContext('2d');sc.fillStyle='#233b41';sc.fillRect(0,0,1200,420);
for(let i=0;i<3;i++)for(let back=0;back<2;back++){const a={id:10+i,kind:'boss',finalEnemy:true,finalRole:i?'companion':'sohel',variant:i,sprite:2,weapon:i?'machete':'knife',face:1,walk:1,moving:true,velocityX:back?-1:1,velocityY:0};painter.rig(sc,a,110+i*390+back*175,340,230,2,true);sc.font='16px sans-serif';sc.fillStyle='#ffe8b4';sc.fillText(i?`Companion ${i}`:'Sohel Rana',35+i*390,35);}save('pushpo-v12-character-review.png',sheet);
const buildings=createCanvas(1200,520),bc=buildings.getContext('2d');bc.fillStyle='#475650';bc.fillRect(0,0,1200,520);
for(let i=0;i<4;i++){const o=painter.objects.find(o=>o.kind==='building'&&o.atlas==='city'&&o.art===i&&o.w===150);bc.save();bc.translate(150+i*300,440);const l=o.texture.layout;bc.drawImage(o.texture.canvas,l.x,l.y);bc.strokeStyle='#71eadf';bc.beginPath();for(let j=0;j<l.ground.length;j++){const p=l.ground[j];j?bc.lineTo(p.x,p.y):bc.moveTo(p.x,p.y);}bc.stroke();bc.restore();}save('pushpo-v12-building-review.png',buildings);
Object.assign(g.player,FUCHKA_STALLS[0].approach,{mirrorTime:2.4,mirrorCooldown:9.4});painter.camera=project(g.player.x,g.player.y);painter.camera.y-=55;painter.render(g,5,true);save('pushpo-v12-bubble.png');
canvas.width=544;canvas.height=884;Object.assign(painter.view,{width:544,height:884,dpr:1,scale:.9});painter.render(g,5,true);save('pushpo-v12-phone-canvas.png');
console.log(JSON.stringify({buildings:painter.blockCount,stalls:painter.objects.filter(o=>o.fuchka).length,sellers:g.actors.filter(a=>a.activity==='fuchka').length,companions:painter.cells.companions.map(c=>({w:c.w,h:c.h})),city:painter.cells.city.map(c=>({w:c.w,h:c.h}))}));
