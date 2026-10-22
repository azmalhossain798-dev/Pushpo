import {COMBAT_ACTIONS} from './combat-v7.mjs';
import {HERCULES_NOTE,beginHerculesConversation} from './story-v8.mjs';
import {updateFinalHercules} from './final-v9.mjs';
const hercDistance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function initHercules(g){
 g.hercules={introStarted:false,conversationStarted:false,introComplete:false,actorId:null,mode:'unseen',targetId:null,kills:0,notes:[],caseClock:0,caseNumber:0};
 g.finalMission={enabled:false,state:'unknown',lead:null,investigationElapsed:0,spawned:false,arrived:false,endingStarted:false,endingFinished:false};g.cinematic=null;
}
export function herculesEntrance(g,api){
 const p=g.player,nearest=api.nearest(p),corners=Object.keys(api.nodes).filter(id=>api.links[id].length>1&&api.inside(...api.nodes[id])).sort((a,b)=>Math.hypot(api.nodes[a][0]-p.x,api.nodes[a][1]-p.y)-Math.hypot(api.nodes[b][0]-p.x,api.nodes[b][1]-p.y));
 for(const id of corners){const [x,y]=api.nodes[id],corner={x,y};if(hercDistance(corner,p)<110||hercDistance(corner,p)>850)continue;
  const outgoing=api.route(id,nearest)[1]??nearest,[ox,oy]=api.nodes[outgoing],od=Math.hypot(ox-x,oy-y)||1;
  for(const incoming of api.links[id]){const [ix,iy]=api.nodes[incoming],length=Math.hypot(ix-x,iy-y);if(incoming===outgoing||Math.abs((ix-x)*(oy-y)-(iy-y)*(ox-x))/(length*od)<.45)continue;
   for(const setback of [145,190,95,230]){const start={x:x+(ix-x)/length*setback,y:y+(iy-y)/length*setback};if(!api.free(start,30))continue;
    for(let i=0;i<16;i++){const angle=Math.atan2(y-p.y,x-p.x)+i*Math.PI/8,meet={x:p.x+Math.cos(angle)*88,y:p.y+Math.sin(angle)*88};if(api.free(meet,30))return {start,route:[corner,meet],corner:id};}
   }
  }
 }return null;
}
export function beginHerculesIntro(g,api){
 const s=g.hercules;if(s.introStarted||g.chapter!==2||g.story)return false;const entrance=herculesEntrance(g,api);if(!entrance)return false;
 const h={id:g.nextId++,kind:'ally',role:'hercules',label:'Hercules',...entrance.start,hp:100,maxHp:100,face:1,walk:0,moving:false,speed:126,attack:0,attackTime:0,windup:0,cooldown:0,flash:0};
 g.effects=g.effects.filter(e=>e.type==='pocket-note');g.player.attack=0;g.player.attackTime=0;g.player.pendingHit=null;
 g.actors.push(h);s.actorId=h.id;s.introStarted=true;s.mode='approach';g.finalMission.state='introduction';
 g.cinematic={kind:'hercules',phase:'approach',route:entrance.route,index:0,elapsed:0,watch:{x:h.x,y:h.y,time:0},corner:entrance.corner,focus:{x:h.x,y:h.y}};return true;
}
export function finishHerculesIntro(g){
 if(g.story||!g.hercules.conversationStarted||g.hercules.introComplete)return false;
 g.hercules.introComplete=true;g.hercules.mode='departing';g.hercules.caseClock=4;g.cinematic=null;
 g.finalMission.state='investigating';g.finalMission.lead='Sohel Rana';g.finalMission.identity='Anu';g.finalMission.enabled=false;
 return true;
}
export function recordHerculesKill(g,target){
 const s=g.hercules;if(!s.introComplete||!target.dead||target.owner!=='hercules'||target.pocketNote||s.notes.some(n=>n.targetId===target.id))return false;
 target.pocketNote=HERCULES_NOTE;s.kills++;s.notes.push({id:s.kills,targetId:target.id,text:HERCULES_NOTE,x:target.x,y:target.y,location:'victim pocket'});s.notes=s.notes.slice(-20);s.targetId=null;s.caseClock=5;s.mode='patrol';return true;
}
export function updateHercules(g,dt,api){
 const s=g.hercules,h=g.actors.find(a=>a.id===s.actorId);if(!h)return;
 h.moving=false;h.attack=Math.max(0,(h.attack??0)-dt);h.attackTime=Math.max(0,(h.attackTime??0)-dt);
 if(g.cinematic?.phase==='approach'){
  const c=g.cinematic;c.elapsed+=dt;c.watch.time+=dt;const goal=c.route[c.index];
  api.navigate(h,goal,h.speed,dt);if(hercDistance(h,goal)<22){c.index++;h.navVia=null;h.pedestrianDetour=null;}
  if(hercDistance(h,c.watch)>12)c.watch={x:h.x,y:h.y,time:0};
  if(c.watch.time>2){h.navVia=null;h.pedestrianDetour=null;c.watch={x:h.x,y:h.y,time:0};}
  c.focus=hercDistance(h,g.player)>210?{x:h.x,y:h.y}:{x:(h.x+g.player.x)/2,y:(h.y+g.player.y)/2};
  if(c.index>=c.route.length||(c.elapsed>12&&hercDistance(h,g.player)<160)){h.moving=false;c.phase='dialogue';s.mode='conversation';beginHerculesConversation(g);}
  return;
 }
 if(!s.introComplete)return;if(updateFinalHercules(g,h,dt,api))return;s.caseClock=Math.max(0,s.caseClock-dt);
 if(h.pendingHit){h.pendingHit.time-=dt;if(h.pendingHit.time<=0){const hit=h.pendingHit;h.pendingHit=null;api.resolve(h,hit);}}
 let target=g.actors.find(a=>a.id===s.targetId&&!a.dead&&a.owner==='hercules');
 if(!target&&s.caseClock<=0){
  const cases=g.actors.filter(a=>a.owner==='hercules'&&!a.dead);target=cases.sort((a,b)=>hercDistance(a,h)-hercDistance(b,h))[0]??api.spawnCase(h);
  if(target){s.targetId=target.id;s.mode='hunt';}
 }
 if(target){
  if(hercDistance(h,target)<=COMBAT_ACTIONS.punch.range&&api.clear(h,target)){if(h.attack<=0)api.strike(h,target);}
  else api.navigate(h,target,h.speed,dt);return;
 }
 // A fixed district patrol is independent of Pushpo's position.
 const patrol=['f0','g0','g1','f1'],node=patrol[s.patrolIndex??0],point={x:api.nodes[node][0],y:api.nodes[node][1]};
 if(hercDistance(h,point)<45)s.patrolIndex=((s.patrolIndex??0)+1)%patrol.length;
 else api.navigate(h,point,h.speed,dt);
}
