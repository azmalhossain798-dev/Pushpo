import {createRun,spawnBoss,update,inside} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {attack,finishStories} from '../outputs/pushpo-demo/tests/combat-helpers.mjs';
for(const seed of [9910,9911,9912]){
 const g=createRun(seed);g.spawnClock=9999;g.player.invulnerable=9999;g.kills=10;
 for(let stage=0;stage<2;stage++){g.points=stage?300:150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);Object.assign(g.player,{x:b.x+30,y:b.y,attack:0});b.hp=35;attack(g);finishStories(g);}
 g.hercules.kills=1;g.finalMission.investigationElapsed=30;let i=0;
 for(;i<6000&&!g.finalMission.spawned&&g.status==='playing';i++)update(g,.03);
 const h=g.actors.find(a=>a.role==='hercules');console.log('spawn',seed,i,h.x,h.y,g.finalMission.state);
 for(i=0;i<2001&&g.status==='playing';i++){update(g,.03);if(i%300===0||g.status!=='playing')console.log(seed,i/33.333,h.hp,h.guardTime,h.defenses,h.freezeCooldown,g.finalMission.remaining,g.status,g.reason,g.actors.filter(a=>a.finalEnemy).map(a=>({hp:a.hp,x:a.x,y:a.y,w:a.windup})));}
}
