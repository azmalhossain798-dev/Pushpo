export const HOUSE_PORTALS=[
 {id:'tea-residence',x:1300,y:1309,approach:{x:1312,y:1346}},
 {id:'pharmacy-residence',x:2079,y:1292,approach:{x:2083,y:1339}},
 {id:'apartments',x:1491,y:2558,approach:{x:1509,y:2641}}
];
export function assignHouseVisits(g){
 const residents=g.actors.filter(a=>a.resident&&!a.homeless).slice(0,9);
 residents.forEach((a,i)=>{a.homeId=HOUSE_PORTALS[i%HOUSE_PORTALS.length].id;a.homePhase='roam';a.homeClock=22+i*13;});g.houseDoors={};g.houseLocks={};
}
export function houseVisible(a){return !a.insideHouse;}
export function houseCollidable(a){return !a.insideHouse&&!['entering','exiting'].includes(a.homePhase);}
export function updateHouseVisit(g,a,dt,navigate,free){
 if(!a.homeId)return false;const h=HOUSE_PORTALS.find(h=>h.id===a.homeId);a.homeClock-=dt;
 if(a.homePhase==='roam'){if(a.homeClock>0)return false;a.homePhase='approach';a.pedestrianDetour=null;}
 if(a.homePhase==='approach'){
  const distance=Math.hypot(a.x-h.approach.x,a.y-h.approach.y);
  if(distance>12){navigate(a,h.approach,a.speed,dt,g.traffic);return true;}
  if((g.houseLocks[h.id]&&g.houseLocks[h.id]!==a.id)||!free(h.approach,a)){a.moving=false;return true;}
  g.houseLocks[h.id]=a.id;a.homePhase='entering';a.homeProgress=0;a.homeStart={x:a.x,y:a.y};g.houseDoors[h.id]=1.5;
 }
 if(a.homePhase==='indoors'){
  a.moving=false;if(a.homeClock>0||g.houseLocks[h.id]||!free(h.approach,a))return true;
  g.houseLocks[h.id]=a.id;a.homePhase='exiting';a.homeProgress=0;a.insideHouse=false;g.houseDoors[h.id]=1.5;
 }
 if(a.homePhase==='entering'||a.homePhase==='exiting'){
  const entering=a.homePhase==='entering';a.homeProgress=Math.min(1,a.homeProgress+dt/1.25);const t=a.homeProgress,start=entering?a.homeStart:h,end=entering?h:h.approach;
  a.velocityX=end.x-start.x;a.velocityY=end.y-start.y;a.face=a.velocityX-a.velocityY>0?1:-1;
  a.x=start.x+(end.x-start.x)*t;a.y=start.y+(end.y-start.y)*t;a.walk+=dt*8;a.moving=true;a.houseAlpha=entering?1-Math.max(0,(t-.55)/.45):Math.min(1,t/.5);
  if(t===1){delete g.houseLocks[h.id];a.houseAlpha=1;a.moving=false;a.pedestrianDetour=null;
   if(entering){a.homePhase='indoors';a.insideHouse=true;a.homeClock=12+g.rng()*24;}
   else{a.homePhase='roam';a.homeClock=65+g.rng()*75;a.wait=.3;}
  }return true;
 }return false;
}
