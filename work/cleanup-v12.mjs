import fs from 'node:fs';
const p='outputs/pushpo-demo/dist/art-v3.mjs';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('c.arc(0,0,49,-2.2,-.8)','c.ellipse(0,0,49,49,0,-2.2,-.8)'));
const p2='outputs/pushpo-demo/tests/story-v8.test.mjs';fs.writeFileSync(p2,fs.readFileSync(p2,'utf8').replace('const points=g.points,kills=g.kills,count=g.hercules.kills;','g.kills=Math.max(5,g.kills);g.player.sight=5;const points=g.points,kills=g.kills,count=g.hercules.kills;'));
const p3='work/check-pixi-mutations.mjs';fs.writeFileSync(p3,fs.readFileSync(p3,'utf8').replace(`"a.kind!=='civilian'&&enemyIdentified(a)","(a.kind==='civilian'||enemyIdentified(a))"`,`"a.kind==='boss'||a.kind==='enemy'","a.kind==='civilian'||a.kind==='boss'||a.kind==='enemy'"`));
