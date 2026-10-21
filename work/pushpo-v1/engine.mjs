export const RULES = Object.freeze({
  duration: 900, targetHealth: 150, targetPoints: 15, unlockPoints: 150,
  playerHealth: 100, attackDamage: 30, attackRange: 76, attackCooldown: .42,
  moveSpeed: 185, sightRange: 430, sightDuration: 4, sightCooldown: 7,
  dashCooldown: 2.2, bossHealth: 450
});
export const WORLD = {width:1672,height:941};
export const WALK = [[470,240],[1040,230],[1390,455],[1465,555],[1120,740],[1020,845],[730,845],[560,750],[305,670],[230,550],[425,380]];
export function inside(x,y) {
  let yes=false;
  for(let i=0,j=WALK.length-1;i<WALK.length;j=i++){
    const a=WALK[i],b=WALK[j];
    if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;
  }
  return yes;
}
export function random(seed) {
  let a=seed>>>0;
  return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function point(rng) {
  for(let i=0;i<10000;i++){const x=260+rng()*1160,y=250+rng()*560;if(inside(x,y))return{x,y};}
  return{x:840,y:500};
}
export function createRun(seed=Date.now()) {
  const rng=random(seed), actors=[];
  for(let i=0;i<36;i++) {
    let p=point(rng);
    for(let n=0;n<100&&(Math.hypot(p.x-830,p.y-575)<145||actors.some(a=>distance(a,p)<43));n++)p=point(rng);
    actors.push({id:i,...p,kind:i<14?'enemy':'civilian',hp:150,maxHp:150,known:false,
      variant:Math.floor(rng()*6),walk:0,face:rng()>.5?1:-1,speed:25+rng()*18,
      destination:point(rng),wait:rng()*3,aggro:false,windup:0,cooldown:.8+rng()*2,
      attackX:0,attackY:0,flash:0,dead:false});
  }
  return{seed,rng,actors,player:{x:830,y:575,hp:100,face:1,walk:0,attack:0,sight:0,
    sightCooldown:0,dash:0,dashCooldown:0,invulnerable:0,flash:0,facingX:0,facingY:1},
    remaining:900,elapsed:0,points:0,kills:0,status:'playing',bossSpawned:false,
    events:[],effects:[],message:'Press E or SIGHT to reveal the crowd.',messageTime:6};
}
function say(g,text){g.message=text;g.messageTime=4.5;}
function effect(g,type,x,y,extra={}){g.effects.push({type,x,y,age:0,...extra});}
function event(g,type){g.events.push(type);}
function move(a,dx,dy){
  if(inside(a.x+dx,a.y))a.x+=dx;
  if(inside(a.x,a.y+dy))a.y+=dy;
  if(Math.abs(dx)>.1)a.face=dx>0?1:-1;
}
export function useSight(g){
  if(g.status!=='playing'||g.player.sightCooldown>0)return false;
  g.player.sight=RULES.sightDuration;g.player.sightCooldown=RULES.sightCooldown;
  effect(g,'pulse',g.player.x,g.player.y);event(g,'sight');say(g,'Golden sight reveals those hiding in the crowd.');
  reveal(g);return true;
}
function reveal(g){
  for(const a of g.actors)if(!a.dead&&distance(a,g.player)<RULES.sightRange)a.known=true;
}
export function dash(g,dx=0,dy=0){
  const p=g.player;if(g.status!=='playing'||p.dashCooldown>0)return false;
  if(!dx&&!dy){dx=p.facingX;dy=p.facingY;}
  const len=Math.hypot(dx,dy)||1;p.dashX=dx/len;p.dashY=dy/len;
  p.dash=.18;p.invulnerable=.3;p.dashCooldown=RULES.dashCooldown;event(g,'dash');return true;
}
export function attack(g){
  const p=g.player;
  if(g.status!=='playing'||p.attack>0)return false;
  p.attack=RULES.attackCooldown;
  const target=g.actors.filter(a=>!a.dead&&a.kind!=='civilian'&&(a.known||a.aggro)&&distance(a,p)<=RULES.attackRange)
    .sort((a,b)=>distance(a,p)-distance(b,p))[0];
  const angle=target?Math.atan2(target.y-p.y,target.x-p.x):Math.atan2(p.facingY,p.facingX);
  effect(g,'slash',p.x,p.y,{angle});event(g,'swing');
  if(!target)return true;
  target.known=true;target.aggro=true;target.hp=Math.max(0,target.hp-RULES.attackDamage);target.flash=.15;
  if(target.kind!=='boss')target.windup=0;
  effect(g,'number',target.x,target.y-58,{text:'−30',color:'#ffe7a5'});event(g,'hit');
  const d=Math.max(1,distance(p,target));move(target,(target.x-p.x)/d*10,(target.y-p.y)/d*10);
  if(target.hp===0){
    target.dead=true;effect(g,'vanish',target.x,target.y,{boss:target.kind==='boss'});
    if(target.kind==='boss'){g.status='won';say(g,'Sumon Mia has fallen. Your first chapter is complete.');event(g,'win');return true;}
    g.points+=RULES.targetPoints;g.kills++;p.hp=Math.min(RULES.playerHealth,p.hp+12);
    effect(g,'number',target.x,target.y-78,{text:'+15 points',color:'#f7cd75'});event(g,'kill');
    if(g.points>=RULES.unlockPoints&&!g.bossSpawned)spawnBoss(g);
  }
  return true;
}
function spawnBoss(g){
  g.bossSpawned=true;
  const pos={x:850,y:300};
  g.actors.push({id:99,...pos,kind:'boss',hp:RULES.bossHealth,maxHp:RULES.bossHealth,
    known:true,variant:6,walk:0,face:1,speed:100,wait:0,aggro:true,windup:0,cooldown:2,
    attackX:0,attackY:0,flash:0,dead:false});
  say(g,'SUMON MIA HAS ARRIVED. Defeat him before your time runs out.');
  effect(g,'arrival',pos.x,pos.y);event(g,'boss');
}
export function update(g,dt,input={x:0,y:0,attack:false}){
  if(g.status!=='playing')return;
  g.remaining=Math.max(0,g.remaining-dt);g.elapsed+=dt;
  if(g.remaining===0){g.status='lost';g.reason='The golden life force has faded.';event(g,'lose');return;}
  // Time is real; physics is bounded after an unusually long browser frame.
  dt=Math.min(dt,.08);
  const p=g.player;
  for(const k of ['attack','sight','sightCooldown','dashCooldown','invulnerable','flash'])p[k]=Math.max(0,p[k]-dt);
  g.messageTime=Math.max(0,g.messageTime-dt);
  let dx=input.x||0,dy=input.y||0;const len=Math.hypot(dx,dy);
  if(len>1){dx/=len;dy/=len;}
  if(len){p.facingX=dx;p.facingY=dy;}
  if(p.dash>0){p.dash-=dt;move(p,p.dashX*660*dt,p.dashY*660*dt);effect(g,'trail',p.x,p.y);}
  else move(p,dx*RULES.moveSpeed*dt,dy*RULES.moveSpeed*dt);
  p.moving=!!len;p.walk+=len?dt*12:0;
  if(p.sight>0)reveal(g);
  if(input.attack)attack(g);
  for(const a of g.actors){
    if(a.dead)continue;
    a.flash=Math.max(0,a.flash-dt);a.cooldown=Math.max(0,a.cooldown-dt);
    const d=distance(a,p);
    if(a.kind!=='civilian'&&d<105&&g.elapsed>3){a.aggro=true;a.known=true;}
    if(a.windup>0){
      a.windup-=dt;a.moving=false;
      if(a.windup<=0){
        effect(g,'impact',a.attackX,a.attackY,{boss:a.kind==='boss'});
        const range=a.kind==='boss'?100:49;
        if(Math.hypot(p.x-a.attackX,p.y-a.attackY)<range&&p.invulnerable<=0){
          const damage=a.kind==='boss'?18:9;p.hp=Math.max(0,p.hp-damage);p.invulnerable=.45;p.flash=.22;
          effect(g,'number',p.x,p.y-60,{text:`−${damage}`,color:'#ff887d'});event(g,'hurt');
          if(p.hp===0){g.status='lost';g.reason='Pushpo’s life force was exhausted.';event(g,'lose');return;}
        }
        a.cooldown=a.kind==='boss'?1.45:1.5;
      }
      continue;
    }
    if(a.aggro){
      if(d<(a.kind==='boss'?100:53)&&a.cooldown<=0){
        a.windup=a.kind==='boss'?.9:.65;a.windupMax=a.windup;a.attackX=p.x;a.attackY=p.y;a.moving=false;event(g,'warning');
      } else if(d>38){
        move(a,(p.x-a.x)/d*(a.kind==='boss'?105:80)*dt,(p.y-a.y)/d*(a.kind==='boss'?105:80)*dt);
        a.moving=true;a.walk+=dt*10;
      }
      if(a.kind!=='boss'&&d>380)a.aggro=false;
    }else{
      a.wait-=dt;
      if(a.wait>0){a.moving=false;continue;}
      const goal=a.destination,delta=distance(a,goal);
      if(delta<15){a.destination=point(g.rng);a.wait=1+g.rng()*3;a.moving=false;}
      else{move(a,(goal.x-a.x)/delta*a.speed*dt,(goal.y-a.y)/delta*a.speed*dt);a.walk+=dt*6;a.moving=true;}
    }
  }
  // Soft separation keeps walking crowds and pursuing enemies readable.
  const live=g.actors.filter(a=>!a.dead);
  for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
    const a=live[i],b=live[j],d=distance(a,b);
    if(d>0&&d<25){const push=(25-d)*.035;move(a,(a.x-b.x)/d*push,(a.y-b.y)/d*push);move(b,(b.x-a.x)/d*push,(b.y-a.y)/d*push);}
  }
  for(const e of g.effects)e.age+=dt;
  g.effects=g.effects.filter(e=>e.age<(e.type==='number'?1.2:e.type==='pulse'?1.4:.65));
}
export function formatTime(seconds){const t=Math.ceil(Math.max(0,seconds));return`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;}
