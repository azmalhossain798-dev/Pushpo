export const COMBAT_ACTIONS=Object.freeze({
 slap:{duration:.46,contact:.19,cooldown:.5,damage:18,range:88,stun:.3},
 punch:{duration:.42,contact:.17,cooldown:.46,damage:35,range:88,stun:.28},
 kick:{duration:.59,contact:.28,cooldown:.64,damage:35,range:104,stun:.38}
});
export const MURDERER_LINES=['আয় তোর সান্ডে মান্ডে ক্লোজ করি','আমি সুলতান','আয় তোরে চিল মাইরা দেই'];
export const ESCAPE_LINES=['খানকি','মাগী'];
export const SPECIAL_LINE='ঐ বোরখা কৈ';
export const MIRROR_RULES=Object.freeze({cooldown:10,duration:3,dissolve:.45});
export function sightAvailable(g){return g.kills>=5;}
export function mirrorAvailable(g){return g.defeated.includes('Sumon Mia');}
export function combatReady(g){return g.status==='playing'&&!g.story&&!g.cinematic&&g.player.hp>0;}
export function assignSpecialNpcs(g){
 const candidates=g.actors.filter(a=>a.kind==='civilian'&&!a.activity&&!a.homeId&&!a.homeless);
 for(let i=candidates.length-1;i>0;i--){const j=Math.floor(g.rng()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
 candidates.slice(0,Math.round(g.actors.length*.01)).forEach(a=>{a.specialTaunt=true;});
}
export function combatPose(a){
 if(!(a.attackTime>0))return {arm:a.weapon==='machete'&&a.windup>0?.9*Math.min(1,1-a.windup/(a.windupMax||.95)):0,hand:0,leg:0,lean:0};
 if(a.attackKind==='machete'){
  const duration=a.attackDuration??.78,t=duration-a.attackTime,contact=.32;
  const arm=t<=contact?.9-2.5*t/contact:-1.6*(1-(t-contact)/(duration-contact));
  return {arm,hand:0,leg:0,lean:Math.sin(Math.min(1,t/contact)*Math.PI)*.1};
 }
 const kind=a.attackKind??'punch',spec=COMBAT_ACTIONS[kind]??COMBAT_ACTIONS.punch,duration=a.attackDuration??spec.duration,t=duration-a.attackTime;
 const wind=Math.max(0,Math.min(1,t/spec.contact)),recover=Math.max(0,1-(t-spec.contact)/(duration-spec.contact)),reach=t<spec.contact?wind:recover;
 // Contact is the maximum extension; recovery does not produce another hit.
 return kind==='kick'?{arm:-reach*.35,hand:.15*reach,leg:-reach*1.35,lean:-reach*.12}:
 kind==='slap'?{arm:.5*wind-reach*1.65,hand:reach*.8,leg:0,lean:reach*.05}:
 {arm:-reach*1.75,hand:reach*.23,leg:0,lean:reach*.08};
}
