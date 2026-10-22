import {METRO_LINE} from './scene-v3.mjs';
export const CITY_POPULATION=180;
export const SNATCHER_TAUNT='এই শুয়োরের বাচ্চা, যা আছে দে কইলাম';
export function enemyIdentified(a,g){return !!g&&g.kills>=5&&g.player.sight>0&&!a.dead&&['enemy','boss'].includes(a.kind)&&Math.hypot(a.x-g.player.x,a.y-g.player.y)<580;}
export function actorArtwork(a,back=false,identified=false){
 if(a.role==='hercules')return {key:'hercules',index:back?1:0};
 if(a.finalRole==='companion')return {key:'companions',index:(a.variant-1)+(back?2:0)};
 if(a.homeless)return {key:'people',index:3+(back?4:0)};
 if(a.kind==='enemy'&&!identified)return {key:back?'backs':'characters',index:a.coverSprite??(a.type===1?a.sprite:1)};
 if(a.kind==='enemy'&&a.type===2)return {key:'people',index:(a.variant??0)%3+(back?4:0)};
 if(a.kind==='boss')return {key:back?'backs':'bosses',index:a.sprite+(back?7:0)};
 return {key:back?'backs':'characters',index:a.sprite??0};
}
function nextMetroGap(rng){return METRO_LINE.minGap+rng()*(METRO_LINE.maxGap-METRO_LINE.minGap);}
export function createMetro(rng){return {active:false,wait:nextMetroGap(rng),travel:0,progress:0,direction:1,passes:0,lastStart:null,lastEnd:null,clock:0};}
export function metroPosition(m){
 const {from,to}=METRO_LINE,distance=Math.hypot(to.x-from.x,to.y-from.y),overshoot=680/distance;
 let t=-overshoot+m.progress*(1+2*overshoot);if(m.direction<0)t=1-t;
 return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};
}
export function updateMetro(g,elapsed){
 const m=g.metro;if(!m)return;let left=Math.max(0,elapsed);
 // Consume phase boundaries exactly, even after a slow frame; game pause never calls this.
 while(left>1e-9){
  if(!m.active){
   const used=Math.min(left,m.wait);m.wait-=used;m.clock+=used;left-=used;
   if(m.wait>1e-9)break;
   m.active=true;m.travel=0;m.progress=0;m.passes++;m.lastStart=m.clock;
   m.direction=g.rng()>.5?1:-1;g.events?.push('metro');
  }else{
   const length=METRO_LINE.travelSeconds+METRO_LINE.dwellSeconds,used=Math.min(left,length-m.travel);
   m.travel+=used;m.clock+=used;left-=used;
   const distance=Math.hypot(METRO_LINE.to.x-METRO_LINE.from.x,METRO_LINE.to.y-METRO_LINE.from.y),overshoot=680/distance;
   const stationProgress=(METRO_LINE.station+overshoot)/(1+2*overshoot);
   const stop=METRO_LINE.travelSeconds*(m.direction>0?stationProgress:1-stationProgress);
   const moving=m.travel<=stop?m.travel:m.travel<=stop+METRO_LINE.dwellSeconds?stop:m.travel-METRO_LINE.dwellSeconds;
   m.progress=Math.min(1,moving/METRO_LINE.travelSeconds);
   if(m.travel>=length-1e-9){m.active=false;m.lastEnd=m.clock;m.wait=nextMetroGap(g.rng);}
  }
 }
}
export function separateCrowd(actors,moveActor){
 const visible=actors.filter(a=>!a.dead&&!a.insideHouse&&!['entering','exiting'].includes(a.homePhase)),cell=40;
 for(let pass=0;pass<4;pass++){const buckets=new Map();
 for(const a of visible){const key=`${Math.floor(a.x/cell)},${Math.floor(a.y/cell)}`;
  const group=buckets.get(key);if(group)group.push(a);else buckets.set(key,[a]);
 }
 for(const a of visible){const gx=Math.floor(a.x/cell),gy=Math.floor(a.y/cell);
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const b of buckets.get(`${gx+dx},${gy+dy}`)??[]){
   if(b.id<=a.id)continue;const distance=Math.hypot(a.x-b.x,a.y-b.y);
   if(distance<28){const angle=(a.id*2.4+b.id)*.9,ux=distance?(a.x-b.x)/distance:Math.cos(angle),uy=distance?(a.y-b.y)/distance:Math.sin(angle),push=(28-distance+.05)*(a.activity||b.activity?1:.5);
    if(!a.activity)moveActor(a,ux*push,uy*push);
    if(!b.activity)moveActor(b,-ux*push,-uy*push);
   }
  }
 }}
}
export function crowdNeighbors(actors,player){
 const people=[{...player,id:0},...actors.filter(a=>!a.dead&&!a.insideHouse&&!['entering','exiting'].includes(a.homePhase))],buckets=new Map(),cell=64;
 for(const a of people){const key=`${Math.floor(a.x/cell)},${Math.floor(a.y/cell)}`;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(a);}
 for(const a of actors){const x=Math.floor(a.x/cell),y=Math.floor(a.y/cell),near=[];
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const b of buckets.get(`${x+dx},${y+dy}`)??[])if(b.id!==a.id&&Math.hypot(a.x-b.x,a.y-b.y)<58)near.push({id:b.id,x:b.x,y:b.y});a.nearby=near;
 }
}
