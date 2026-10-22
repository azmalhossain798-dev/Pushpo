import {COMBAT_ACTIONS} from './combat-v7.mjs';
export const FINAL_RULES=Object.freeze({roundabout:{x:3870,y:2110,name:'East Junction roundabout'},rescueSeconds:60,arrivalRadius:245,investigationSeconds:30,investigationFallback:90,freezeSeconds:3,freezeCooldown:12,freezeRange:220,herculesHealth:360});
export const FINAL_DIALOGUE=Object.freeze([
 {speaker:'Hercules',text:'পুষ্পো, আমরা পেরেছি। সোহেল রানা আর তার সঙ্গীরা আর কাউকে আঘাত করতে পারবে না। তোমার সাহস আর জেদের প্রতি আমার শ্রদ্ধা রইল। এই জয় আমাদের দুজনের।'},
 {speaker:'Pushpo',text:'আমরা পেরেছি… অথচ আমার পথটা প্রায় শেষ। সেই অজানা সোনালি মাছ নিজের জীবনীশক্তির একটা অংশ দিয়ে আমাকে ফিরিয়ে এনেছিল। বলেছিল, এই ধার করা জীবন মাত্র ষাট দিনের। এখন আমার হাতে আর মাত্র কয়েকটা দিন আছে।'},
 {speaker:'Hercules',text:'কয়েকটা দিন? এত কষ্ট একা বয়ে নিয়েছ, তবু কাউকে বুঝতে দাওনি! তোমার জন্য কি কিছুই করতে পারব না?'},
 {speaker:'Pushpo',text:'অনেক রাত ভয় নিয়ে কাটিয়েছি। নিজের মুখ, নিজের নাম, সব বদলে গেলেও ভেতরের ক্ষতগুলো বদলায়নি। কখনো মনে হয়েছে, আর একটা পা-ও ফেলতে পারব না। তবু রাস্তায় কোনো নিরীহ মানুষের চোখে স্বস্তি দেখলে আবার হাঁটার শক্তি পেয়েছি।'},
 {speaker:'Pushpo',text:'আমার জন্য একটা কাজ করবেন? আমি চলে গেলেও থামবেন না। যারা মানুষের জীবন নষ্ট করে, তাদের খুঁজে বের করবেন। নিরীহ মানুষগুলোর পাশে থাকবেন, যেন আর কাউকে আমার মতো একা লড়তে না হয়। অন্ধকারের মধ্যে এই যে একটু আলোর রেখা জ্বলেছে, সেটা বাঁচিয়ে রাখবেন।'},
 {speaker:'Hercules',text:'কথা দিলাম, পুষ্পো। মানুষের পাশে থাকব, অপরাধীদের খুঁজে যাব। তোমার সাহসের কথা ভুলব না। যে আলো তুমি রেখে যাচ্ছ, তাকে নিভতে দেব না।'},
 {speaker:'Pushpo',text:'তাহলেই আমার ফিরে আসাটা বৃথা হয়নি। আজ প্রথম মনে হচ্ছে, বুকের ভেতরটা একটু হালকা। ভালো থাকবেন, হারকিউলিস।'},
 {speaker:'Hercules',text:'বিদায়, পুষ্পো। এবার নিজের জন্য বাকি দিনগুলো বাঁচো। তোমার কষ্টের পথটা পেরিয়ে একটু শান্তি খুঁজে নাও। শহরের এই আলোয় তোমাকে মনে রাখব।'}
]);
const finalDistance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function finalGroup(g){return g.actors.filter(a=>a.finalEnemy);}
export function finalActive(g){return ['rescue','combat'].includes(g.finalMission?.state);}
export function finalMessage(g,text,time=8){g.message=text;g.messageTime=time;}
export function startFinalEncounter(g,api){
 const m=g.finalMission,h=g.actors.find(a=>a.id===g.hercules.actorId&&!a.dead),r=FINAL_RULES.roundabout;
 if(!g.hercules.introComplete||m.state!=='travelling'||m.spawned||g.story||g.cinematic||!h||finalDistance(h,r)>180)return false;
 // All feet land on the southern road annulus, never on the solid island.
 const positions=[{x:r.x+92,y:r.y+64},{x:r.x+38,y:r.y+112},{x:r.x+132,y:r.y+4}];
 const slots=positions.map((p,i)=>{for(const offset of [0,14,-14,28,-28]){const q={x:p.x,y:p.y+offset};if(api.inside(q.x,q.y)&&api.trafficFree(q,22)&&g.actors.every(a=>a.dead||a.insideHouse||finalDistance(a,q)>28))return q;}return null;});
 if(slots.some(p=>!p))return false;
 const health=api.murdererHealth;
 const enemies=slots.map((p,i)=>({id:g.nextId++,...p,kind:'boss',finalEnemy:true,finalRole:i?'companion':'sohel',label:i?`Rana’s companion ${i}`:'Sohel Rana',sprite:2,variant:i,hp:health*(i?2:3),maxHp:health*(i?2:3),weapon:i?'machete':'knife',known:true,face:-1,walk:0,speed:i?104:112,damage:i?12:15,range:i?91:73,windup:0,cooldown:1.3+i*.45,attackTime:0,flash:0,dead:false}));
 g.actors.push(...enemies);Object.assign(h,{hp:FINAL_RULES.herculesHealth,maxHp:FINAL_RULES.herculesHealth,attack:0,attackTime:0,pendingHit:null,guardTime:0,guardCooldown:0,invulnerable:0,freezeCooldown:0});
 Object.assign(m,{enabled:true,state:'rescue',spawned:true,enemyIds:enemies.map(a=>a.id),remaining:FINAL_RULES.rescueSeconds,startedAt:g.elapsed,arrived:false});
 g.phase='final';g.hercules.targetId=null;g.hercules.mode='defend';g.events.push('boss');g.unlockNotice={text:'HERCULES NEEDS HELP · reach EAST JUNCTION ROUNDABOUT within 60 seconds · follow the violet marker',time:10};
 finalMessage(g,'হারকিউলিস বিপদে! পূর্ব মোড়ের গোলচত্বরে পৌঁছাও — সময় মাত্র ৬০ সেকেন্ড!',10);return true;
}
export function failFinalMission(g,reason){
 if(!finalActive(g))return false;const h=g.actors.find(a=>a.role==='hercules');if(h){h.hp=0;h.dead=true;h.pendingHit=null;}
 g.finalMission.state='failed';g.status='lost';g.reason=reason;g.events.push('lose');return true;
}
export function updateFinalMission(g,elapsed,api){
 const m=g.finalMission;if(!g.hercules.introComplete||g.story||g.cinematic||g.status!=='playing')return;
 if(m.state==='investigating'){
  m.investigationElapsed=(m.investigationElapsed??0)+elapsed;
  if(m.investigationElapsed>=FINAL_RULES.investigationSeconds&&g.hercules.kills>0||m.investigationElapsed>=FINAL_RULES.investigationFallback){m.state='travelling';g.hercules.targetId=null;const h=g.actors.find(a=>a.role==='hercules');if(h){h.pendingHit=null;h.navVia=null;h.pedestrianDetour=null;}finalMessage(g,'Hercules has traced Sohel Rana to East Junction. He is following the lead.');}
 }
 if(m.state==='rescue'){
  const r=FINAL_RULES.roundabout,d=finalDistance(g.player,r);
  if(elapsed>m.remaining+1e-8){m.remaining=0;failFinalMission(g,'You did not reach East Junction within 60 seconds. Hercules has fallen.');return;}
  // Arrival is latched before expiry at the boundary; time is never restarted.
  if(d<=FINAL_RULES.arrivalRadius&&api.inside(g.player.x,g.player.y)){
   m.arrived=true;m.state='combat';m.arrivedAt=g.elapsed;g.events.push('chapter');finalMessage(g,'সময়মতো পৌঁছেছ! হারকিউলিসের পাশে লড়ো — তিনজনকেই পরাজিত করতে হবে।');
  }else{m.remaining=Math.max(0,m.remaining-elapsed);if(m.remaining<=1e-8)failFinalMission(g,'You did not reach East Junction within 60 seconds. Hercules has fallen.');}
 }
 if(m.state==='combat'&&m.enemyIds?.length===3&&m.enemyIds.every(id=>g.actors.some(a=>a.id===id&&a.dead)))beginFinalFarewell(g);
}
export function beginFinalFarewell(g){
 const m=g.finalMission;if(m.state!=='combat'||m.endingStarted||!m.arrived||g.story)return false;
 m.endingStarted=true;m.state='farewell';g.phase='ending';if(!g.defeated.includes('Sohel Rana'))g.defeated.push('Sohel Rana');g.chapter=3;
 const h=g.actors.find(a=>a.role==='hercules');g.player.pendingHit=null;g.player.attackTime=0;if(h){h.pendingHit=null;h.attackTime=0;h.guardTime=0;h.moving=false;}
 g.effects=[];g.cinematic={kind:'farewell',phase:'dialogue',focus:h?{x:(h.x+g.player.x)/2,y:(h.y+g.player.y)/2}:{...g.player}};
 g.story={beats:FINAL_DIALOGUE.map((turn,i)=>({id:`farewell-${i}`,kind:'conversation',sequence:'farewell',speaker:turn.speaker,title:turn.speaker==='Hercules'?'হারকিউলিস':'পুষ্পো',text:turn.text})),index:0};g.events.push('chapter');return true;
}
export function finishFinalFarewell(g){
 const m=g.finalMission;if(g.story||m.state!=='farewell'||m.endingFinished)return false;
 m.endingFinished=true;m.state='complete';g.cinematic=null;g.status='won';g.events.push('win');g.reason='বিদায়ের পরেও আলোর রেখা বেঁচে থাকে।';return true;
}
export function castHerculesFreeze(g,h){
 if(!finalActive(g)||h.dead||h.freezeCooldown>0)return false;
 const targets=finalGroup(g).filter(a=>!a.dead&&finalDistance(a,h)<=FINAL_RULES.freezeRange);if(!targets.length)return false;
 h.freezeCooldown=FINAL_RULES.freezeCooldown;h.freezeTime=FINAL_RULES.freezeSeconds;
 for(const a of targets){a.frozenUntil=g.elapsed+FINAL_RULES.freezeSeconds;a.moving=false;}
 g.effects.push({type:'freeze',x:h.x,y:h.y,age:0});g.events.push('freeze');return true;
}
export function updateFinalHercules(g,h,dt,api){
 const m=g.finalMission,s=g.hercules,r=FINAL_RULES.roundabout;
 if(m.state==='travelling'){
  const approach={x:r.x-78,y:r.y+94};api.navigate(h,approach,155,dt);
  if(finalDistance(h,approach)<32)startFinalEncounter(g,api);return true;
 }
 if(!finalActive(g))return m.state==='farewell'||m.state==='complete'||m.state==='failed';
 for(const key of ['guardTime','guardCooldown','invulnerable','flash','reaction','stun','freezeTime'])h[key]=Math.max(0,(h[key]??0)-dt);
 // Cooldown uses the same uncapped mission clock as frozenUntil.
 h.freezeCooldown=Math.max(0,(h.freezeCooldown??0)-(g.finalStep??dt));
 if(h.hp<=0){failFinalMission(g,'Hercules fell while fighting Sohel Rana’s group.');return true;}
 const enemies=finalGroup(g).filter(a=>!a.dead),near=enemies.filter(a=>finalDistance(a,h)<FINAL_RULES.freezeRange);
 if(near.length>=2||near.some(a=>a.windup>0))castHerculesFreeze(g,h);
 let target=enemies.find(a=>a.id===s.targetId);
 const nearest=enemies.sort((a,b)=>finalDistance(a,h)-finalDistance(b,h))[0];
 if(!target||nearest&&finalDistance(target,h)>finalDistance(nearest,h)+105){target=nearest;s.targetId=target?.id??null;h.pendingHit=null;h.navVia=null;h.pedestrianDetour=null;}
 if(!target)return true;
 if(h.pendingHit){h.pendingHit.time-=dt;if(h.pendingHit.time<=0){const hit=h.pendingHit;h.pendingHit=null;api.resolve(h,hit);if(g.story||g.status!=='playing')return true;}}
 if(h.stun>0)return true;
 const threats=near.filter(a=>a.windup>0&&(a.frozenUntil??0)<=g.elapsed);
 if(threats.length&&h.guardCooldown<=0){h.guardTime=.9;h.guardCooldown=2.4;h.defenses=(h.defenses??0)+1;}
 if(threats.length&&h.guardTime<=0&&h.attackTime<=0){
  const a=threats[0],d=finalDistance(h,a)||1,away={x:h.x+(h.x-a.x)/d*80,y:h.y+(h.y-a.y)/d*80};api.navigate(h,away,145,dt);s.mode='evade';return true;
 }
 const kind=h.nextCombo??'punch',spec=COMBAT_ACTIONS[kind];
 if(finalDistance(h,target)<=spec.range&&api.clear(h,target)){
  if(h.attack<=0){api.strike(h,target,kind);h.nextCombo=kind==='punch'?'kick':'punch';if(m.state==='rescue')h.attack=1.8;s.mode='fight';}
 }else{api.navigate(h,target,126,dt);s.mode='engage';}
 h.combatWatch??={x:h.x,y:h.y,time:0};h.combatWatch.time+=dt;
 if(finalDistance(h,h.combatWatch)>12)h.combatWatch={x:h.x,y:h.y,time:0};
 else if(h.combatWatch.time>2.5){h.navVia=null;h.pedestrianDetour=null;s.targetId=null;h.pendingHit=null;h.combatWatch={x:h.x,y:h.y,time:0};}
 return true;
}
export function updateFinalEnemy(g,a,dt,api){
 if(!a.finalEnemy)return false;if(!finalActive(g)||a.frozenUntil>g.elapsed)return true;
 const h=g.actors.find(b=>b.role==='hercules'&&!b.dead),p=g.player;
 let target=a.targetId===0?p:h;
 if(a.windup>0){
  if(!target||target.hp<=0){a.windup=0;return true;}
  a.windup-=dt;if(a.windup<=0){
   a.attackKind=a.weapon==='machete'?'machete':'punch';a.attackDuration=a.weapon==='machete'?.78:.46;a.attackTime=a.attackDuration;
   a.pendingWeaponHit={time:a.weapon==='machete'?.32:.17,targetId:a.targetId};a.cooldown=1.7;
  }return true;
 }
 if(a.pendingWeaponHit){
  a.pendingWeaponHit.time-=dt;
  if(a.pendingWeaponHit.time<=0){const hit=a.pendingWeaponHit;a.pendingWeaponHit=null;const victim=hit.targetId===0?p:g.actors.find(b=>b.id===hit.targetId&&!b.dead);
   if(victim&&victim.hp>0&&finalDistance(a,victim)<=a.range&&api.clear(a,victim))api.enemyHit(a,victim,a.range,a.damage);
  }return true;
 }
 if(a.attackTime>0)return true;
 const canPlayer=g.finalMission.arrived&&finalDistance(a,p)<340;
 if(!target||target.hp<=0||canPlayer&&(a.id%2===0||finalDistance(a,p)<finalDistance(a,h??p)*.75))target=canPlayer?p:h;
 if(!target)return true;a.targetId=target===p?0:target.id;a.aggro=true;
 const d=finalDistance(a,target);
 if(d<a.range&&a.cooldown<=0&&api.clear(a,target)){a.windup=a.weapon==='machete'?.95:.8;a.windupMax=a.windup;a.attackX=target.x;a.attackY=target.y;a.face=(target.x-target.y)-(a.x-a.y)>0?1:-1;}
 else if(d>42)api.navigate(a,target,a.speed,dt);
 return true;
}
