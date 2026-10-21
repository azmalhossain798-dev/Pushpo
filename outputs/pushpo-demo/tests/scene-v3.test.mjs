import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,inside,update,BOSSES} from '../dist/engine-v3.mjs';
import {project,unproject,screenDirection,ACTIVITY_SPOTS,SCENERY} from '../dist/scene-v3.mjs';
test('projection is invertible and controls follow screen directions',()=>{
 for(const [x,y]of[[0,0],[1490,1740],[3400,3600],[-100,500]]){
  const p=project(x,y),v=unproject(p.x,p.y);assert(Math.abs(x-v.x)<1e-9);assert(Math.abs(y-v.y)<1e-9);
 }
 for(const [x,y]of[[1,0],[-1,0],[0,-1],[0,1]]){
  const d=screenDirection(x,y),p=project(d.x,d.y);assert(Math.abs(p.x*y-p.y*x)<1e-9);assert(p.x*x+p.y*y>0);
 }
 assert.deepEqual(screenDirection(0,0),{x:0,y:0});
});
test('activity actors and scenery start in valid positions',()=>{
 const g=createRun(300);
 assert.equal(g.actors.filter(a=>a.activity).length,ACTIVITY_SPOTS.length);
 assert.equal(new Set(g.actors.map(a=>a.id)).size,g.actors.length);
 for(const a of g.actors.filter(a=>a.activity))assert(inside(a.x,a.y),`${a.spotId} must stand on a walkable tile`);
 for(const p of SCENERY)assert(!inside(p.x,p.y),`${p.id} must be solid`);
 assert.deepEqual(BOSSES.map(b=>b.sprite),[0,1,2]);
});
test('vendors stay with stalls, conversation partners talk, and customers step aside',()=>{
 const g=createRun(901);g.actors=g.actors.filter(a=>a.kind==='civilian');
 const sample={speech:false,gesture:false,customerMoved:false};
 for(let i=0;i<900;i++){
  update(g,.02);
  for(const a of g.actors.filter(n=>n.activity)){
   sample.speech||=!!a.speech;sample.gesture||=a.gesture>.3;
   if(a.activity==='customer'&&Math.hypot(a.x-a.homeX,a.y-a.homeY)>10)sample.customerMoved=true;
   if(a.activity!=='customer'){assert.equal(a.x,a.homeX);assert.equal(a.y,a.homeY);}
  }
 }
 assert.deepEqual(sample,{speech:true,gesture:true,customerMoved:true});
 const before=g.actors.filter(a=>a.activity).map(a=>[a.spotId,a.x,a.y]);
 g.player.x=300;g.player.y=680;g.spawnClock=0;update(g,.02);
 for(const[id,x,y]of before){const a=g.actors.find(n=>n.spotId===id);assert(Math.hypot(a.x-x,a.y-y)<2,'activity NPC must not teleport toward player');}
});
test('walking phase advances only with movement and stops at rest',()=>{
 const g=createRun(19);g.actors=[];
 update(g,.05,screenDirection(-1,0));assert(g.player.moving);assert(g.player.walk>0);
 const phase=g.player.walk;update(g,.05);assert(!g.player.moving);assert.equal(g.player.walk,phase);
});
