# Pushpo environment and progression update — 2026-10-21

Download: `pushpo-play.html` (28.9 MiB), a self-contained offline HTML file. Open or reload it in a WebGL-capable browser. Existing game art, controls, fish aura, activities, combat, scoring, no-kill-healing rule and three bosses are retained.

- 180 starting NPCs, reduced from 200; original ten activity roles and one homeless resident remain.
- Keep-right passing, iterative body separation, congestion-aware route choices, committed road waypoints and blocked-route recovery reduce crowds and head-on jams. Rickshaw colliders remain active.
- Nine residents visit three homes, reserve a doorway, walk/fade inside, wait and exit when clear. Indoor actors are hidden rather than deleted.
- Textured asphalt replaces the road paving; sidewalks remain paved. Utility poles use world/screen spacing and duplicate nearby lamps are removed.
- The supplied metro reference guides the concrete viaduct, flared piers, overhead wiring, cream-white cars, green cab and red trim. Both travel directions, random 90–165-second waits and the six-second station dwell remain functional.
- Sight-revealed rapists deliver the requested Bengali approach line once per encounter. Hidden identities still behave as civilians.
- Sumon defeat → animated Bengali verdict → Pushpo reflection → free exploration and combat → 150 additional earned points → Hafizur unlocked → second Bengali verdict. Notes pause combat and countdown while reading; final Sohel victory is preserved.

Validation: 48/48 automated tests passed; all 3 isolated mutation faults were detected. The seeded three-minute crowd audit found 0 stalled walkers out of 160 roaming actors (excluding activities, home visitors and the homeless interaction role). Tests also cover doorway reservations, blocked exits, encounter dialogue reset, point overshoot, story ordering, no healing, moving metro, traffic collisions and portable source/vendor integrity.

`pushpo-metro-south.png`, `pushpo-metro-north.png`, `pushpo-polish-canvas.png` and `pushpo-polish-phone-canvas.png` are static shared-Canvas scene renders, not browser screenshots. Live browser/GPU and responsive story-card verification remain UNCONFIRMED: the local HTTP preview timed out. No physical mobile performance claim is made.

Source/test commands and balance: `pushpo-demo/README.md`. This update did not commit, push or deploy.
