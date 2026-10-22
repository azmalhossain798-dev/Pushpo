import {attack as startAttack,update,nearestNode,continueStory} from '../dist/engine-v3.mjs';
// Older regression fixtures assert the result of a completed strike, not its windup.
export function attack(g,mode='combo'){
 for(const a of g.actors){a.speed??=40;a.wait??=1;a.node??=nearestNode(a);a.cooldown??=999;a.windup??=0;a.flash??=0;}
 const accepted=startAttack(g,mode);if(accepted)for(let i=0;i<65&&g.player.pendingHit;i++)update(g,.01);return accepted;
}
export function finishStories(g){
 for(let i=0;i<1600&&(g.story||g.cinematic);i++){if(g.story)continueStory(g);else update(g,.03);}
 if(g.story||g.cinematic)throw Error('Story approach did not finish');
}
export function finishFinalEncounter(g){
 finishStories(g);g.finalMission.investigationElapsed=90;
 const invulnerable=g.player.invulnerable;g.player.invulnerable=999;
 for(let i=0;i<6000&&!g.finalMission.spawned;i++)update(g,.03);
 if(!g.finalMission.spawned)throw Error('Final ambush did not begin');
 Object.assign(g.player,{x:3730,y:2195});update(g,.03);
 const h=g.actors.find(a=>a.role==='hercules');h.attack=999;h.pendingHit=null;
 for(const a of g.actors.filter(a=>a.finalEnemy)){Object.assign(g.player,{x:a.x-20,y:a.y,attack:0});a.hp=35;a.windup=0;a.cooldown=999;attack(g);}
 finishStories(g);g.player.invulnerable=invulnerable;
}
