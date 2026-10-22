import fs from 'node:fs';
let p='outputs/pushpo-demo/tests/integration-v12.test.mjs',s=fs.readFileSync(p,'utf8');s=s.replace(" const c=recorder(),p={images:{},cells:{}};Painter.prototype.buildFuchkaArt.call(p); // document supplied below in separate renderer validation.\n",'').replace('tick(g,6.49)','tick(g,6.47)');fs.writeFileSync(p,s);
p='outputs/pushpo-demo/dist/game-v3.mjs';s=fs.readFileSync(p,'utf8').replace("$('hud').classList.toggle('hidden',active)","$('hud').classList.toggle('cinematic-hud',active)");fs.writeFileSync(p,s);
