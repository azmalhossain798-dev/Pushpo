import {SCENERY,ACTIVITY_SPOTS,CITY,ROUNDABOUTS} from './scene-v3.mjs';
import {CITY_POPULATION,SNATCHER_TAUNT,enemyIdentified,createMetro,updateMetro,separateCrowd} from './city-systems.mjs';
export const RULES=Object.freeze({duration:900,playerHealth:100,attackDamage:35,attackRange:88,attackCooldown:.4,moveSpeed:235,sightRange:580,sightDuration:5,sightCooldown:7,dashCooldown:2.1,maxEnemies:4,maxAttackers:2});
export const TYPES=[
 {label:'Murderer',health:100,points:10,sprite:1,color:'#ef6e65',speed:82,damage:10},
 {label:'Rapist',health:150,points:15,sprite:2,color:'#c3a4ed',speed:76,damage:9},
 {label:'Snatcher',health:70,points:5,sprite:3,color:'#ffcf68',speed:105,damage:7}
];
export const WORLD=CITY;
export const NODES={
 n0:[1470,180],n1:[1500,590],n2:[1535,1000],n3:[1580,1380],c:[1660,1750],
 s1:[1790,2180],s2:[1920,2610],s3:[2060,3050],s4:[2170,3430],
 w0:[220,1880],w1:[690,1840],w2:[1170,1790],e1:[2200,1810],e2:[2710,1880],e3:[3210,1940],
 a0:[280,670],a1:[840,630],a2:[2130,560],a3:[2710,520],a4:[3190,480],
 b0:[320,1110],b1:[900,1060],b2:[2180,980],b3:[2740,940],b4:[3190,900],
 d0:[350,1500],d1:[980,1440],d2:[2240,1400],d3:[2800,1380],
 f0:[250,2470],f1:[780,2370],f2:[1240,2280],f3:[2370,2220],f4:[2880,2380],
 g0:[280,2960],g1:[850,2850],g2:[1390,2740],g3:[2500,2690],g4:[2980,2900],
 h0:[450,3390],h1:[1000,3280],h2:[1500,3170],h3:[2620,3180],h4:[3160,3370],
 j0:[3770,440],j1:[3800,890],j2:[3840,1370],j3:[3870,2110],j4:[3910,2550],j5:[3960,3050],j6:[4010,3500],
 k0:[4370,420],k1:[4380,870],k2:[4380,1390],k3:[4380,2110],k4:[4380,2590],k5:[4370,3090],k6:[4350,3530],
 t0:[450,3950],t1:[1100,3900],t2:[1700,3860],t3:[2470,4020],t4:[3240,3900],t5:[4000,3980],t6:[4360,4000],
 u0:[500,4470],u1:[1140,4480],u2:[1770,4490],u3:[2530,4510],u4:[3270,4490],u5:[4020,4470],u6:[4360,4450]
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
connect(['a4','j0','k0'],100,'North bazaar');
connect(['b4','j1','k1'],94,'New market road');
connect(['d3','j2','k2'],100,'Eastern avenue');
connect(['e3','j3','k3'],190,'East junction');
connect(['f4','j4','k4'],120,'Garden road');
connect(['g4','j5','k5'],100,'College road');
connect(['h4','j6','k6'],110,'Southern bazaar');
connect(['j0','j1','j2','j3','j4','j5','j6','t5','u5'],150,'East circular road');
connect(['k0','k1','k2','k3','k4','k5','k6','t6','u6'],100,'East lanes');
connect(['h0','t0','u0'],100,'West extension');connect(['h1','t1','u1'],100,'South lane five');
connect(['h2','t2','u2'],110,'Kathaltola extension');connect(['s4','t3','u3'],180,'South circular road');
connect(['h4','t4','u4'],100,'South market link');
connect(['t0','t1','t2','t3','t4','t5','t6'],145,'South junction road');
connect(['u0','u1','u2','u3','u4','u5','u6'],110,'River road');
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
 for(const ring of ROUNDABOUTS){const d=Math.hypot(x-ring.x,y-ring.y);if(d<ring.inner+margin)return false;if(d<ring.outer-margin)return true;}
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
 const type=kind==='enemy'?Math.floor(g.rng()*TYPES.length):-1,t=TYPES[type],male=[1,2,5,6],cover=male[Math.floor(g.rng()*male.length)],wanderSpeed=36+g.rng()*12;
 return{id:g.nextId++,...p,kind,type,label:t?.label,sprite:kind==='enemy'?(type===1?cover:type===0?[1,2,6][Math.floor(g.rng()*3)]:3):[4,4,1,2,5,6][Math.floor(g.rng()*6)],variant:Math.floor(g.rng()*3),sightRevealed:false,wanderSpeed,
 hp:t?.health??100,maxHp:t?.health??100,known:false,face:g.rng()>.5?1:-1,walk:0,wait:g.rng()*2,
 speed:kind==='enemy'?t.speed:wanderSpeed,attackTime:0,attackDuration:.3,speech:'',speechTime:0,aggro:false,windup:0,cooldown:1.3+g.rng(),flash:0,dead:false};
}
export function createRun(seed=Date.now()){
 const g={seed,rng:random(seed),nextId:1,actors:[],player:{x:1490,y:1740,hp:100,face:1,walk:0,attack:0,sight:0,sightCooldown:0,dash:0,dashCooldown:0,invulnerable:0,flash:0,facingX:0,facingY:1},
 remaining:900,elapsed:0,points:0,kills:0,status:'playing',phase:'hunt',chapter:0,defeated:[],spawnClock:0,
 events:[],effects:[],message:'Use SIGHT to reveal the truth hidden in the crowd.',messageTime:6};
 g.metro=createMetro(g.rng);
 for(let i=0;i<4;i++)g.actors.push(makeActor(g,'enemy',true));
 for(let i=0;i<10;i++)g.actors.push(makeActor(g,'civilian',i<5));
 for(const [i,spot]of ACTIVITY_SPOTS.entries()){
  g.actors.push({kind:'civilian',type:-1,hp:100,maxHp:100,known:false,dead:false,
   ...spot,spotId:spot.id,id:g.nextId++,homeX:spot.x,homeY:spot.y,face:i%2?-1:1,walk:0,
   activity:spot.role,activityClock:i*1.2,activityPhase:i%2?4:0,gesture:0,wait:0,flash:0,cooldown:0,speed:38});
 }
 while(g.actors.length<CITY_POPULATION){const resident=makeActor(g,'civilian',g.actors.length<42);resident.resident=true;g.actors.push(resident);}
 const homeless=g.actors[g.actors.length-1];Object.assign(homeless,{homeless:true,askCooldown:4,sprite:6});
 return g;
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
 for(const ring of ROUNDABOUTS){
  const center={x:ring.x,y:ring.y};
  if(dist(a,center)<ring.outer+225&&segmentDistance(center.x,center.y,[a.x,a.y],[target.x,target.y])<ring.inner+27){
   const angle=Math.atan2(a.y-center.y,a.x-center.x),goal=Math.atan2(target.y-center.y,target.x-center.x);
   const turn=Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle)),next=angle+Math.sign(turn||1)*.42,radius=(ring.outer+ring.inner)/2+14;
   steer(a,{x:center.x+Math.cos(next)*radius,y:center.y+Math.sin(next)*radius},speed,dt);return;
  }
 }
 const start=nearestNode(a),end=nearestNode(target),path=route(start,end);
 const circle=ROUNDABOUTS.find(r=>Math.hypot(NODES[start][0]-r.x,NODES[start][1]-r.y)<10);
 const atNode=dist(a,{x:NODES[start][0],y:NODES[start][1]})<(circle?circle.outer+34:65);
 const first=NODES[path[atNode?1:0]??start];
 let aim={x:first[0],y:first[1]};for(const r of ROUNDABOUTS)if(Math.hypot(aim.x-r.x,aim.y-r.y)<r.inner){const angle=Math.atan2(a.y-r.y,a.x-r.x);aim={x:r.x+Math.cos(angle)*(r.outer+r.inner)/2,y:r.y+Math.sin(angle)*(r.outer+r.inner)/2};}steer(a,aim,speed,dt);
}
export function useSight(g){
 if(g.status!=='playing'||g.player.sightCooldown>0)return false;
 g.player.sight=RULES.sightDuration;g.player.sightCooldown=RULES.sightCooldown;emit(g,'pulse',g.player.x,g.player.y);g.events.push('sight');
 reveal(g);say(g,'Dark auras reveal enemies. Blue diamonds mark civilians.');return true;
}
function reveal(g){for(const a of g.actors)if(!a.dead&&dist(a,g.player)<RULES.sightRange){a.known=true;if(a.kind==='enemy')a.sightRevealed=true;}}
export function dash(g,dx=0,dy=0){
 const p=g.player;if(g.status!=='playing'||p.dashCooldown>0)return false;
 if(!dx&&!dy){dx=p.facingX;dy=p.facingY;}const length=Math.hypot(dx,dy)||1;
 p.dashX=dx/length;p.dashY=dy/length;p.dash=.18;p.invulnerable=.4;p.dashCooldown=RULES.dashCooldown;g.events.push('dash');return true;
}
export function currentBoss(g){return BOSSES[Math.min(g.chapter,2)];}
export function objectivePosition(g){
 if(g.phase==='boss'){const b=g.actors.find(a=>a.kind==='boss'&&!a.dead);return b?{x:b.x,y:b.y}:null;}
 const closest=g.actors.filter(a=>!a.dead&&a.kind==='enemy'&&(a.type!==1||enemyIdentified(a))).sort((a,b)=>dist(a,g.player)-dist(b,g.player))[0];
 return closest?{x:closest.x,y:closest.y}:null;
}
export function spawnBoss(g){
 if(g.phase==='boss'||g.chapter>2)return;const b=currentBoss(g),[x,y]=NODES[b.node];
 g.actors.push({id:g.nextId++,x,y,kind:'boss',label:b.name,sprite:b.sprite,hp:b.hp,maxHp:b.hp,known:true,face:1,walk:0,speed:b.speed,aggro:false,windup:0,cooldown:2,flash:0,dead:false});
 g.phase='boss';for(const a of g.actors)if(a.kind==='enemy'){a.aggro=false;a.windup=0;}
 emit(g,'arrival',x,y);g.events.push('boss');say(g,`${b.name} awaits at ${b.district}. Follow the red marker.`);
}
export function attack(g){
 const p=g.player;if(g.status!=='playing'||p.attack>0)return false;p.attack=RULES.attackCooldown;p.attackTime=.3;p.attackDuration=.3;
 const target=g.actors.filter(a=>!a.dead&&a.kind!=='civilian'&&enemyIdentified(a)&&dist(a,p)<=RULES.attackRange&&clearPath(a,p)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
 const angle=target?Math.atan2(target.y-p.y,target.x-p.x):Math.atan2(p.facingY,p.facingX);emit(g,'slash',p.x,p.y,{angle});g.events.push('swing');if(!target)return true;
 p.face=(target.x-target.y)-(p.x-p.y)>0?1:-1;
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
   else{g.phase='hunt';g.remaining=RULES.duration;g.events.push('chapter');say(g,`${g.defeated.at(-1)} defeated. Next: ${currentBoss(g).name}. A fresh 15 minutes begins.`);}
  }else{
   const reward=TYPES[target.type].points;g.points+=reward;g.kills++;
   emit(g,'number',target.x,target.y-125,{text:`+${reward} points`,color:'#ffda73'});
   if(g.phase==='hunt'&&g.points>=currentBoss(g).threshold)spawnBoss(g);
  }
 }return true;
}
export function update(g,elapsed,input={x:0,y:0}){
 if(g.status!=='playing')return;updateMetro(g,elapsed);g.remaining=Math.max(0,g.remaining-elapsed);g.elapsed+=elapsed;
 if(g.remaining<=0){g.status='lost';g.reason=`Time ran out before you defeated ${currentBoss(g).name}.`;g.events.push('lose');return;}
 const dt=Math.min(elapsed,.06),p=g.player;
 for(const key of ['attack','attackTime','sight','sightCooldown','dashCooldown','invulnerable','flash'])p[key]=Math.max(0,(p[key]||0)-dt);
 g.messageTime=Math.max(0,g.messageTime-dt);
 let dx=input.x||0,dy=input.y||0,length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}if(length){p.facingX=dx;p.facingY=dy;}
 const previous={x:p.x,y:p.y};
 if(p.dash>0){p.dash-=dt;move(p,p.dashX*760*dt,p.dashY*760*dt);emit(g,'trail',p.x,p.y);}else move(p,dx*RULES.moveSpeed*dt,dy*RULES.moveSpeed*dt);
 p.moving=dist(p,previous)>.01;p.walk+=p.moving?dt*11:0;if(p.sight>0)reveal(g);if(input.attack)attack(g);if(g.status!=='playing')return;
 let engaged=g.actors.filter(a=>!a.dead&&a.kind!=='civilian'&&a.aggro).length;
 for(const a of g.actors){
  if(a.dead)continue;a.moving=false;a.attackTime=Math.max(0,(a.attackTime||0)-dt);a.speechTime=Math.max(0,(a.speechTime||0)-dt);if(!a.activity&&a.speechTime<=0)a.speech='';a.flash=Math.max(0,a.flash-dt);a.cooldown=Math.max(0,a.cooldown-dt);const d=dist(a,p),hiddenRapist=a.kind==='enemy'&&a.type===1&&!enemyIdentified(a),allowed=a.kind==='boss'||g.phase==='hunt';
  if(hiddenRapist){a.aggro=false;a.windup=0;}
  if(a.homeless){
   a.askCooldown-=dt;
   if(a.askCooldown<=0){
    const passer=g.actors.find(n=>n!==a&&!n.dead&&n.kind==='civilian'&&!n.homeless&&dist(a,n)<125);
    if(passer){a.speech=g.rng()>.5?'একটু খাবার হবে, ভাই?':'খাবারের জন্য কিছু সাহায্য করবেন?';a.speechTime=4;a.gesture=.7;a.wait=3.5;
     passer.wait=Math.max(passer.wait,2);if(!passer.activity){passer.speech='এই নিন, কিছু খাবার।';passer.speechTime=3;}
     a.face=(passer.x-passer.y)-(a.x-a.y)>0?1:-1;a.askCooldown=25+g.rng()*35;
    }else a.askCooldown=2;
   }if(a.speechTime<=0)a.gesture=0;
  }
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
  if(a.kind!=='civilian'&&!hiddenRapist&&allowed&&!a.aggro&&d<(a.kind==='boss'?520:155)&&engaged<RULES.maxAttackers&&g.elapsed>4&&clearPath(a,p)){a.aggro=true;a.known=true;engaged++;}
  if(a.windup>0){
   a.windup-=dt;a.moving=false;if(a.windup<=0){
    a.attackTime=.3;a.attackDuration=.3;a.face=(p.x-p.y)-(a.x-a.y)>0?1:-1;
    const range=a.kind==='boss'?currentBoss(g).range:52;emit(g,'impact',a.attackX,a.attackY,{range});
    if(Math.hypot(p.x-a.attackX,p.y-a.attackY)<range&&p.invulnerable<=0){
     const damage=a.kind==='boss'?currentBoss(g).damage:TYPES[a.type].damage;p.hp=Math.max(0,p.hp-damage);p.invulnerable=.65;p.flash=.2;
     emit(g,'number',p.x,p.y-100,{text:`−${damage}`,color:'#ff8b75'});g.events.push('hurt');
     if(p.hp===0){g.status='lost';g.reason='Pushpo’s golden life force was exhausted.';g.events.push('lose');return;}
    }a.cooldown=a.kind==='boss'?1.6:1.9;
   }continue;
  }
  if(a.aggro){
   if(d<(a.kind==='boss'?currentBoss(g).range:62)&&a.cooldown<=0){a.windup=a.kind==='boss'?1:.75;a.windupMax=a.windup;a.attackX=p.x;a.attackY=p.y;a.moving=false;a.face=(p.x-p.y)-(a.x-a.y)>0?1:-1;if(a.type===2){a.speech=SNATCHER_TAUNT;a.speechTime=3.2;}}
   else if(d>42)navigate(a,p,a.speed,dt);
   if(d>700&&a.kind!=='boss'){a.aggro=false;engaged--;a.node=nearestNode(a);}
  }else if(a.kind==='boss')a.moving=false;
  else{
   a.aiClock=(a.aiClock||0)+dt;if(d>1100&&a.aiClock<.2)continue;const wanderDt=d>1100?a.aiClock:dt;a.aiClock=0;
   a.wait-=wanderDt;if(a.wait>0){a.moving=false;continue;}
   const dest=NODES[a.node??nearestNode(a)];let target={x:dest[0]+22,y:dest[1]+18};for(const ring of ROUNDABOUTS)if(Math.hypot(dest[0]-ring.x,dest[1]-ring.y)<10){const radius=(ring.outer+ring.inner)/2;target={x:ring.x+radius*.94,y:ring.y+radius*.34};}
   if(dist(a,target)<35){const options=LINKS[a.node].filter(n=>n!==a.previous);a.previous=a.node;a.node=(options.length?options:LINKS[a.node])[Math.floor(g.rng()*(options.length||LINKS[a.node].length))];a.wait=.2+g.rng()*1.8;}
   else navigate(a,target,a.kind==='civilian'?a.speed:hiddenRapist?a.wanderSpeed:32,wanderDt);
  }
 }
 g.spawnClock-=dt;
 if(g.phase==='hunt'&&g.spawnClock<=0){
  g.spawnClock=3.5;
  for(const a of g.actors)if(!a.dead&&a.kind!=='boss'&&!a.activity&&!a.resident&&!a.homeless&&dist(a,p)>1550){const pos=roadPoint(g.rng,p,650,1100);Object.assign(a,pos,{aggro:false,windup:0,known:false,sightRevealed:false});}
  if(g.actors.filter(a=>a.kind==='enemy'&&!a.dead).length<RULES.maxEnemies)g.actors.push(makeActor(g,'enemy',true));
 }
 separateCrowd(g.actors,move);
 for(const e of g.effects)e.age+=dt;g.effects=g.effects.filter(e=>e.age<(e.type==='number'?1.2:e.type==='pulse'?1.5:.6));
 g.actors=g.actors.filter(a=>!a.dead||a.kind==='boss');
}
export function formatTime(t){t=Math.ceil(Math.max(0,t));return`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;}
