import fs from 'node:fs';
let p='outputs/pushpo-demo/dist/art-v3.mjs',s=fs.readFileSync(p,'utf8').replace("ready=actor.windup>0?","ready=actor.weapon!=='machete'&&actor.windup>0?");fs.writeFileSync(p,s);
p='outputs/pushpo-demo/tests/integration-v12.test.mjs';s=fs.readFileSync(p,'utf8').replace("const before=combat.combatPose", "const wind=combat.combatPose({weapon:'machete',windup:.001,windupMax:.95}),start=combat.combatPose({...a,attackTime:.78});assert(Math.abs(wind.arm-start.arm)<.01,'windup must join the slash continuously');const before=combat.combatPose");fs.writeFileSync(p,s);
