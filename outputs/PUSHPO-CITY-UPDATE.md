# Pushpo city update — 2026-10-21

Download: `pushpo-play.html` (25.8 MiB). Open in a WebGL-capable Chrome or Edge browser; code and artwork are embedded for offline play.

- Expanded warm illustrated district: 4600×4800 world, 119 road sections, three roundabouts, 212 buildings, additional storefronts, CNGs, produce stalls, rooftop details, greenery and utility cables. Original assets, Pushpo artwork and activity NPCs remain.
- Functional four-car metro: randomized waits of 90–165 seconds, travel along one elevated line, six-second station dwell, departure and a fresh wait. Game pause freezes its clock. The first 90 seconds contain no train.
- Three slim snatcher artwork variations with front/rear views; actual combat drives Pushpo/enemy arm strikes and the requested Bengali snatcher taunt.
- Rapists use civilian artwork, markers and wandering behavior until Sight reveals them. Revealed identities persist. No enemy or boss kill heals Pushpo.
- Starting population: 200 NPCs, including one roaming homeless civilian (0.5%) who asks nearby pedestrians for food or money and receives replies. Original vendor, customer and conversation roles remain.
- Opening summary replaced with the supplied text exactly. Existing bosses, progression, controls, countdown, audio, fish aura and portable delivery retained.

## Validation

All 28 Node tests passed after the final portable export. Three isolated mutations were correctly caught: civilian damage, countdown reversal and obstruction bypass. Portable tests verify embedded sources/assets, matching downloadable/offline copies and the vendored PixiJS integrity.

Earlier HTTP browser QA passed 24 city checks and verified civilian disguise versus Sight reveal; `pushpo-sight-off.png` and `pushpo-sight-on.png` record those views. Final train draw-order/canopy refinements and the expanded phone layout still need a visual recheck: the current session blocks the local preview connection. Physical mobile hardware has not been tested for this update.

For targeted browser checks, serve the project and open `/qa-city.html`, `/qa-character-motion.html`, `/qa-renderer.html`, and `/qa-responsive.html`. The metro time-jump is confined to `/qa-city.html`; the actual game retains its minimum 90-second wait. Run commands and balance are in `pushpo-demo/README.md`.

This task did not commit or push. Hosting details are in the README.
