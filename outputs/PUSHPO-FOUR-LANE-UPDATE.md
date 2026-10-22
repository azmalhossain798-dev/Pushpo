# Pushpo — four-lane roads

Begum Rokeya Sarani and Mirpur Road now have four lanes: two in each direction. Both use double yellow center lines, white lane dividers, direction arrows and wider pedestrian crossings. The central roundabout has a wider, two-lane circulating road.

Rickshaws follow the outer lanes. Intersection stopping positions account for road width and crossing angle, preventing side-road vehicles from blocking the widened carriageways. Retained buildings, stalls, home entrances and street furniture have been repositioned where needed to clear the roads. NPC identities, assets, food recovery, metro movement, combat and story systems remain integrated.

## Validation

- 97/97 automated tests passed, including four new road-layout tests, portable export checks, traffic, navigation, combat and story regression coverage.
- 3/3 mutation checks detected deliberately broken civilian protection, countdown expiry and solid obstruction.
- Static shared Canvas renders reviewed at desktop and phone dimensions. Reviews: `pushpo-boulevards-day.png`, `pushpo-boulevards-night.png`, `pushpo-boulevards-phone-canvas.png`.
- Rebuilt `pushpo-play.html` and matching demo `dist/offline.html` (approximately 31.4 MiB). Reload an existing game tab to load the update.

Live WebGL output, touch controls and physical-device performance remain UNCONFIRMED. Static reviews do not verify those browser behaviors; the existing browser-access blocker remains unresolved.

## Diff summary

- Road geometry and traffic: `dist/engine-v3.mjs`, `dist/scene-v3.mjs`, `dist/traffic-v5.mjs`.
- Baked markings and curb clearance: new `dist/boulevards-v11.mjs`, integrated through `dist/art-v3.mjs`, `dist/environment-v5.mjs`, `dist/city-art.mjs`.
- Retained building entrances: `dist/homes-v6.mjs`.
- Regression coverage: new `tests/boulevards-v11.test.mjs`; corrected obstruction fixtures in existing combat and migration tests.
- Export and handoff: `work/export-demo.mjs`, README, ART-DIRECTION, AGENTS and `.context/`.

Paths beginning with `dist/` or `tests/` are relative to `outputs/pushpo-demo/`. This summary covers the road update; other existing workspace changes were preserved.
