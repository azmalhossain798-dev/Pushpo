import {SCENERY,ACTIVITY_SPOTS,CITY,ROUNDABOUTS} from './scene-v3.mjs';
import {CITY_POPULATION,SNATCHER_TAUNT,enemyIdentified,createMetro,updateMetro,separateCrowd,crowdNeighbors} from './city-systems.mjs';
import {createTraffic,updateTraffic,pedestrianTrafficClearance} from './traffic-v5.mjs';
import {pedestrianObstructed,planPedestrianDetour} from './pedestrian-v5.mjs';
import {RAPIST_APPROACH_LINE,beginBossStory,advanceBossStory} from './story-v6.mjs';
import {assignHouseVisits,updateHouseVisit,houseCollidable} from './homes-v6.mjs';
import {COMBAT_ACTIONS,MURDERER_LINES,ESCAPE_LINES,SPECIAL_LINE,MIRROR_RULES,sightAvailable,mirrorAvailable,combatReady,assignSpecialNpcs} from './combat-v7.mjs';
import {chapterClockActive,finalMissionReady} from './story-v8.mjs';
import {initHercules,beginHerculesIntro,finishHerculesIntro,updateHercules,recordHerculesKill} from './hercules-v8.mjs';
import {FINAL_RULES,finalActive,finalGroup,updateFinalMission,updateFinalEnemy,finishFinalFarewell,failFinalMission} from './final-v9.mjs';
import {initFuchka,eatAtFuchka} from './world-v10.mjs';
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
const connect=(ids,width,name,lanes=2)=>ids.slice(1).forEach((id,i)=>ROADS.push({a:ids[i],b:id,width,name,lanes}));
connect(['n0','n1','n2','n3','c','s1','s2','s3','s4'],360,'Begum Rokeya Sarani',4);
connect(['w0','w1','w2','c','e1','e2','e3'],360,'Mirpur Road',4);
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
 {name:'Sohel Rana',threshold:450,hp:TYPES[0].health*3,node:'e3',sprite:2,damage:15,speed:112,range:73,subtitle:'The final reckoning',district:'East Junction roundabout'}
];
const LINKS=Object.fromEntries(Object.keys(NODES).map(k=>[k,[]]));
for(const r of ROADS){LINKS[r.a].push(r.b);LINKS[r.b].push(r.a);}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function segmentDistance(x,y,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function inside(x,y,margin=12,ignoreProps=false){
 if(x<65||y<65||x>WORLD.width-65||y>WORLD.height-65)return false;
 if(!ignoreProps&&SCENERY.some(o=>Math.hypot(x-o.x,y-o.y)<o.radius+margin))return false;
 for(const ring of ROUNDABOUTS){const d=Math.hypot(x-ring.x,y-ring.y);if(d<ring.inner+margin)return false;if(d<ring.outer-margin)return true;}
 return ROADS.some(r=>segmentDistance(x,y,NODES[r.a],NODES[r.b])<r.width/2+35-margin);
}
export function clearPath(a,b,ignoreProps=false){
 const count=Math.ceil(dist(a,b)/22);
 for(let i=1;i<=count;i++)if(!inside(a.x+(b.x-a.x)*i/count,a.y+(b.y-a.y)*i/count,12,ignoreProps))return false;return true;
}
export function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function nearestNode(p){let best='',d=Infinity;for(const[id,[x,y]]of Object.entries(NODES)){const n=Math.hypot(x-p.x,y-p.y);if(n<d){d=n;best=id;}}return best;}
export function route(from,to){
 const q=[from],prev={[from]:null};for(let i=0;i<q.length;i++){if(q[i]===to)break;for(const n of LINKS[q[i]])if(!(n in prev)){prev[n]=q[i];q.push(n);}}
 const result=[];for(let n=to;n!=null;n=prev[n]){if(!(n in prev))return[];result.unshift(n);}return result;
}
function roadPoint(rng,around=null,min=0,max=Infinity,traffic=[]){
 for(let i=0;i<2000;i++){
  const road=ROADS[Math.floor(rng()*ROADS.length)],a=NODES[road.a],b=NODES[road.b],t=.15+rng()*.7;
  const p={x:a[0]+(b[0]-a[0])*t+(rng()-.5)*50,y:a[1]+(b[1]-a[1])*t+(rng()-.5)*50};
  if(inside(p.x,p.y)&&traffic.every(v=>pedestrianTrafficClearance(p,v)>=25)&&(!around||(dist(p,around)>min&&dist(p,around)<max)))return {...p,node:t>.5?road.b:road.a};
 }return{x:1510,y:1100,node:'n2'};
}
function makeActor(g,kind,near=false,forcedType=null){
 const p=roadPoint(g.rng,near?g.player:null,near?310:0,near?1050:Infinity,g.traffic);
 const type=kind==='enemy'?(forcedType??(sightAvailable(g)?Math.floor(g.rng()*TYPES.length):g.rng()<.65?2:0)):-1,t=TYPES[type],male=[1,2,5,6],cover=male[Math.floor(g.rng()*male.length)],wanderSpeed=36+g.rng()*12;
 return{id:g.nextId++,...p,kind,type,label:t?.label,coverSprite:cover,sprite:kind==='enemy'?(type===1?cover:type===0?[1,2,6][Math.floor(g.rng()*3)]:3):[4,4,1,2,5,6][Math.floor(g.rng()*6)],variant:Math.floor(g.rng()*3),sightRevealed:false,wanderSpeed,
 hp:t?.health??100,maxHp:t?.health??100,known:false,murderLine:type===0?MURDERER_LINES[Math.floor(g.rng()*3)]:null,face:g.rng()>.5?1:-1,walk:0,wait:g.rng()*2,
 speed:kind==='enemy'?t.speed:wanderSpeed,attackTime:0,attackDuration:.3,speech:'',speechTime:0,aggro:false,windup:0,cooldown:1.3+g.rng(),flash:0,dead:false};
}
export function createRun(seed=Date.now()){
 const g={seed,rng:random(seed),nextId:1,actors:[],player:{x:1490,y:1740,hp:RULES.playerHealth,maxHp:RULES.playerHealth,face:1,walk:0,attack:0,sight:0,sightCooldown:0,dash:0,dashCooldown:0,invulnerable:0,flash:0,facingX:0,facingY:1},
 remaining:900,elapsed:0,points:0,kills:0,status:'playing',phase:'hunt',chapter:0,defeated:[],spawnClock:0,
 events:[],effects:[],tutorial:{guided:false,ambush:0,next:24},message:'Slap (Q) or Punch & Kick (Space). Defeat five enemies to awaken Sight.',messageTime:8};
 g.metro=createMetro(g.rng);
 for(let i=0;i<4;i++)g.actors.push(makeActor(g,'enemy',true,i===1?0:2));
 for(let i=0;i<10;i++)g.actors.push(makeActor(g,'civilian',i<5));
 for(const [i,spot]of ACTIVITY_SPOTS.entries()){
  g.actors.push({kind:'civilian',type:-1,hp:100,maxHp:100,known:false,dead:false,
   ...spot,spotId:spot.id,id:g.nextId++,homeX:spot.x,homeY:spot.y,face:i%2?-1:1,walk:0,
   activity:spot.role,activityClock:i*1.2,activityPhase:i%2?4:0,gesture:0,wait:0,flash:0,cooldown:0,speed:38});
 }
 while(g.actors.length<CITY_POPULATION){const resident=makeActor(g,'civilian',g.actors.length<42);resident.resident=true;g.actors.push(resident);}
 const homeless=g.actors[g.actors.length-1];Object.assign(homeless,{homeless:true,askCooldown:4,sprite:6});
 g.story=null;g.storySeen=[];g.chapterTarget=null;g.chapterStartPoints=0;assignHouseVisits(g);assignSpecialNpcs(g);
 initFuchka(g);
 g.trafficRng=random(seed^0x712fab);g.traffic=createTraffic(g.trafficRng,NODES,ROADS,inside,[g.player,...g.actors]);
 const first=g.actors[0],spot=ambushSpot(g,first);if(spot)Object.assign(first,spot,{wait:12,tutorialGuard:true});g.tutorial.target=first.id;
 initHercules(g);return g;
}
function say(g,t){g.message=t;g.messageTime=5;}
function emit(g,type,x,y,extra={}){g.effects.push({type,x,y,age:0,...extra});}
function move(a,dx,dy,traffic=[]){const bx=a.x,by=a.y,free=(x,y)=>inside(x,y)&&traffic.every(v=>pedestrianTrafficClearance({x,y},v)>=15);
 const clear=(dx,dy)=>{const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));for(let i=1;i<=steps;i++)if(!free(a.x+dx*i/steps,a.y+dy*i/steps))return false;return true;};
 if(clear(dx,0))a.x+=dx;if(clear(0,dy))a.y+=dy;
 if(Math.hypot(a.x-bx,a.y-by)>.01){a.velocityX=a.x-bx;a.velocityY=a.y-by;if(Math.abs(dx-dy)>.05)a.face=dx-dy>0?1:-1;}
}
function followPedestrianDetour(a,target,speed,dt,traffic,intent=target){
 let detour=a.pedestrianDetour;
 if(detour&&Math.hypot(intent.x-detour.intent.x,intent.y-detour.intent.y)>70){a.pedestrianDetour=null;detour=null;}
 if(detour)target=detour.target;
 if(!detour&&!pedestrianObstructed(a,target,traffic))return false;
 if(!detour){detour={target:{...target},intent:{...intent},path:null,retry:0,stalled:0,failures:0};a.pedestrianDetour=detour;}
 detour.retry=Math.max(0,detour.retry-dt);
 while(detour.path?.length&&dist(a,detour.path[0])<7)detour.path.shift();
 if(detour.path&&!detour.path.length){a.pedestrianDetour=null;return false;}
 if(detour.stalled>.45){detour.path=null;detour.stalled=0;}
 if(!detour.path&&detour.retry<=0){detour.path=planPedestrianDetour(a,target,traffic,inside,intent);detour.retry=.6;detour.failures=detour.path?0:detour.failures+1;}
 if(!detour.path){if(detour.failures>=2){a.pedestrianDetour=null;return false;}a.moving=false;return true;}
 const before={x:a.x,y:a.y};steer(a,detour.path[0],speed,dt,traffic);
 detour.stalled=dist(a,before)<.05?detour.stalled+dt:0;return true;
}
function steer(a,target,speed,dt,traffic=[]){
 const d=dist(a,target);if(d<3){a.moving=false;return;}const before={x:a.x,y:a.y},ux=(target.x-a.x)/d,uy=(target.y-a.y)/d;
 // Begin passing before body contact. Keeping right gives opposing walkers different lanes.
 let avoidance=0;for(const b of a.nearby??[]){const bx=b.x-a.x,by=b.y-a.y,ahead=bx*ux+by*uy,lateral=Math.abs(bx*uy-by*ux),gap=Math.hypot(bx,by);if(ahead>-4&&ahead<58&&lateral<30)avoidance=Math.max(avoidance,(58-gap)/25);}
 const vx=ux+uy*avoidance*1.7,vy=uy-ux*avoidance*1.7,length=Math.hypot(vx,vy),dx=vx/length*speed*dt,dy=vy/length*speed*dt;move(a,dx,dy,traffic,true);
 if(dist(a,before)<speed*dt*.35&&(a.nearby?.length??0)>0){for(const angle of [-.65,.65,-1.2,1.2,-1.7,1.7]){const co=Math.cos(angle),si=Math.sin(angle);move(a,dx*co-dy*si,dx*si+dy*co,traffic,true);if(dist(a,before)>speed*dt*.5)break;}}
 a.moving=dist(a,before)>.05;if(a.moving)a.walk+=dt*9;
}
function navigate(a,target,speed,dt,traffic=[]){
 let aim=target,local=clearPath(a,target);
 // Select the road/roundabout goal first, then route around the physical collider.
 for(const ring of ROUNDABOUTS){
  const center={x:ring.x,y:ring.y};
  if(dist(a,center)<ring.outer+225&&segmentDistance(center.x,center.y,[a.x,a.y],[target.x,target.y])<ring.inner+27){
   const angle=Math.atan2(a.y-center.y,a.x-center.x),goal=Math.atan2(target.y-center.y,target.x-center.x);
   const turn=Math.atan2(Math.sin(goal-angle),Math.cos(goal-angle)),next=angle+Math.sign(turn||1)*.42,radius=(ring.outer+ring.inner)/2+14;
   aim={x:center.x+Math.cos(next)*radius,y:center.y+Math.sin(next)*radius};local=true;break;
  }
 }
 if(!local&&pedestrianObstructed(a,target,[])&&clearPath(a,target,true))local=true;
 if(!local){const start=nearestNode(a),end=nearestNode(target);
 if(!a.navVia||a.navVia.end!==end)a.navVia={node:start,end};
 const via=a.navVia.node,circle=ROUNDABOUTS.find(r=>Math.hypot(NODES[via][0]-r.x,NODES[via][1]-r.y)<10);
 const nodePosition={x:NODES[via][0],y:NODES[via][1]},blockedNode=traffic.some(v=>pedestrianTrafficClearance(nodePosition,v)<35);
 if(dist(a,nodePosition)<(circle?circle.outer+34:blockedNode?135:65))a.navVia.node=route(via,end)[1]??end;
 const first=NODES[a.navVia.node];
 aim={x:first[0],y:first[1]};for(const r of ROUNDABOUTS)if(Math.hypot(aim.x-r.x,aim.y-r.y)<r.inner){const angle=Math.atan2(a.y-r.y,a.x-r.x);aim={x:r.x+Math.cos(angle)*(r.outer+r.inner)/2,y:r.y+Math.sin(angle)*(r.outer+r.inner)/2};}}
 if(!followPedestrianDetour(a,aim,speed,dt,traffic,target))steer(a,aim,speed,dt,traffic);
}
export function useSight(g){
 if(!combatReady(g)||!sightAvailable(g)||g.player.sightCooldown>0)return false;
 g.player.sight=RULES.sightDuration;g.player.sightCooldown=RULES.sightCooldown;emit(g,'pulse',g.player.x,g.player.y);g.events.push('sight');
 reveal(g);say(g,'Dark auras reveal enemies. Blue diamonds mark civilians.');return true;
}
export function eatFuchka(g,id=null){return eatAtFuchka(g,id,{inside,clear:clearPath});}
function reveal(g){for(const a of g.actors){a.sightRevealed=enemyIdentified(a,g);}}
export function pauseRun(g,value=true){if(g.story||!['playing','paused'].includes(g.status))return false;g.status=value?'paused':'playing';return true;}
export function dash(g,dx=0,dy=0){
 const p=g.player;if(g.status!=='playing'||g.story||g.cinematic||p.dashCooldown>0)return false;
 if(!dx&&!dy){dx=p.facingX;dy=p.facingY;}const length=Math.hypot(dx,dy)||1;
 p.dashX=dx/length;p.dashY=dy/length;p.dash=.18;p.invulnerable=.4;p.dashCooldown=RULES.dashCooldown;g.events.push('dash');return true;
}
export function currentBoss(g){const boss=BOSSES[Math.min(g.chapter,2)];return g.chapter===1&&g.chapterTarget?{...boss,threshold:g.chapterTarget}:boss;}
export function continueStory(g){const finished=advanceBossStory(g);if(finished){
 if(g.finalMission.state==='farewell'){finishFinalFarewell(g);return true;}
 if(g.chapter===2&&!g.hercules.introComplete){
  if(g.hercules.conversationStarted){finishHerculesIntro(g);say(g,'Hercules is investigating Sohel Rana. Explore Mirpur while he follows his own list and searches for a lead.');}
  else beginHerculesIntro(g,herculesEngineApi(g));
 }else{say(g,`Explore Mirpur. Earn ${Math.max(0,currentBoss(g).threshold-g.points)} more points to reveal ${currentBoss(g).name}.`);if(g.phase==='hunt'&&g.points>=currentBoss(g).threshold)spawnBoss(g);}
 }return finished;}
