# Pushpo — PixiJS migration

Completed 2026-10-21. Local/downloadable distribution; no publication.

## Result and original architecture

The live scene now uses **PixiJS 8.22.0 / WebGL**, preserving Pushpo's approved artwork and existing gameplay. The self-contained download is `pushpo-play.html` (18.9 MiB).

The original project was buildless HTML/CSS and JavaScript ES modules, with Node built-ins for preview, tests and export. `engine-v3.mjs` owns seeded simulation, movement, road/prop collision, NPC AI, sight, damage, score, countdown and boss progression. `scene-v3.mjs` owns landmarks, scenery, activities and isometric projection. `art-v3.mjs` drew the scene with Canvas 2D. `game-v3.mjs` owns the single animation loop, input, HTML HUD, menus and Web Audio.

Pushpo has no gravity inversion, jumping, floor/ceiling traversal or platforming. Those template requirements were not added as new mechanics.

## Files changed and why

Paths are relative to the workspace root; `D` means `outputs/pushpo-demo/dist`.

| File | Change and purpose |
| --- | --- |
| `D/pixi-renderer.mjs` | Async Pixi application, stage, WebGL resize/DPR and disposal. Automatic/shared tickers disabled; the existing game loop calls render. |
| `D/pixi-draw.mjs` | Pooled Pixi Sprites, Graphics and Text implement the existing scene drawing vocabulary. Cached atlas subtextures/gradients; static ground tiled into textures no larger than 1024 px. |
| `D/art-v3.mjs` | Accepts a drawing backend and labels ground/world/effects/guidance layers. Reuses existing composition and animation; retains Canvas rendering for comparison. |
| `D/game-v3.mjs` | Selects PixiPainter; adds teardown for listeners, ResizeObserver, pending audio notes, audio context, animation callback and GPU resources. |
| `D/index.html`, `D/index-v3.html` | Load the pinned local distribution before the game module. Story and markup otherwise retained. |
| `D/vendor/` | PixiJS distribution, MIT license, upstream integrity and upgrade notes. No runtime CDN dependency. |
| `work/export-demo.mjs` | Embeds Pixi, its license and new modules alongside existing assets in both portable copies. |
| `outputs/pushpo-demo/tests/pixi-migration.test.mjs`, `portable.test.mjs` in the same folder | Projection, pivot, DPR, collision, long-frame, portable syntax and integrity checks. |
| `work/check-pixi-mutations.mjs` | Tests three intentional faults in an isolated scratch copy. |
| `D/qa-renderer.html`, `D/qa-responsive.html`, `D/qa-character-motion.html` | Browser scene comparison, renderer checks, actual game viewports and character motion review. |
| Root context files and project `README.md` | Updated operating instructions, architectural decision and handoff. |

`engine-v3.mjs` and `scene-v3.mjs` are byte-identical to their pre-migration copies. Artwork and CSS were preserved. No framework, package installation, real 3D engine or new gameplay system was introduced.

Menus, HUD, accessible buttons, joystick and overlays remain HTML/CSS. The north-up minimap and district map remain Canvas 2D UI. Canvas also performs startup atlas cropping, static texture baking and label measurements. The live scene is composed of Pixi display objects, not an uploaded Canvas frame each tick.

Initialization and explicit rendering follow the versioned [Pixi Application API](https://pixijs.download/v8.22.0/docs/app.Application.html).

## Validation

| Check | Result |
| --- | --- |
| Original baseline | 12/12 tests passed before editing. |
| Final Node suite | **19/19 passed**, Node v24.19.0. |
| Mutation checks | **3/3 caught**: civilian damage allowed, countdown subtraction reversed, solid obstruction bypassed. Production simulation never mutated. |
| Browser fixture | **11/11 passed**: WebGL, stopped ticker, four layers, rendering leaves simulation untouched, pointer projection, pause, timeout loss, three-boss win, reset, stable object pool and backing-store size. |
| Live interaction | WASD/arrows, sight, held attack, dodge, enemy damage, a 15-point kill, map, pause/resume, help, randomized restart and on-screen movement/actions exercised. Sound/fullscreen controls toggle without game-console errors; audio was not assessed by listening. |
| Visual review | Seeded Canvas/Pixi comparison; fish orbit; front/rear walking, idle and conversation gestures; all three approved boss designs in their districts. |
| Responsive review | Actual embedded application at 844 × 390 and 390 × 844; canvas sizes match. Main game also tested at 1280 × 720. |
| Portable build | Export succeeded; embedded JavaScript syntax passes; copies match; external script/style/image references removed. Portable edition loaded and played over HTTP. |
| Dependency integrity | Tarball SHA-512 matches the npm registry; browser artifact SHA-256 matches the pinned integrity test. |
| Cleanup | Browser fixture reported Pixi resources released after disposal. |
| Scope review | File comparisons against saved baseline; gameplay/map modules unchanged, entry snapshots and portable copies match. No Git repository exists here. |

The first pool check failed because its camera was still moving and exposing objects; fixing the fixture camera made it pass. A missing fish outline in the first Pixi draft and a mutation-runner syntax error were fixed before final validation.

Main, portable and character-review pages had no reported game-console errors in their checks. The embedded responsive test page repeatedly produced an unattributed `MutationObserver.observe` error during automation, without a source URL or visible gameplay failure. Its origin is **UNCONFIRMED**; it remains a QA caveat, not a diagnosed game defect.

## Differences and verification limits

- WebGL is now required. Initialization failure leaves a visible reload/WebGL message and disables play.
- GPU antialiasing/text edges can differ slightly. Fish/sword glow uses a soft double stroke rather than Canvas shadow blur; small particle halos are not pixel-identical.
- Original timing is retained: countdown uses elapsed wall time; movement/AI steps cap at 60 ms. Camera smoothing retains its original per-frame interpolation.
- Three-chapter completion was checked with deterministic simulation/fixtures, not a manual 45-minute playthrough.
- Physical phones, multitouch hardware, other browser engines, high-DPR hardware, device reduced-motion settings and low-end GPU performance remain unverified. No FPS improvement is claimed.
- The portable file was tested over HTTP; direct `file://` execution was not browser-automated because that surface is restricted here.

## Run and check

For portable play, open `pushpo-play.html` in a browser with WebGL enabled. The file embeds its code, renderer and artwork; it needs no server or package installation.

For source preview, run from the workspace root:

```text
node outputs/pushpo-demo/serve.mjs
```

Open `http://127.0.0.1:4173/`. QA pages are listed in `AGENTS.md` and the project README.

To rebuild and validate:

```text
node work/export-demo.mjs
node --test outputs/pushpo-demo/tests/engine-v3.test.mjs outputs/pushpo-demo/tests/scene-v3.test.mjs outputs/pushpo-demo/tests/pixi-migration.test.mjs outputs/pushpo-demo/tests/portable.test.mjs
node work/check-pixi-mutations.mjs
```

Export writes `outputs/pushpo-play.html` and `outputs/pushpo-demo/dist/offline.html`. Do not edit these generated files directly.
