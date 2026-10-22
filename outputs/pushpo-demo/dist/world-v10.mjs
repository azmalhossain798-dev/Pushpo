import {FUCHKA_STALLS} from './scene-v3.mjs';
import {combatReady} from './combat-v7.mjs';
export const WORLD_RULES=Object.freeze({mealFraction:.2,mealRange:96,phaseSeconds:210,transitionSeconds:24,maxLightPools:24});
export function daylightAt(elapsed=0){
 const phaseSeconds=WORLD_RULES.phaseSeconds,cycle=phaseSeconds*2,time=((elapsed%cycle)+cycle)%cycle,isNight=time>=phaseSeconds,local=time%phaseSeconds;
 const t=Math.max(0,Math.min(1,(local-(phaseSeconds-WORLD_RULES.transitionSeconds))/WORLD_RULES.transitionSeconds)),fade=t*t*(3-2*t),night=isNight?1-fade:fade;
 const skyDay=[181,207,196],skyNight=[20,34,61],sky='#'+skyDay.map((v,i)=>Math.round(v+(skyNight[i]-v)*night).toString(16).padStart(2,'0')).join('');
 return {phase:isNight?'night':'day',label:t>0?(isNight?'DAWN':'DUSK'):(isNight?'NIGHT':'DAY'),night,sunlight:1-night,sky,sunX:(isNight?1:Math.cos(local/phaseSeconds*Math.PI))*(1-night),remaining:phaseSeconds-local};
}
export function initFuchka(g){
 const existing=new Map();
 for(const a of g.actors.filter(a=>a.activity==='fuchka'||a.stallId)){
  if(FUCHKA_STALLS.some(s=>s.id===a.stallId)&&!existing.has(a.stallId))existing.set(a.stallId,a);
  else{a.activity=null;a.stallId=null;a.spotId=null;a.speech='';a.speechTime=0;}
 }
 const vendors=g.actors.filter(a=>a.kind==='civilian'&&a.resident&&!a.activity&&!a.homeId&&!a.homeless&&!a.specialTaunt).slice(-FUCHKA_STALLS.length);
 const previous=g.fuchka?.shops??[];g.fuchka={shops:[]};
 FUCHKA_STALLS.forEach((s,i)=>{
  const a=existing.get(s.id)??vendors.shift();if(!a)return;
  Object.assign(a,s.vendor,{activity:'fuchka',stallId:s.id,spotId:s.id,sprite:[6,5,2][i],vendorStyle:i,homeX:s.vendor.x,homeY:s.vendor.y,activityClock:i*2,activityPhase:i*3,gesture:0,wait:0,speech:'',speechTime:0,lines:['ফুচকা খাবেন?','পুষ্পোর প্রিয় ফুচকা!'],speed:38,moving:false});
  g.fuchka.shops.push({id:s.id,vendorId:a.id,used:previous.find(p=>p.id===s.id)?.used??false});
 });
}
export function nearbyFuchka(g,clear=()=>true){
 const p=g.player;let result=null,best=WORLD_RULES.mealRange;
 for(const shop of g.fuchka?.shops??[]){
  const vendor=g.actors.find(a=>a.id===shop.vendorId&&!a.dead&&!a.insideHouse);if(!vendor)continue;
  const d=Math.hypot(p.x-vendor.x,p.y-vendor.y);if(d<=best&&clear(p,vendor)){best=d;result={...shop,stall:FUCHKA_STALLS.find(s=>s.id===shop.id),vendor};}
 }return result;
}
export function canEatFuchka(g,shop){return combatReady(g)&&(g.player.attackTime??0)<=0&&!(g.player.dash>0)&&!!shop&&!shop.used&&g.player.hp<g.player.maxHp;}
export function eatAtFuchka(g,id,api){
 if(!combatReady(g)||g.player.attackTime>0||g.player.dash>0||!api.inside(g.player.x,g.player.y))return false;
 const nearby=nearbyFuchka(g,api.clear);if(!nearby||id&&id!==nearby.id)return false;
 const shop=g.fuchka.shops.find(s=>s.id===nearby.id),p=g.player;if(shop.used)return false;
 const max=p.maxHp;if(!(max>0)||!Number.isFinite(max)||p.hp>=max)return false;
 const recovered=Math.min(max*WORLD_RULES.mealFraction,max-p.hp);p.hp=Math.min(max,p.hp+recovered);shop.used=true;
 g.lastMeal={stallId:shop.id,recovered,at:g.elapsed};g.events.push('eat');
 g.effects.push({type:'number',x:p.x,y:p.y-100,age:0,text:`+${Number(recovered.toFixed(2))} health`,color:'#9ef0ac'});
 g.message=`Pushpo’s favourite fuchka! +${Number(recovered.toFixed(2))} health · ${nearby.stall.name} · one meal per shopkeeper.`;g.messageTime=6;
 nearby.vendor.speech='আরও ভালো থাকুন, পুষ্পো!';nearby.vendor.speechTime=4;nearby.vendor.gesture=.6;
 return true;
}