export function objectivePosition(g){
 if(finalActive(g))return g.finalMission.arrived?finalGroup(g).find(a=>enemyIdentified(a,g))??null:FINAL_RULES.roundabout;
 if(g.phase==='boss'){const b=g.actors.find(a=>a.kind==='boss'&&enemyIdentified(a,g));return b?{x:b.x,y:b.y}:null;}
 const closest=g.actors.filter(a=>!a.owner&&a.kind==='enemy'&&enemyIdentified(a,g)).sort((a,b)=>dist(a,g.player)-dist(b,g.player))[0];
 return closest?{x:closest.x,y:closest.y}:null;
}
export function spawnBoss(g){
 if(g.phase==='boss'||g.story||g.cinematic||g.chapter>=2)return;const b=currentBoss(g),[x,y]=NODES[b.node];
 let spawn={x,y};for(let i=0;i<80;i++){const angle=i*2.4,radius=i?25+Math.floor(i/8)*12:0,p={x:x+Math.cos(angle)*radius,y:y+Math.sin(angle)*radius};if(inside(p.x,p.y)&&(g.traffic??[]).every(v=>pedestrianTrafficClearance(p,v)>=25)){spawn=p;break;}}
 g.actors.push({id:g.nextId++,...spawn,kind:'boss',label:b.name,sprite:b.sprite,hp:b.hp,maxHp:b.hp,known:true,face:1,walk:0,speed:b.speed,aggro:false,windup:0,cooldown:2,flash:0,dead:false});
 g.phase='boss';for(const a of g.actors)if(a.kind==='enemy'){a.aggro=false;a.windup=0;}
 emit(g,'arrival',x,y);g.events.push('boss');say(g,`${b.name} awaits at ${b.district}. Use Sight to locate him.`);
}
function combatTarget(a,kind,g){return !a.dead&&!a.insideHouse&&(a.kind==='boss'||a.kind==='enemy'&&(a.type!==1||a.aggro||enemyIdentified(a,g))||kind==='slap'&&a.specialTaunt&&a.specialSpoken&&!a.specialSlapped);}
function beginMelee(g,p,kind,target){
 const spec=COMBAT_ACTIONS[kind];p.attack=spec.cooldown;p.attackKind=kind;p.attackTime=spec.duration;p.attackDuration=spec.duration;
 const angle=target?Math.atan2(target.y-p.y,target.x-p.x):Math.atan2(p.facingY,p.facingX);
 p.pendingHit={target:target?.id,kind,time:spec.contact,angle};if(target){p.face=(target.x-target.y)-(p.x-p.y)>0?1:-1;p.facingX=Math.cos(angle);p.facingY=Math.sin(angle);}
 if(p.role!=='hercules'||dist(p,g.player)<650)g.events.push('swing');
}
export function attack(g,mode='combo'){
 const p=g.player;if(!combatReady(g)||p.attack>0||!['slap','combo'].includes(mode))return false;
 const kind=mode==='slap'?'slap':p.nextCombo??'punch',spec=COMBAT_ACTIONS[kind];
 if(mode==='combo')p.nextCombo=kind==='punch'?'kick':'punch';
 const target=g.actors.filter(a=>combatTarget(a,kind,g)&&dist(a,p)<=spec.range&&clearPath(a,p)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
 beginMelee(g,p,kind,target);return true;
}
export function useWaterMirror(g){
 const p=g.player;if(!combatReady(g)||!mirrorAvailable(g)||(p.mirrorCooldown??0)>0)return false;
 p.mirrorCooldown=MIRROR_RULES.cooldown;p.mirrorTime=MIRROR_RULES.duration;p.mirrorFade=0;emit(g,'mirror',p.x,p.y);g.events.push('mirror');return true;
}
function beginFlee(g,a,special=false,from=g.player){
 a.fleeTime=7+g.rng()*3;a.hasFled=true;a.aggro=false;a.windup=0;a.attackTime=0;a.cooldown=3;a.wait=0;a.gesture=0;a.fleeNode=null;a.fleeWatch=null;a.navVia=null;a.pedestrianDetour=null;
 a.speech=special?'':ESCAPE_LINES[Math.floor(g.rng()*ESCAPE_LINES.length)];a.speechTime=special?0:3;
 a.fleeFromId=from===g.player?0:from.id;
}
function resolveAttack(g,hit,p=g.player){
 const spec=COMBAT_ACTIONS[hit.kind],target=g.actors.find(a=>a.id===hit.target),independent=p.role==='hercules';
 emit(g,'strike',p.x,p.y,{angle:hit.angle,kind:hit.kind});
 if(!target||target.dead||!(independent?target.finalEnemy||target.owner==='hercules'&&target.type===1:combatTarget(target,hit.kind,g))||dist(target,p)>spec.range||!clearPath(target,p))return;
 target.reaction=.3;target.reactionKind=hit.kind;target.reactionX=Math.cos(hit.angle);target.reactionY=Math.sin(hit.angle);target.stun=spec.stun;target.flash=.14;target.windup=0;target.pendingWeaponHit=null;target.attackTime=0;target.cooldown=Math.max(target.cooldown??0,.65);
 if(!(target.frozenUntil>g.elapsed))move(target,Math.cos(hit.angle)*7,Math.sin(hit.angle)*7,g.traffic);emit(g,'contact',target.x,target.y,{kind:hit.kind});if(!independent||dist(p,g.player)<650)g.events.push('hit');
 if(target.kind==='civilian'){target.specialSlapped=true;beginFlee(g,target,true);return;}
 if(target.finalEnemy){
  const damage=independent&&g.finalMission.state==='rescue'?12:spec.damage;target.hp=Math.max(0,target.hp-damage);target.lastHitBy=independent?'hercules':'pushpo';
  if(target.hp===0){target.dead=true;target.windup=0;target.pendingHit=null;emit(g,'vanish',target.x,target.y);g.events.push('kill');}
  else if(!independent)target.targetId=0;
  updateFinalMission(g,0,herculesEngineApi(g));return true;
 }
 if(independent){
  target.hp=Math.max(0,target.hp-spec.damage);
  if(target.hp===0){target.dead=true;recordHerculesKill(g,target);emit(g,'pocket-note',target.x,target.y);emit(g,'vanish',target.x,target.y);g.events.push('hercules-kill');}
  else if(!target.hasFled)beginFlee(g,target,true,p);
  return;
 }
 p.face=(target.x-target.y)-(p.x-p.y)>0?1:-1;
 target.known=true;
 if(!target.aggro){
  const others=g.actors.filter(a=>!a.dead&&a.aggro&&a!==target).sort((a,b)=>dist(b,p)-dist(a,p));
  while(others.length>=RULES.maxAttackers){const old=others.shift();old.aggro=false;old.windup=0;}
 }
 target.aggro=!(target.fleeTime>0);target.hp=Math.max(0,target.hp-spec.damage);
 emit(g,'number',target.x,target.y-100,{text:`−${spec.damage}`,color:'#ffefbc'});
 if(target.hp>0&&target.type===2&&!target.hasFled&&g.rng()<.38)beginFlee(g,target);
 if(target.hp===0){
  target.dead=true;emit(g,'vanish',target.x,target.y);g.events.push('kill');
  if(target.kind==='boss'){
   const stage=g.chapter;if(stage>1)return true;g.defeated.push(currentBoss(g).name);g.chapter++;
   g.phase=stage===1?'interlude':'hunt';g.remaining=RULES.duration;g.chapterStartPoints=g.points;if(stage===0){g.chapterTarget=g.points+150;g.unlockNotice={text:'WATER MIRROR AWAKENED · 3-second water bubble · 10s cooldown',time:8};}g.events.push('chapter');beginBossStory(g,stage);emit(g,'verdict',target.x,target.y);say(g,stage===1?'Hafizur Rahman defeated. A figure waits around the corner.':`${g.defeated.at(-1)} defeated. Next: ${currentBoss(g).name}. A fresh 15 minutes begins.`);
  }else{
   const reward=TYPES[target.type].points;g.points+=reward;g.kills++;
   if(g.kills===5){g.unlockNotice={text:'SIGHT AWAKENED · five enemies defeated · tap Sight or press E',time:8};g.events.push('unlock');say(g,'Five enemies defeated. Use SIGHT (E) to reveal disguised predators.');}
   emit(g,'number',target.x,target.y-125,{text:`+${reward} points`,color:'#ffda73'});
   if(g.phase==='hunt'&&g.points>=currentBoss(g).threshold)spawnBoss(g);
  }
 }return true;
}
function ambushSpot(g,self){
 const offset=g.rng()*Math.PI*2;
 for(const radius of [190,230,280])for(let i=0;i<24;i++){const angle=offset+i*Math.PI/12,p={x:g.player.x+Math.cos(angle)*radius,y:g.player.y+Math.sin(angle)*radius};
  if(inside(p.x,p.y)&&clearPath(p,g.player)&&(g.traffic??[]).every(v=>pedestrianTrafficClearance(p,v)>=35)&&g.actors.every(a=>a===self||a.dead||a.insideHouse||dist(a,p)>34))return {...p,node:nearestNode(p)};
 }return null;
}
function updateTutorial(g){
 const t=g.tutorial;if(!t||g.phase!=='hunt')return;
 if(!t.guided&&g.elapsed>=12){t.guided=true;const a=g.actors.find(a=>a.id===t.target&&!a.dead);if(a){a.known=true;a.wait=0;say(g,'Someone nearby is preparing to attack. Slap (Q), then Punch & Kick (Space).');}}
 if(g.elapsed>=t.next&&t.ambush<3){const type=t.ambush===0?0:t.ambush===1?2:1;
  if(type===1&&!sightAvailable(g))return;
  const a=g.actors.find(a=>a.kind==='enemy'&&a.type===type&&!a.dead&&!a.aggro&&!(a.fleeTime>0)&&dist(a,g.player)>300),spot=a&&ambushSpot(g,a);
  if(a&&spot){Object.assign(a,spot,{wait:0,navVia:null,pedestrianDetour:null,cooldown:.9,known:type!==1});t.ambush++;t.next=g.elapsed+18;say(g,type===1?'Someone is closing in. Use your awakened Sight.':'Watch the side streets. A sudden attacker is approaching.');}
  else t.next=g.elapsed+3;
 }
}
function updateFlee(g,a,dt){
 if(!(a.fleeTime>0))return false;a.fleeTime=Math.max(0,a.fleeTime-dt);a.aggro=false;a.windup=0;
 const threat=a.fleeFromId?g.actors.find(b=>b.id===a.fleeFromId)??g.player:g.player,start=nearestNode(a),position=a.fleeNode&&{x:NODES[a.fleeNode][0],y:NODES[a.fleeNode][1]};
 a.fleeWatch??={x:a.x,y:a.y,time:0};a.fleeWatch.time+=dt;const stalled=a.fleeWatch.time>1.4&&dist(a,a.fleeWatch)<10;
 if(!position||dist(a,position)<48||stalled){
  const options=LINKS[start].filter(n=>!stalled||n!==a.fleeNode),choices=options.length?options:LINKS[start];
  a.fleeNode=choices.map(n=>({n,score:Math.hypot(NODES[n][0]-threat.x,NODES[n][1]-threat.y)+g.rng()*35})).sort((a,b)=>b.score-a.score)[0].n;
  a.navVia=null;a.pedestrianDetour=null;a.fleeWatch={x:a.x,y:a.y,time:0};
 }else if(dist(a,a.fleeWatch)>20)a.fleeWatch={x:a.x,y:a.y,time:0};
 const [x,y]=NODES[a.fleeNode];navigate(a,{x,y},Math.max(90,a.speed||40),dt,g.traffic);
 if(a.fleeTime===0){a.node=a.fleeNode;a.previous=start;a.wait=.5;a.cooldown=12;a.fleeNode=null;a.navVia=null;a.pedestrianDetour=null;}
 return true;
}
function herculesEngineApi(g){return {
 nodes:NODES,links:LINKS,nearest:nearestNode,route,inside,clear:clearPath,
 murdererHealth:TYPES[0].health,trafficFree:(p,r)=>g.traffic.every(v=>pedestrianTrafficClearance(p,v)>=r),
 free:(p,r)=>inside(p.x,p.y)&&dist(p,g.player)>r&&g.traffic.every(v=>pedestrianTrafficClearance(p,v)>=r)&&g.actors.every(a=>a.dead||!houseCollidable(a)||dist(p,a)>r),
 navigate:(a,p,speed,dt)=>navigate(a,p,speed,dt,g.traffic),
 strike:(h,target,kind='punch')=>beginMelee(g,h,kind,target),resolve:(h,hit)=>resolveAttack(g,hit,h),enemyHit:(a,target,range,damage)=>enemyContact(g,a,target,range,damage),
 spawnCase:h=>{
  for(let i=0;i<16;i++){const p=roadPoint(g.rng,h,180,520,g.traffic);if(g.actors.some(a=>!a.dead&&houseCollidable(a)&&dist(a,p)<34))continue;
   const a=makeActor(g,'enemy',false,1);Object.assign(a,p,{owner:'hercules',caseNumber:++g.hercules.caseNumber,resident:true,known:false,sightRevealed:false,wait:0,aggro:false});g.actors.push(a);return a;
  }return null;
 }
};}
function enemyContact(g,a,target,range,damage){
 const p=target,player=p===g.player;emit(g,a.type===0?'shot':a.type===1?'grab':'impact',a.attackX,a.attackY,{range,fromX:a.x,fromY:a.y});
 const connects=dist(p,{x:a.attackX,y:a.attackY})<range&&clearPath(a,p);if(!connects)return false;
 if(player)useWaterMirror(g);
 const blocked=player?p.mirrorTime>0:p.guardTime>0;
 if(blocked){emit(g,'deflect',p.x,p.y);g.events.push('block');return false;}
 if(p.invulnerable>0)return false;
 p.hp=Math.max(0,p.hp-damage);p.invulnerable=.65;p.flash=.2;
 if(!player){p.pendingHit=null;p.stun=.18;p.reaction=.3;}
 emit(g,'number',p.x,p.y-100,{text:`−${damage}`,color:'#ff8b75'});g.events.push('hurt');
 if(p.hp===0){if(player){g.status='lost';g.reason='Pushpo’s golden life force was exhausted.';if(finalActive(g))g.finalMission.state='failed';g.events.push('lose');}else failFinalMission(g,'Hercules fell while fighting Sohel Rana’s group.');}
 return true;
}
export function update(g,elapsed,input={x:0,y:0}){
 if(g.status!=='playing'||g.story)return;
 if(g.cinematic){crowdNeighbors(g.actors,g.player);updateHercules(g,Math.min(elapsed,.06),herculesEngineApi(g));separateCrowd(g.actors,(a,dx,dy)=>{if(a.role==='hercules')move(a,dx,dy,g.traffic);});return;}
 if(g.chapter===2&&!g.hercules.introStarted&&!finalMissionReady(g)){beginHerculesIntro(g,herculesEngineApi(g));if(g.cinematic)return;}
 updateMetro(g,elapsed);if(chapterClockActive(g))g.remaining=Math.max(0,g.remaining-elapsed);g.elapsed+=elapsed;g.finalStep=elapsed;
 if(chapterClockActive(g)&&g.remaining<=0){g.status='lost';g.reason=`Time ran out before you defeated ${currentBoss(g).name}.`;g.events.push('lose');return;}
 const dt=Math.min(elapsed,.06),p=g.player;
 for(const key of ['attack','attackTime','sight','sightCooldown','dashCooldown','invulnerable','flash'])p[key]=Math.max(0,(p[key]||0)-dt);
 p.mirrorCooldown=Math.max(0,(p.mirrorCooldown??0)-elapsed);
 const shieldBefore=p.mirrorTime??0;p.mirrorTime=Math.max(0,shieldBefore-elapsed);
 p.mirrorFade=Math.max(0,(p.mirrorFade??0)-elapsed);if(shieldBefore>0&&p.mirrorTime===0){p.mirrorFade=Math.max(0,MIRROR_RULES.dissolve-(elapsed-shieldBefore));emit(g,'mirror-expire',p.x,p.y);}
 if(g.unlockNotice)g.unlockNotice.time=Math.max(0,g.unlockNotice.time-dt);
 g.messageTime=Math.max(0,g.messageTime-dt);
 let dx=input.x||0,dy=input.y||0,length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}if(length){p.facingX=dx;p.facingY=dy;}
 const previous={x:p.x,y:p.y};
 if(p.dash>0){p.dash-=dt;move(p,p.dashX*760*dt,p.dashY*760*dt,g.traffic);emit(g,'trail',p.x,p.y);}else move(p,dx*RULES.moveSpeed*dt,dy*RULES.moveSpeed*dt,g.traffic);
 p.moving=dist(p,previous)>.01;p.walk+=p.moving?dt*11:0;reveal(g);
 updateFinalMission(g,elapsed,herculesEngineApi(g));if(g.status!=='playing'||g.story)return;
 if(p.pendingHit){p.pendingHit.time-=dt;if(p.pendingHit.time<=0){const hit=p.pendingHit;p.pendingHit=null;resolveAttack(g,hit);if(g.status!=='playing'||g.story)return;}}
 if(input.attack)attack(g);if(g.status!=='playing'||g.story)return;
 updateTutorial(g);
 crowdNeighbors(g.actors,p);for(const id of Object.keys(g.houseDoors??{}))g.houseDoors[id]=Math.max(0,g.houseDoors[id]-dt);
 updateHercules(g,dt,herculesEngineApi(g));
 if(g.status!=='playing'||g.story)return;
 let engaged=g.actors.filter(a=>!a.dead&&['enemy','boss'].includes(a.kind)&&a.aggro).length;
 for(const a of g.actors){
  if(a.dead||a.role==='hercules')continue;a.moving=false;a.attackTime=Math.max(0,(a.attackTime||0)-(a.frozenUntil>g.elapsed?0:dt));a.reaction=Math.max(0,(a.reaction??0)-dt);a.stun=Math.max(0,(a.stun??0)-dt);a.speechTime=Math.max(0,(a.speechTime||0)-dt);if(!a.activity&&a.speechTime<=0)a.speech='';a.flash=Math.max(0,a.flash-dt);a.cooldown=Math.max(0,a.cooldown-dt);const d=dist(a,p),hiddenRapist=a.kind==='enemy'&&a.type===1&&!enemyIdentified(a,g),allowed=!a.owner&&(a.kind==='boss'||g.phase==='hunt'||g.phase==='interlude');
  if(a.frozenUntil>g.elapsed||a.stun>0)continue;
  if(updateFinalEnemy(g,a,dt,herculesEngineApi(g))){if(g.status!=='playing')return;continue;}
  if(updateFlee(g,a,dt))continue;
  if(a.specialTaunt&&a.speechTime<=0)a.gesture=0;
  if(a.specialTaunt&&!a.specialSpoken&&!a.specialSlapped&&d<145&&clearPath(a,p)){a.specialSpoken=true;a.speech=SPECIAL_LINE;a.speechTime=4;a.gesture=.6;a.wait=4;}
  if(a.kind==='enemy'&&a.type===0){a.murderLine??=MURDERER_LINES[Math.floor(g.rng()*3)];a.murderAway=d>650?(a.murderAway??0)+dt:0;if(a.murderAway>8)a.murderSpoken=false;
   if(allowed&&!a.murderSpoken&&d<245&&g.elapsed>4&&clearPath(a,p)){a.murderSpoken=true;a.speech=a.murderLine;a.speechTime=4;}}
  if(hiddenRapist){a.aggro=false;a.windup=0;}
  if(a.kind==='enemy'&&a.type===1){
   a.encounterAway=d>650?(a.encounterAway??0)+dt:0;if(a.encounterAway>8)a.encounterSpoken=false;
   if(!hiddenRapist&&allowed&&!a.encounterSpoken&&d<190&&g.elapsed>4&&clearPath(a,p)){a.encounterSpoken=true;a.speech=RAPIST_APPROACH_LINE;a.speechTime=6;g.message=RAPIST_APPROACH_LINE;g.messageTime=6;}
  }
  if(updateHouseVisit(g,a,dt,navigate,(point,self)=>inside(point.x,point.y)&&dist(point,g.player)>=32&&g.traffic.every(v=>pedestrianTrafficClearance(point,v)>=28)&&g.actors.every(b=>b===self||b.dead||!houseCollidable(b)||dist(point,b)>=28)))continue;
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
   if(!a.stallId||a.speechTime<=0)a.speech=cycle>.9&&cycle<3.8?a.lines[Math.floor(a.activityClock/16)%a.lines.length]:'';
   // Customers step aside and return to the counter; vendors stay at their stalls.
   const takingBreak=a.activity==='customer'&&cycle>8&&cycle<12;
   const aim={x:a.homeX+(takingBreak?34:0),y:a.homeY+(takingBreak?15:0)};
   if(dist(a,aim)>3&&clearPath(a,aim)){if(!followPedestrianDetour(a,aim,a.speed,dt,g.traffic))steer(a,aim,a.speed,dt,g.traffic);}
   else if(partner){a.velocityX=partner.x-a.x;a.velocityY=partner.y-a.y;}
   continue;
  }
  if(a.kind!=='civilian'&&!hiddenRapist&&allowed&&!a.aggro&&d<(a.kind==='boss'?520:a.type===0?260:155)&&engaged<RULES.maxAttackers&&g.elapsed>4&&(!a.tutorialGuard||g.elapsed>=12)&&clearPath(a,p)){a.aggro=true;a.known=true;engaged++;}
  if(a.windup>0){
   a.windup-=dt;a.moving=false;if(a.windup<=0){
    a.attackTime=.3;a.attackDuration=.3;a.attackKind=a.type===1?'slap':'punch';a.face=(p.x-p.y)-(a.x-a.y)>0?1:-1;
    const range=a.kind==='boss'?currentBoss(g).range:a.type===0?28:52;enemyContact(g,a,p,range,a.kind==='boss'?currentBoss(g).damage:TYPES[a.type].damage);if(g.status!=='playing')return;a.cooldown=a.kind==='boss'?1.6:1.9;
   }continue;
  }
  if(a.aggro){
   if(d<(a.kind==='boss'?currentBoss(g).range:a.type===0?235:62)&&a.cooldown<=0){a.windup=a.kind==='boss'?1:a.type===0?.85:.75;a.windupMax=a.windup;a.attackX=p.x;a.attackY=p.y;a.moving=false;a.face=(p.x-p.y)-(a.x-a.y)>0?1:-1;if(a.type===2){a.speech=SNATCHER_TAUNT;a.speechTime=3.2;}}
   else if(d>42)navigate(a,p,a.speed,dt,g.traffic);
   if(d>700&&a.kind!=='boss'){a.aggro=false;engaged--;a.node=nearestNode(a);}
  }else if(a.kind==='boss')a.moving=false;
  else{
   a.aiClock=(a.aiClock||0)+dt;if(d>1100&&a.aiClock<.2)continue;const wanderDt=d>1100?a.aiClock:dt;a.aiClock=0;
   a.wait-=wanderDt;if(a.wait>0){a.moving=false;continue;}
   a.routeWatch??={x:a.x,y:a.y,time:0};a.routeWatch.time+=wanderDt;
   if(dist(a,a.routeWatch)>20)a.routeWatch={x:a.x,y:a.y,time:0};
   else if(a.routeWatch.time>5){
    // A blocked lane should cause a real turn back, never a teleport or a permanent queue.
    const old=a.node;a.node=a.previous??nearestNode(a);a.previous=old;a.navVia=null;a.pedestrianDetour=null;a.wait=.25;a.routeWatch={x:a.x,y:a.y,time:0};a.routeRetries=(a.routeRetries??0)+1;
   }
   const dest=NODES[a.node??nearestNode(a)];let target={x:dest[0]+22,y:dest[1]+18};for(const ring of ROUNDABOUTS)if(Math.hypot(dest[0]-ring.x,dest[1]-ring.y)<10){const radius=(ring.outer+ring.inner)/2;target={x:ring.x+radius*.94,y:ring.y+radius*.34};}
   const blockedWaypoint=(g.traffic??[]).some(v=>pedestrianTrafficClearance(target,v)<35);
   if(dist(a,target)<(blockedWaypoint?135:35)){const options=LINKS[a.node].filter(n=>n!==a.previous),choices=options.length?options:LINKS[a.node];a.previous=a.node;a.node=choices.map(node=>({node,cost:g.rng()+g.actors.filter(b=>!b.dead&&!b.activity&&b.node===node).length*.22})).sort((a,b)=>a.cost-b.cost)[0].node;a.wait=.2+g.rng()*1.8;a.pedestrianDetour=null;}
   else navigate(a,target,a.kind==='civilian'?a.speed:hiddenRapist?a.wanderSpeed:32,wanderDt,g.traffic);
  }
 }
 g.spawnClock-=dt;
 if(['hunt','interlude'].includes(g.phase)&&g.spawnClock<=0){
  g.spawnClock=3.5;
  for(const a of g.actors)if(!a.dead&&!a.owner&&a.kind!=='ally'&&a.kind!=='boss'&&!a.activity&&!a.resident&&!a.homeless&&!(a.fleeTime>0)&&dist(a,p)>1550){const pos=roadPoint(g.rng,p,650,1100,g.traffic);Object.assign(a,pos,{aggro:false,windup:0,known:false,sightRevealed:false,pedestrianDetour:null,navVia:null,routeWatch:null,encounterSpoken:false,encounterAway:0});}
  if(g.actors.filter(a=>a.kind==='enemy'&&!a.owner&&!a.dead).length<RULES.maxEnemies){const firstRapist=sightAvailable(g)&&!g.tutorial.rapistIntroduced;g.actors.push(makeActor(g,'enemy',true,firstRapist?1:null));if(firstRapist)g.tutorial.rapistIntroduced=true;}
 }
 separateCrowd(g.actors,(a,dx,dy)=>{if(!(a.frozenUntil>g.elapsed))move(a,dx,dy,g.traffic);});updateTraffic(g,dt,NODES,ROADS,inside);
 for(const e of g.effects)e.age+=dt;g.effects=g.effects.filter(e=>e.age<(e.type==='freeze'?3:e.type==='pocket-note'?8:e.type==='number'?1.2:e.type==='pulse'?1.5:.6));
 g.actors=g.actors.filter(a=>!a.dead||a.kind==='boss');
}
export function formatTime(t){t=Math.ceil(Math.max(0,t));return`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;}
