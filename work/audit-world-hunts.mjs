import {createRun,spawnBoss,update} from '../outputs/pushpo-demo/dist/engine-v3.mjs';import {attack,finishStories} from '../outputs/pushpo-demo/tests/combat-helpers.mjs';
const g=createRun(8810);g.spawnClock=999;g.player.invulnerable=999;g.kills=10;
for(let stage=0;stage<2;stage++){g.points=stage?300:150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);Object.assign(g.player,{x:b.x+30,y:b.y,attack:0});b.hp=35;attack(g);finishStories(g);}
g.finalMission.investigationElapsed=-9999;
for(let i=0;i<5000;i++){update(g,.03);if(i%500===0){const h=g.actors.find(a=>a.role==='hercules'),t=g.actors.find(a=>a.id===g.hercules.targetId);console.log(JSON.stringify({time:i*.03,kills:g.hercules.kills,h:{x:h.x,y:h.y,via:h.navVia,detour:h.pedestrianDetour&&{target:h.pedestrianDetour.target,path:h.pedestrianDetour.path,failures:h.pedestrianDetour.failures}},target:t&&{id:t.id,x:t.x,y:t.y,hp:t.hp,flee:t.fleeTime,via:t.navVia}}));}}
