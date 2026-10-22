import {createRun,spawnBoss,continueStory,update} from '../outputs/pushpo-demo/dist/engine-v3.mjs';
import {attack} from '../outputs/pushpo-demo/tests/combat-helpers.mjs';
const g=createRun(1801);g.actors=[];g.traffic=[];g.spawnClock=999;
for(let stage=0;stage<2;stage++){g.points=stage?300:150;spawnBoss(g);const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);Object.assign(g.player,{x:b.x+30,y:b.y,attack:0});b.hp=35;attack(g);while(g.story)continueStory(g);}
let frames=0;while(!g.story&&frames++<1400)update(g,.03);console.log('approach',frames,JSON.stringify(g.cinematic),g.actors.find(a=>a.role==='hercules'));
const ids=[];while(g.story){ids.push(g.story.beats[g.story.index].id);continueStory(g);}console.log('dialogue',ids.length,g.hercules.introComplete,g.finalMission);
g.player.invulnerable=999;g.spawnClock=999;let sample=0;for(let i=0;i<8000;i++){update(g,.03);if(i%1000===0)console.log('hunt',i,g.hercules.kills,g.hercules.mode,g.actors.filter(a=>a.owner).map(a=>({id:a.id,x:a.x,y:a.y,hp:a.hp,flee:a.fleeTime})));}console.log('end',g.status,g.points,g.kills,g.hercules.kills,g.hercules.notes);
