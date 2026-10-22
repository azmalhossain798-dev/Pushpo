# Pushpo — environment polish and traffic

Open the refreshed `pushpo-play.html` in Chrome or Edge; it embeds the game and all assets for offline play.

- All eight retained building designs now use calibrated ground corners and two facade planes, rather than arbitrary sprite stretching. Walls remain upright and storey height stays consistent across lot sizes. Five landmark footprints were adjusted to clear roads and sidewalks.
- Curb litter includes plastic bottles, paper, wrappers and cartons. Placement avoids driving lanes, junction centers and solid props. It is baked once and cannot obstruct gameplay.
- Fourteen moving rickshaws carry drivers and use eight directional views, rotating wheel details, lane routes, curved turns and roundabout arcs. Junction reservations and braking manage traffic; pedestrians steer around vehicles and both share collision checks. Pause freezes traffic; traffic causes no health damage.
- Original parked vehicles, characters, activities, combat, Sight, metro, countdown and story remain.

Validation: 36 Node tests passed; three intentional mutation faults detected. Tests cover facade ground alignment, upright walls, storey scale, clear landmark footprints, curb placement, all eight directions, connected turns, a six-minute traffic run, crossing pedestrians, NPC clearance, pause/restart and the existing gameplay/export regressions.

Static scene rendering through the same Canvas drawing commands completed at 1280×800 and 544×884. See `pushpo-polish-canvas.png`, `pushpo-polish-phone-canvas.png` and the eight-design `pushpo-building-alignment.png` board. These are shared-scene renders, not browser screenshots. Pixi/WebGL and live phone UI checks remain unverified this session: browser policy restricts file URLs and the local HTTP preview connection times out.

The new atlas is `pushpo-demo/dist/assets/rickshaw-v5.png`, generated with the built-in image tool. The prompt set and asset layout are documented in `pushpo-demo/ART-DIRECTION.md`. Source modules: `environment-v5.mjs`, `traffic-v5.mjs`, `scene-v3.mjs`, `engine-v3.mjs`, `art-v3.mjs`; export integration is in `work/export-demo.mjs` at workspace root. QA traffic following is available in `/qa-city.html` when preview access works.

No commit, push or deployment was performed by this task. Publication details remain in the game README.

## Rickshaw crowd-jam correction

The refreshed portable file includes `pedestrian-v5.mjs`: committed, collision-checked detours replace the repeatedly recalculated front-of-vehicle steering. NPCs can pass either end of a stopped rickshaw and bypass traffic-occupied intermediate road nodes. Parked props and roundabout geometry are considered when selecting a clear route. Physical colliders remain enabled.

Validation now totals 40 passing tests and three caught mutations. New regressions cover a head-on stopped rickshaw, a ten-person queue, an occupied road waypoint, and a three-minute district simulation. In the seeded district audit, stationary walkers fell from 50 to 1; none of the remaining stationary cases were near moving traffic. Live browser verification remains unavailable as described above. Reload the HTML to load the updated simulation.
