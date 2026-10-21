# Pushpo — The Golden Return

A buildless browser demo for desktop and mobile. Run `node serve.mjs`, then open http://127.0.0.1:4173. The deployable application is in `dist/`.

For the easiest start, open the supplied `pushpo-play.html` in Chrome or Edge. It embeds all game code and artwork and requires no server, installation, or internet connection. Refresh or reopen an older copy after updating.

## Play

- WASD or arrow keys: move. On touch screens use the left joystick.
- E / Sight: reveal nearby enemies and civilians. Revealed targets stay identified.
- Space / Attack: hold to strike a revealed enemy within range.
- Shift / Dodge: dash away from a telegraphed attack.
- Esc / Pause: pause and resume. Switching browser tabs automatically pauses.
- M / minimap: open the district map and pause.

A run begins with 100 health, 0 points, and 15 minutes. Murderers have 100 health and award 10 points; rapists have 150 health and award 15 points; snatchers have 70 health and award 5 points. There are at most four regular enemies, with at most two attacking at once. Defeating an enemy restores up to 13 health. Civilians cannot be damaged.

Bosses unlock at cumulative point thresholds: Sumon Mia at 150 (450 health), Hafizur Rahman at 300 (600 health), and Sohel Rana at 450 (850 health). Defeat each boss before its chapter countdown expires. The first two boss victories restore full health and a fresh 15-minute countdown. Defeating Sohel Rana wins. Death or timeout ends the run; restarting resets all progress and randomizes the crowd. Pushpo is an adult, age 18. The opening story references sexual assault and murder in text only; there is no assault depiction or graphic gore.

## Checks

`node --test tests/engine-v3.test.mjs tests/scene-v3.test.mjs tests/pixi-migration.test.mjs tests/portable.test.mjs`

No installation is needed to play. PixiJS 8.22.0 is bundled locally under `dist/vendor/` and embedded in the portable file; a WebGL-capable browser is required. No accounts, analytics, saved personal data, server state, external fonts, or runtime CDN requests. Audio is synthesized locally after the sound control is enabled.

From the workspace root, regenerate the portable edition with `node work/export-demo.mjs` before running its tests. Run `node work/check-pixi-mutations.mjs` for isolated civilian-protection, countdown and collision mutations. These checks never modify the production simulation.

The main scene uses Pixi sprites, Graphics and Text through a pooled drawing backend. `game-v3.mjs` owns the only game animation loop; Pixi's automatic ticker is disabled. HTML/CSS retains menus, HUD and accessible controls. Canvas 2D remains for one-time texture baking, sprite alpha cropping, label measurements and north-up UI maps. Ground textures are split into tiles no larger than 1024 pixels; DPR is capped at 2.

## Art

Adult character sprites, storefronts, and Pushpo's portrait were generated for this project with the built-in image generation tool, inspired by the supplied visual reference. The mysterious golden fish, known only as Unknown, moves around Pushpo with front/back layering, a waving tail, and a glowing trail. Its nature and reason for choosing Pushpo remain unexplained. Walking, combat, warnings, and environmental details are rendered on canvas.

The expanded 3400 × 3600 district follows the supplied map's main street relationships: Begum Rokeya Sarani, Mirpur Road, the central junction, Boundary Road, northern lanes, and eastern streets. Buildings and distances are fictionalized for gameplay. The scene now uses a consistent 2:1 isometric projection for roads, sidewalks, ground effects, and world positions. Buildings, trees, vehicles, stalls, and people draw in depth order. Foreground objects fade when they would conceal Pushpo. The minimap stays north-up.

All people use a lightweight cutout rig with independent arm/leg swing, weight shift, and front/rear artwork. Pushpo's original front-facing artwork and portrait are preserved. Ten activity NPCs work, shop, and converse at fixed places; other civilians walk the district. Customers step aside and return, vendors gesture, and conversation partners exchange short speech bubbles. Activity NPCs are not relocated by the enemy respawn system.

Sumon wears a blue shirt and black trousers, Hafizur wears army green, and Sohel is thin and disheveled in black. The built-in image generator produced new front/rear boss art, rear civilian/Pushpo views, vehicles, stalls, and street decorations. See `ART-DIRECTION.md`.

Active source files: `index.html`, `style-v2.css`, `scene-v3.mjs`, `engine-v3.mjs`, `art-v3.mjs`, `pixi-draw.mjs`, `pixi-renderer.mjs`, and `game-v3.mjs`. `offline.html` is the embedded portable edition. Legacy v1/v2 modules are retained but unused. `qa-character-motion.html` reviews walking, idle, front/rear, and talking poses with Pixi. `qa-renderer.html` compares a seeded Canvas/Pixi scene and checks the GPU renderer, pooling, gameplay integration and disposal. `qa-responsive.html` resizes the actual game in an embedded viewport.

GPU antialiasing and text edges may differ slightly from Canvas. The fish and sword use a soft double stroke in place of Canvas shadow blur. The original long-frame behavior is retained: countdown uses elapsed wall time while movement/AI steps are capped at 60 ms. There are no jumping, gravity-inversion or platforming mechanics in Pushpo.

## Publication status

Local/downloadable only, confirmed by the user. The Sites identity in `.openai/hosting.json` is retained for any later publishing request.
