# Pushpo — Environment & World Systems

The existing demo now includes fuchka recovery, repeating day/night lighting and denser roadside litter. Open the updated `pushpo-play.html` beside this report and reload any older open copy.

## Implemented behavior
- Three interactive stalls: Mirpur Road, Boundary Road and Kathaltola. Approach the vendor and press **F**, or tap the contextual food button. Green map dots mark unused stalls; used stalls turn gray.
- Fuchka is identified as Pushpo’s favourite food. Each shopkeeper serves one healing meal per run, tracked separately. Recovery is **20% of maximum health**, capped at maximum: 20 at 100 maximum, 40 at 200 maximum, or only the missing amount near full health. The health HUD and floating message show actual recovery. Full health preserves the meal. Chapter/day changes do not replenish meals; a new run resets them.
- Food does not grant points, kill credit, invulnerability, or timer resets. Eating is rejected while out of reach, obstructed, dead, paused, reading story, in a cinematic, attacking or dodging. The three vendors reuse existing residents and activity behavior; the population stays 180 and all original activity/home/homeless/special roles remain.
- Day and night repeat every **210 seconds each**. Dusk and dawn fade over 24 seconds. Background/sky tint, ambient wash, sunlight/shadow direction and warm streetlamp/stall light pools change together. The cycle follows the existing game clock, including its pause/story behavior; it does not reset hunt/rescue timers or simulate the narrative lifespan. No weather effects or extra ticker were introduced.
- The fixed art seed now bakes **824 litter pieces**: bottles, paper, wrappers, packaging, newspapers and crushed cans. They stay along curbs/pavements, outside driving lanes, stall entrances and roundabout rings. Litter has no collision and no runtime spawning. The existing ground bake holds it; one cached stall texture serves all three shops. Live night light pools are capped at 24 visible sources.
- Corrected a navigation regression exposed by the new Boundary stall: a prop detour may bypass road-graph routing only when the underlying ground route remains walkable. Hercules’s independent hunts, civilian movement, traffic, combat and final mission regressions pass afterward.

## Validation performed
- **93/93 full regression tests passed**, covering existing combat, ability unlocks, boss/story progression, final rescue/ending, NPC activities, home visits, metro, traffic and crowd navigation plus ten new world tests.
- After visual/lighting polish, **31/31 focused tests passed** (world, environment, scene and projection/collision). Each stall was checked in day, dusk, night, dawn and a repeated cycle, including one-use persistence. Tested recovery at multiple maximum-health values, health cap, invalid requests, HUD states, phase continuity and independent countdown behavior.
- **3/3 mutation checks caught** deliberate civilian-protection, countdown and obstruction faults. Portable scripts parse, include local assets and match `dist/offline.html`; entry snapshots match.
- Static shared Canvas renders reviewed at **1280×800** and **544×884**, with day/dusk/night/dawn and cart/litter detail views. Night pools were softened; foreground buildings fade near interactive stalls. These are renderer reviews, not browser screenshots.
- QA-page inline scripts parse, and the renderer QA’s updated boss/farewell simulation fixture passes under Node. Renderer QA now expects the added lighting layer.

## Outstanding verification
The in-app browser could not reach the local HTTP preview (timeout); the existing file-URL access restriction was not bypassed. **Live Pixi/WebGL rendering, browser reflow/Bengali font shaping, physical touch input and device frame rate remain UNCONFIRMED.** Fixed object counts, baked litter and light-pool limits are verified; mobile FPS is not. No known automated simulation failure remains.

## Review and handoff
- Browser scenarios: `/qa-world.html` (all shops, health, four lighting phases, clock advance, pause and reset), `/qa-responsive.html` (actual game sizing), `/qa-final.html` (rescue/ending), `/qa-renderer.html` (GPU comparison/pooling when accessible).
- Core additions: `pushpo-demo/dist/world-v10.mjs`, `world-ui-v10.mjs`, `qa-world.html`, `pushpo-demo/tests/world-v10.test.mjs`.
- Locations: `pushpo-demo/dist/scene-v3.mjs`. Litter: `dist/environment-v5.mjs`. Shared drawing/light layer: `dist/art-v3.mjs`, `dist/pixi-draw.mjs`. Commands: root `AGENTS.md`.
- Static reviews: `pushpo-world-day.png`, `pushpo-world-dusk.png`, `pushpo-world-night.png`, `pushpo-world-dawn.png`, `pushpo-world-phone-canvas.png`, `pushpo-world-detail-review.png`. Reproduce with `../work/render-world-v10.mjs`.
- Diff summary: added world state/presentation and QA/tests; extended existing scene, simulation, drawing, HUD, input and exporter; updated prior role-count expectations to retain the original ten activities alongside the new vendors; refreshed README, art direction and context files. No source artwork was replaced. No commit, push or deployment was performed.
