import {nearbyFuchka,canEatFuchka,daylightAt,WORLD_RULES} from './world-v10.mjs';
// Shared by the game and QA; textContent keeps shop messages out of HTML parsing.
export function presentWorldHud(doc,g,visible,clear){
 const el=id=>doc.getElementById(id),p=g.player,maximum=p.maxHp;
 el('health-text').textContent=`${Math.ceil(p.hp)} / ${maximum}`;el('health-fill').style.width=`${Math.max(0,Math.min(100,p.hp/maximum*100))}%`;
 const light=daylightAt(g.elapsed);el('world-time').textContent=`${light.night>.5?'☾':'☀'} ${light.label}`;el('world-time').title=`Day and night last 3½ minutes each · ${Math.ceil(light.remaining)}s until the next phase`;
 const shop=nearbyFuchka(g,clear),show=visible&&!!shop&&g.status==='playing'&&!g.story&&!g.cinematic&&p.hp>0;
 el('fuchka-eat').classList.toggle('hidden',!show);el('fuchka-eat').disabled=!canEatFuchka(g,shop);
 if(show){el('fuchka-name').textContent=shop.stall.name;const action=shop.used?'Already enjoyed · one meal per shopkeeper':p.hp>=maximum?'Health full · meal saved':`Eat favourite fuchka · +${Number(Math.min(maximum*WORLD_RULES.mealFraction,maximum-p.hp).toFixed(2))} health`;el('fuchka-action').textContent=action;el('fuchka-eat').setAttribute('aria-label',`${shop.stall.name}: ${action}. Press F or tap.`);}
 return shop;
}
