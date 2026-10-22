# Pushpo combat update — 2026-10-22

Download: `pushpo-play.html` (28.9 MiB). Open or reload the file to load the rebuilt offline game.

## Implemented
- Slap (Q): palm icon, open-hand animation, 18 damage at 0.19-second contact, recoil/stagger and windup interruption.
- Punch & Kick (Space/click): alternating accepted inputs, distinct fist/leg poses, 35 damage, contact at 0.17/0.28 seconds. Invalid/cooldown inputs do not advance the combo; moving or obstructed targets can be missed.
- Sight (E): hidden/locked until five actual regular-enemy defeats, then an unlock notice and persistent button. Encounters, fleeing and special civilian slaps do not count.
- Water Mirror (R): hidden until Sumon is defeated. Auto-reacts to a connecting gunshot, weapon strike or grab, or casts manually; overlapping translucent golden fish scales last 1.35 seconds. All activations share a displayed 10-second cooldown.
- Opening: 12-second snatcher guidance and marker, later sudden attacks using existing actors. The pre-Sight pool uses snatchers/murderers; after unlock, replenishment introduces a disguised rapist. Hidden rapists retain their existing civilian disguise until Sight.
- Snatchers survive nonlethal hits and may flee with either added Bengali escape line. Original attack dialogue remains. Fleeing cancels attacks and uses existing road/detour/traffic collision systems.
- Each murderer retains one randomly assigned requested Bengali line, with one delivery per encounter. Murderer gunfire is aimed and telegraphed so movement/Dodge can avoid it.
- Two special civilian taunters (rounded 1% of 180) speak the supplied line once, accept one nonlethal slap, then flee. Ordinary civilian protection remains; this interaction awards no points or kills.
- Existing story notes, bosses, metro, house visits, city assets, no-kill-healing rule, movement, Dodge, map, audio and pause systems remain.

## Verification and remaining limits
62/62 automated tests passed, including 14 new combat tests. Three intentional mutation faults were caught. Portable sources compile, download/offline copies match and vendored renderer integrity passes. Regression coverage includes traffic/navigation, house visits, boss order, scoring, dialogue, abilities and cooldowns.

`pushpo-combat-v7.png` is a static shared-Canvas pose/shield review, not a browser screenshot. The local browser preview timed out; live WebGL, phone layout/touch behavior and physical-device performance remain UNCONFIRMED. No known failing automated regression remains. This stage is complete in code; no next-stage work or deployment was started.

Canonical behavior, commands and controls: `pushpo-demo/README.md`. Pose/contact constants and dialogue: `pushpo-demo/dist/combat-v7.mjs`. Test file: `pushpo-demo/tests/combat-v7.test.mjs`.
