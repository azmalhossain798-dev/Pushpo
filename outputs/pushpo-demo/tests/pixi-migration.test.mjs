import test from 'node:test';
import assert from 'node:assert/strict';
import {multiplyAffine,rendererSize} from '../dist/pixi-draw.mjs';
import {project,unproject,screenDirection,SCENERY} from '../dist/scene-v3.mjs';
import {createRun,update,inside,attack,clearPath,RULES} from '../dist/engine-v3.mjs';
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Pixi transforms keep the ground, camera and inverse pointer on the same gameplay plane',()=>{
 for(const width of [390,844,1280,1920])for(const ratio of [1,1.25,2,3]){
  const size=rendererSize(width,720,ratio),m=[1,0,0,1,0,0],camera={x:-310,y:990};
  multiplyAffine(m,size.scale,0,0,size.scale,0,0);multiplyAffine(m,1,0,0,1,-camera.x,-camera.y);
  multiplyAffine(m,.72,.36,-.72,.36,0,0);
  for(const [x,y]of[[1490,1740],[1535,1000],[2710,1880]]){
   const sx=m[0]*x+m[2]*y+m[4],sy=m[1]*x+m[3]*y+m[5],expected=project(x,y);
   near(sx,(expected.x-camera.x)*size.scale);near(sy,(expected.y-camera.y)*size.scale);
   const world=unproject(sx/size.scale+camera.x,sy/size.scale+camera.y);near(world.x,x);near(world.y,y);
  }
 }
});
test('sprite rotation and facing flips keep cutout pivots fixed',()=>{
 const m=[1,0,0,1,0,0],angle=.37;
 multiplyAffine(m,1,0,0,1,240,360);multiplyAffine(m,-1,0,0,1,0,0);
 multiplyAffine(m,Math.cos(angle),Math.sin(angle),-Math.sin(angle),Math.cos(angle),0,0);
 near(m[4],240);near(m[5],360);near(m[0]*m[3]-m[1]*m[2],-1);
 near(Math.hypot(m[0],m[1]),1);
});
test('resizing preserves CSS scale and caps DPR without zero-sized GPU buffers',()=>{
 assert.deepEqual(rendererSize(0,0,3),{width:1,height:1,dpr:2,scale:.78});
 near(rendererSize(1150,720,1.5).scale,1);assert.equal(rendererSize(2000,1000,2).scale,1.2);
});
test('attacks cannot pass through a solid street prop even inside melee range',()=>{
 const stall=SCENERY.find(p=>p.id==='tea'),g=createRun(3);
 g.player.x=stall.x;g.player.y=stall.y+40;
 const enemy={id:90,kind:'enemy',type:0,known:true,x:stall.x,y:stall.y-40,hp:100,maxHp:100};
 assert(inside(g.player.x,g.player.y));assert(inside(enemy.x,enemy.y));
 assert(Math.hypot(enemy.x-g.player.x,enemy.y-g.player.y)<RULES.attackRange);assert(!clearPath(enemy,g.player));
 g.actors=[enemy];attack(g);assert.equal(enemy.hp,100);
});
test('movement is screen-relative and the original long-frame clock rule is retained',()=>{
 const g=createRun(4);g.actors=[];const start=project(g.player.x,g.player.y);
 update(g,.05,screenDirection(-1,0));const finish=project(g.player.x,g.player.y);
 assert(finish.x<start.x);near(finish.y,start.y);
 const before=g.remaining,position={x:g.player.x,y:g.player.y};update(g,2,screenDirection(-1,0));
 near(g.remaining,before-2);assert(Math.hypot(g.player.x-position.x,g.player.y-position.y)<=RULES.moveSpeed*.06+1e-6);
});
