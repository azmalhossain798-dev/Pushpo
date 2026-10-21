import {SCENERY,ACTIVITY_SPOTS} from './scene-v3.mjs';
export const RULES=Object.freeze({duration:900,playerHealth:100,attackDamage:35,attackRange:88,attackCooldown:.4,moveSpeed:235,sightRange:580,sightDuration:5,sightCooldown:7,dashCooldown:2.1,maxEnemies:4,maxAttackers:2});
export const TYPES=[
 {label:'Murderer',health:100,points:10,sprite:1,color:'#ef6e65',speed:82,damage:10},
 {label:'Rapist',health:150,points:15,sprite:2,color:'#c3a4ed',speed:76,damage:9},
 {label:'Snatcher',health:70,points:5,sprite:3,color:'#ffcf68',speed:105,damage:7}
];
export const WORLD={width:3400,height:3600};
export const NODES={
 n0:[1470,180],n1:[1500,590],n2:[1535,1000],n3:[1580,1380],c:[1660,1750],
 s1:[1790,2180],s2:[1920,2610],s3:[2060,3050],s4:[2170,3430],
 w0:[220,1880],w1:[690,1840],w2:[1170,1790],e1:[2200,1810],e2:[2710,1880],e3:[3210,1940],
 a0:[280,670],a1:[840,630],a2:[2130,560],a3:[2710,520],a4:[3190,480],
 b0:[320,1110],b1:[900,1060],b2:[2180,980],b3:[2740,940],b4:[3190,900],
 d0:[350,1500],d1:[980,1440],d2:[2240,1400],d3:[2800,1380],
 f0:[250,2470],f1:[780,2370],f2:[1240,2280],f3:[2370,2220],f4:[2880,2380],
 g0:[280,2960],g1:[850,2850],g2:[1390,2740],g3:[2500,2690],g4:[2980,2900],
 h0:[450,3390],h1:[1000,3280],h2:[1500,3170],h3:[2620,3180],h4:[3160,3370]
};
export const ROADS=[];
const connect=(ids,width,name)=>ids.slice(1).forEach((id,i)=>ROADS.push({a:ids[i],b:id,width,name}));
connect(['n0','n1','n2','n3','c','s1','s2','s3','s4'],220,'Begum Rokeya Sarani');
connect(['w0','w1','w2','c','e1','e2','e3'],210,'Mirpur Road');
connect(['a0','a1','n1','a2','a3','a4'],100,'Avenue No. 1');
connect(['b0','b1','n2','b2','b3','b4'],94,'Road No. 2');
connect(['d0','d1','n3','d2','d3'],96,'Lane No. 3');
connect(['f0','f1','f2','s1'],120,'Boundary Road');
connect(['s1','f3','f4'],100,'Adarsha Road');
connect(['g0','g1','g2','s2','g3','g4'],96,'South Lanes');
connect(['h0','h1','h2','s3','h3','h4'],96,'Kathaltola Road');
connect(['a0','b0','d0','w0','f0','g0','h0'],90,'West Lanes');
connect(['a1','b1','d1','w1','f1','g1','h1'],90,'Lane No. 5');
connect(['a2','b2','d2','e1','f3','g3','h3'],95,'Club Road');
connect(['a3','b3','d3','e2','f4','g4','h4'],100,'Adarsha Road');
export const BOSSES=[
 {name:'Sumon Mia',threshold:150,hp:450,node:'n3',sprite:0,damage:15,speed:105,range:100,subtitle:'The first name',district:'Mirpur 10 Metro'},
 {name:'Hafizur Rahman',threshold:300,hp:600,node:'f1',sprite:1,damage:19,speed:110,range:118,subtitle:'The man behind the silence',district:'Boundary Road'},
 {name:'Sohel Rana',threshold:450,hp:850,node:'e2',sprite:2,damage:23,speed:122,range:135,subtitle:'The final reckoning',district:'East Market'}
];
const LINKS=Object.fromEntries(Object.keys(NODES).map(k=>[k,[]]));
for(const r of ROADS){LINKS[r.a].push(r.b);LINKS[r.b].push(r.a);}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function segmentDistance(x,y,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function inside(x,y,margin=12){
 if(x<65||y<65||x>WORLD.width-65||y>WORLD.height-65)return false;
 if(SCENERY.some(o=>Math.hypot(x-o.x,y-o.y)<o.radius+margin))return false;
 const d=Math.hypot(x-1660,y-1750);if(d<67+margin)return false;if(d<195-margin)return true;
 return ROADS.some(r=>segmentDistance(x,y,NODES[r.a],NODES[r.b])<r.width/2+35-margin);
}
export function clearPath(a,b){
 const count=Math.ceil(dist(a,b)/22);
 for(let i=1;i<=count;i++)if(!inside(a.x+(b.x-a.x)*i/count,a.y+(b.y-a.y)*i/count))return false;return true;
}
export function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function nearestNode(p){let best='',d=Infinity;for(const[id,[x,y]]of Object.entries(NODES)){const n=Math.hypot(x-p.x,y-p.y);if(n<d){d=n;best=id;}}return best;}
export function route(from,to){
 const q=[from],prev={[from]:null};for(let i=0;i<q.length;i++){if(q[i]===to)break;for(const n of LINKS[q[i]])if(!(n in prev)){prev[n]=q[i];q.push(n);}}
 const result=[];for(let n=to;n!=null;n=prev[n]){if(!(n in prev))return[];result.unshift(n);}return result;
}
function roadPoint(rng,around=null,min=0,max=Infinity){
 for(let i=0;i<2000;i++){
  const road=ROADS[Math.floor(rng()*ROADS.length)],a=NODES[road.a],b=NODES[road.b],t=.15+rng()*.7;
  const p={x:a[0]+(b[0]-a[0])*t+(rng()-.5)*50,y:a[1]+(b[1]-a[1])*t+(rng()-.5)*50};
  if(inside(p.x,p.y)&&(!around||(dist(p,around)>min&&dist(p,around)<max)))return {...p,node:t>.5?road.b:road.a};
 }return{x:1510,y:1100,node:'n2'};
}
function makeActor(g,kind,near=false){
 const p=roadPoint(g.rng,near?g.player:null,near?310:0,near?1050:Infinity);
 const type=kind==='enemy'?Math.floor(g.rng()*TYPES.length):-1,t=TYPES[type];
 return{id:g.nextId++,...p,kind,type,label:t?.label,sprite:t?.sprite??[4,5,6][Math.floor(g.rng()*3)],
 hp:t?.health??100,maxHp:t?.health??100,known:false,face:g.rng()>.5?1:-1,walk:0,wait:g.rng()*2,
 speed:kind==='enemy'?t.speed:36+g.rng()*12,aggro:false,windup:0,cooldown:1.3+g.rng(),flash:0,dead:false};
}
export function createRun(seed=Date.now()){
 const g={seed,rng:random(seed),nextId:1,actors:[],player:{x:1490,y:1740,hp:100,face:1,walk:0,attack:0,sight:0,sightCooldown:0,dash:0,dashCooldown:0,invulnerable:0,flash:0,facingX:0,facingY:1},
 remaining:900,elapsed:0,points:0,kills:0,status:'playing',phase:'hunt',chapter:0,defeated:[],spawnClock:0,
 events:[],effects:[],message:'Use SIGHT to reveal the truth hidden in the crowd.',messageTime:6};
 for(let i=0;i<4;i++)g.actors.push(makeActor(g,'enemy',true));
 for(let i=0;i<10;i++)g.actors.push(makeActor(g,'civilian',i<5));
 for(const [i,spot]of ACTIVITY_SPOTS.entries()){
  g.actors.push({kind:'civilian',type:-1,hp:100,maxHp:100,known:false,dead:false,
   ...spot,spotId:spot.id,id:g.nextId++,homeX:spot.x,homeY:spot.y,face:i%2?-1:1,walk:0,
   activity:spot.role,activityClock:i*1.2,activityPhase:i%2?4:0,gesture:0,wait:0,flash:0,cooldown:0,speed:38});
 }return g;
}
function say(g,t){g.message=t;g.messageTime=5;}
function emit(g,type,x,y,extra={}){g.effects.push({type,x,y,age:0,...extra});}
function move(a,dx,dy){const bx=a.x,by=a.y;if(inside(a.x+dx,a.y))a.x+=dx;if(inside(a.x,a.y+dy))a.y+=dy;
 if(Math.hypot(a.x-bx,a.y-by)>.01){a.velocityX=a.x-bx;a.velocityY=a.y-by;if(Math.abs(dx-dy)>.05)a.face=dx-dy>0?1:-1;}
}
function steer(a,target,speed,dt){
 const d=dist(a,target);if(d<3){a.moving=false;return;}const before={x:a.x,y:a.y};move(a,(target.x-a.x)/d*speed*dt,(target.y-a.y)/d*speed*dt);
 a.moving=dist(a,before)>.05;if(a.moving)a.walk+=dt*9;
}
function navigate(a,target,speed,dt){
 if(clearPath(a,target)){steer(a,target,speed,dt);return;}
 // Step around parked vehicles and stalls before resuming the street route.
 for(const o of SCENERY){
  if(dist(a,o)<o.radius+100&&segmentDistance(o.x,o.y,[a.x,a.y],[target.x,target.y])<o.radius+18){
   const theta=Math.atan2(a.y-o.y,a.x-o.x),goal=Math.atan2(target.y-o.y,target.x-o.x);
   const delta=Math.atan2(Math.sin(goal-theta),Math.cos(goal-theta)),radius=o.radius+30;
   const next=theta+Math.sign(delta||1)*.55;
   const aim={x:o.x+Math.cos(next)*radius,y:o.y+Math.sin(next)*radius};
   if(inside(aim.x,aim.y)){steer(a,aim,speed,dt);return;}
  }
 }
 const center={x:1660,y:1750};
 if(dist(a,center)<420&&segmentDistance(center.x,center.y,[a.x,a.y],[target.x,target.y])<95){
  const angle=Math.atan2(a.y-center.y,a.x-center.x),goal=Math.atan2(target.y-center.y,target.x-center.x);
  const turn=Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle));
  const next=angle+Math.sign(turn||1)*.42;
  steer(a,{x:center.x+Math.cos(next)*153,y:center.y+Math.sin(next)*153},speed,dt);return;
 }
 const start=nearestNode(a),end=nearestNode(target),path=route(start,end);
 const atNode=dist(a,{x:NODES[start][0],y:NODES[start][1]})<(start==='c'?230:65);
 const first=NODES[path[atNode?1:0]??start];
 let aim={x:first[0],y:first[1]};if(Math.hypot(aim.x-1660,aim.y-1750)<70)aim={x:1770,y:1750};steer(a,aim,speed,dt);
}
export function useSight(g){
 if(g.status!=='playing'||g.player.sightCooldown>0)return false;
 g.player.sight=RULES.sightDuration;g.player.sightCooldown=RULES.sightCooldown;emit(g,'pulse',g.player.x,g.player.y);g.events.push('sight');
 reveal(g);say(g,'Dark auras reveal enemies. Blue diamonds mark civilians.');return true;
}
function reveal(g){for(const a of g.actors)if(!a.dead&&dist(a,g.player)<RULES.sightRange)a.known=true;}
export function dash(g,dx=0,dy=0){
 const p=g.player;if(g.status!=='playing'||p.dashCooldown>0)return false;
 if(!dx&&!dy){dx=p.facingX;dy=p.facingY;}const length=Math.hypot(dx,dy)||1;
 p.dashX=dx/length;p.dashY=dy/length;p.dash=.18;p.invulnerable=.4;p.dashCooldown=RULES.dashCooldown;g.events.push('dash');return true;
}
export function currentBoss(g){return BOSSES[Math.min(g.chapter,2)];}
export function objectivePosition(g){
 if(g.phase==='boss'){const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);return b?{x:b.x,y:b.y}:null;}
 const closest=g.actors.filter(a=>!a.dead&&a.kind==='enemy').sort((a,b)=>dist(a,g.player)-dist(b,g.player))[0];
 return closest?{x:closest.x,y:closest.y}:null;
}
export function spawnBoss(g){
 if(g.phase==='boss'||g.chapter>2)return;const b=currentBoss(g),[x,y]=NODES[b.node];
 g.actors.push({id:g.nextId++,x,y,kind:'boss',label:b.name,sprite:b.sprite,hp:b.hp,maxHp:b.hp,known:true,face:1,walk:0,speed:b.speed,aggro:false,windup:0,cooldown:2,flash:0,dead:false});
 g.phase='boss';for(const a of g.actors)if(a.kind==='enemy'){a.aggro=false;a.windup=0;}
 emit(g,'arrival',x,y);g.events.push('boss');say(g,`${b.name} awaits at ${b.district}. Follow the red marker.`);
}
export function attack(g){
 const p=g.player;if(g.status!=='playing'||p.attack>0)return false;p.attack=RULES.attackCooldown;
 const target=g.actors.filter(a=>!a.dead&&a.kind!=='civilian'&&(a.known||a.aggro)&&dist(a,p)<=RULES.attackRange&&clearPath(a,p)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
 const angle=target?Math.atan2(target.y-p.y,target.x-p.x):Math.atan2(p.facingY,p.facingX);emit(g,'slash',p.x,p.y,{angle});g.events.push('swing');if(!target)return true;
 target.known=true;
 if(!target.aggro){
  const others=g.actors.filter(a=>!a.dead&&a.aggro&&a!==target).sort((a,b)=>dist(b,p)-dist(a,p));
  while(others.length>=RULES.maxAttackers){const old=others.shift();old.aggro=false;old.windup=0;}
 }
 target.aggro=true;target.hp=Math.max(0,target.hp-RULES.attackDamage);target.flash=.14;
 emit(g,'number',target.x,target.y-100,{text:`−${RULES.attackDamage}`,color:'#ffefbc'});g.events.push('hit');
 if(target.hp===0){
  target.dead=true;emit(g,'vanish',target.x,target.y);g.events.push('kill');
  if(target.kind==='boss'){
   g.defeated.push(currentBoss(g).name);g.chapter++;
   if(g.chapter===3){g.status='won';g.events.push('win');say(g,'Sohel Rana has fallen. The three names are finally silenced.');}
   else{g.phase='hunt';g.remaining=RULES.duration;p.hp=100;g.events.push('chapter');say(g,`${g.defeated.at(-1)} defeated. Next: ${currentBoss(g).name}. A fresh 15 minutes begins.`);}
  }else{
   const reward=TYPES[target.type].points;g.points+=reward;g.kills++;p.hp=Math.min(100,p.hp+13);
   emit(g,'number',target.x,target.y-125,{text:`+${reward} points`,color:'#ffda73'});
   if(g.phase==='hunt'&&g.points>=currentBoss(g).threshold)spawnBoss(g);
  }
 }return true;
}
export function update(g,elapsed,input={x:0,y:0}){
 if(g.status!=='playing')return;g.remaining=Math.max(0,g.remaining-elapsed);g.elapsed+=elapsed;
 if(g.remaining<=0){g.status='lost';g.reason=`Time ran out before you defeated ${currentBoss(g).name}.`;g.events.push('lose');return;}
 const dt=Math.min(elapsed,.06),p=g.player;
 for(const key of ['attack','sight','sightCooldown','dashCooldown','invulnerable','flash'])p[key]=Math.max(0,p[key]-dt);
 g.messageTime=Math.max(0,g.messageTime-dt);
 let dx=input.x||0,dy=input.y||0,length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}if(length){p.facingX=dx;p.facingY=dy;}
 const previous={x:p.x,y:p.y};
 if(p.dash>0){p.dash-=dt;move(p,p.dashX*760*dt,p.dashY*760*dt);emit(g,'trail',p.x,p.y);}else move(p,dx*RULES.moveSpeed*dt,dy*RULES.moveSpeed*dt);
 p.moving=dist(p,previous)>.01;p.walk+=p.moving?dt*11:0;if(p.sight>0)reveal(g);if(input.attack)attack(g);if(g.status!=='playing')return;
 let engaged=g.actors.filter(a=>!a.dead&&a.kind!=='civilian'&&a.aggro).length;
 for(const a of g.actors){
  if(a.dead)continue;a.moving=false;a.flash=Math.max(0,a.flash-dt);a.cooldown=Math.max(0,a.cooldown-dt);const d=dist(a,p),allowed=a.kind==='boss'||g.phase==='hunt';
  if(a.activity){
   a.activityClock+=dt;const cycle=(a.activityClock+a.activityPhase)%16;
   const partner=g.actors.find(n=>n.spotId===a.partner);
   a.face=partner?((partner.x-partner.y)-(a.x-a.y)>0?1:-1):a.face;
   a.gesture=cycle<4?Math.sin(cycle*Math.PI/4):0;
   a.speech=cycle>.9&&cycle<3.8?a.lines[Math.floor(a.activityClock/16)%a.lines.length]:'';
   // Customers step aside and return to the counter; vendors stay at their stalls.
   const takingBreak=a.activity==='customer'&&cycle>8&&cycle<12;
   const aim={x:a.homeX+(takingBreak?34:0),y:a.homeY+(takingBreak?15:0)};
   if(dist(a,aim)>3&&clearPath(a,aim))steer(a,aim,a.speed,dt);
   else if(partner){a.velocityX=partner.x-a.x;a.velocityY=partner.y-a.y;}
   continue;
  }
  if(a.kind!=='civilian'&&allowed&&!a.aggro&&d<(a.kind==='boss'?520:155)&&engaged<RULES.maxAttackers&&g.elapsed>4&&clearPath(a,p)){a.aggro=true;a.known=true;engaged++;}
  if(a.windup>0){
   a.windup-=dt;a.moving=false;if(a.windup<=0){
    const range=a.kind==='boss'?currentBoss(g).range:52;emit(g,'impact',a.attackX,a.attackY,{range});
    if(Math.hypot(p.x-a.attackX,p.y-a.attackY)<range&&p.invulnerable<=0){
     const damage=a.kind==='boss'?currentBoss(g).damage:TYPES[a.type].damage;p.hp=Math.max(0,p.hp-damage);p.invulnerable=.65;p.flash=.2;
     emit(g,'number',p.x,p.y-100,{text:`−${damage}`,color:'#ff8b75'});g.events.push('hurt');
     if(p.hp===0){g.status='lost';g.reason='Pushpo’s golden life force was exhausted.';g.events.push('lose');return;}
    }a.cooldown=a.kind==='boss'?1.6:1.9;
   }continue;
  }
  if(a.aggro){
   if(d<(a.kind==='boss'?currentBoss(g).range:62)&&a.cooldown<=0){a.windup=a.kind==='boss'?1:.75;a.windupMax=a.windup;a.attackX=p.x;a.attackY=p.y;a.moving=false;}
   else if(d>42)navigate(a,p,a.speed,dt);
   if(d>700&&a.kind!=='boss'){a.aggro=false;engaged--;a.node=nearestNode(a);}
  }else if(a.kind==='boss')a.moving=false;
  else{
   a.wait-=dt;if(a.wait>0){a.moving=false;continue;}
   const dest=NODES[a.node??nearestNode(a)];let target={x:dest[0]+22,y:dest[1]+18};if(a.node==='c')target={x:1770,y:1790};
   if(dist(a,target)<35){const options=LINKS[a.node].filter(n=>n!==a.previous);a.previous=a.node;a.node=(options.length?options:LINKS[a.node])[Math.floor(g.rng()*(options.length||LINKS[a.node].length))];a.wait=.2+g.rng()*1.8;}
   else navigate(a,target,a.kind==='civilian'?a.speed:32,dt);
  }
 }
 g.spawnClock-=dt;
 if(g.phase==='hunt'&&g.spawnClock<=0){
  g.spawnClock=3.5;
  for(const a of g.actors)if(!a.dead&&a.kind!=='boss'&&!a.activity&&dist(a,p)>1550){const pos=roadPoint(g.rng,p,650,1100);Object.assign(a,pos,{aggro:false,windup:0,known:false});}
  if(g.actors.filter(a=>a.kind==='enemy'&&!a.dead).length<RULES.maxEnemies)g.actors.push(makeActor(g,'enemy',true));
 }
 const live=g.actors.filter(a=>!a.dead);
 for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],b=live[j],d=dist(a,b);if(d>0&&d<30){const push=(30-d)*.06;if(!a.activity)move(a,(a.x-b.x)/d*push,(a.y-b.y)/d*push);if(!b.activity)move(b,(b.x-a.x)/d*push,(b.y-a.y)/d*push);}}
 for(const e of g.effects)e.age+=dt;g.effects=g.effects.filter(e=>e.age<(e.type==='number'?1.2:e.type==='pulse'?1.5:.6));
 g.actors=g.actors.filter(a=>!a.dead||a.kind==='boss');
}
export function formatTime(t){t=Math.ceil(Math.max(0,t));return`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;}
