# Pushpo — stalls, perception, combat and UI update

## Implemented

- Exactly three fuchka stalls, each with a bound seller and distinct apron. The baked counter includes a canopy, Bengali sign, glass food display, filling/sauce bowls and utensils. Duplicate or obsolete seller roles are repaired without adding NPCs or resetting meals. Counters stay opaque around their sellers, and nearby decorative furniture clears their sightline. Existing accessible positions, colliders and one-use, capped 20%-of-maximum-health recovery remain.
- A single active-Sight gate controls enemy labels, auras, blue/hostile markers, minimap/district dots, targeting arrows, boss names and health presentation. Known, aggro and stale reveal metadata cannot expose identity. Regular enemies use civilian cover artwork while concealed. Sight unlocks after five actual defeats and the HUD shows locked progress, availability, active duration and recharge. Opening attackers remain fightable; ordinary civilians remain protected.
- Distinct skinny final companions: balding ochre vest versus long messy hair/slate-blue shirt, with different faces, clothes, silhouettes and matching rear views. Original Sohel art remains. Their hand-attached long machetes share the animated shoulder transform; damage resolves once at contact after wind-up, rechecks target/range/walls and respects interruption and recovery. Existing final-group health and positioning remain.
- A labeled Pause button reuses the existing pause system and menu, now labeled Resume and Restart. Gameplay, AI, attacks, ability clocks, metro/traffic, lighting and mission timers freeze. UI handlers clear held inputs; resume resets the frame timestamp; restart creates a fresh run.
- Sumon’s exact replacement Bengali note, through the retained one-shot verdict FX/story presenter. His existing reflection and Water Mirror unlock remain.
- Water Mirror is a translucent full-body bubble with reflection, droplets and deflection feedback. Protection lasts exactly 3 game seconds; activation cooldown remains 10 seconds. The .45-second dissolve is cosmetic and does not block damage. Incoming shots, weapon attacks and grabs use the same protection state as the visual.
- Redesigned the four mismatched city-building types while retaining their shop identities. Measured crops and source ground anchors rectify both facade bases to the shared isometric footprint with upright walls. Existing roads, lots and original asset files remain.

## Validation

**103/103 tests passed, zero failures.** After the final slash-pose continuity adjustment, 32/32 focused combat/final/integration/portable tests also passed (`../work/v12-final-focused-tests.txt`). Full automated results: see `../work/v12-full-tests.txt`. Six new integration tests cover identity presentation and maps, stale metadata, boss HUD/labels, vendor ownership/deduplication/healing, shield expiry/cooldown, machete contact/recovery/misses, and actual pause/resume/restart/Sight UI handlers in a DOM harness. Existing story, navigation, traffic, final encounter, geometry and portable-export suites remain in the full command in AGENTS.md.

All three mutation checks detected deliberately broken civilian protection, countdown expiry and solid obstruction. Portable HTML was rebuilt with both new atlases embedded and no runtime network assets.

Shared Canvas renders were inspected at desktop and 544×884 phone dimensions. Reviews: `pushpo-v12-building-review.png`, `pushpo-v12-character-review.png`, `pushpo-v12-combat-review.png`, `pushpo-v12-stall-1.png`, `pushpo-v12-stall-2.png`, `pushpo-v12-stall-3.png`, `pushpo-v12-bubble.png`, `pushpo-v12-phone-canvas.png`.

Live IAB preview of the local HTTP server returned `ERR_CONNECTION_TIMED_OUT`. Live WebGL output, touch behavior, browser Bengali typography, responsive layout and physical-device performance remain UNCONFIRMED. Static renders and the DOM harness do not verify those behaviors. No deployment or push was performed.

## Task diff summary

- Identity and combat simulation: `dist/city-systems.mjs`, `dist/combat-v7.mjs`, `dist/engine-v3.mjs`, `dist/final-v9.mjs`.
- Stalls, building calibration, sprites and bubble: `dist/world-v10.mjs`, `dist/environment-v5.mjs`, `dist/art-v3.mjs`, new versioned PNGs.
- Pause/Sight HUD and verdict: `dist/game-v3.mjs`, `dist/index.html`, matching `index-v3.html`, `style-v2.css`, `story-v6.mjs`.
- Export, QA, regression fixtures, new integration tests and project context/docs updated. Pre-existing workspace changes preserved.

Paths beginning with `dist/` are relative to `outputs/pushpo-demo/`. Download: `outputs/pushpo-play.html`; reload/reopen it to load changed embedded code and art.

## Image-generation provenance

Generated using the built-in image tool, with transparent alpha; no API/CLI fallback. Original source atlases remain unchanged. Project assets:

- `pushpo-demo/dist/assets/companions-v12.png`: 1536×1024, two columns by two rows. Input style reference: retained `people-v4.png`.
- `pushpo-demo/dist/assets/city-v12.png`: 1492×1054, measured crop regions rather than assuming an exact row boundary. Input style reference: retained `city-v4.png`. Calibrated facade transforms correct residual source-camera differences.

### Companion prompt

Use case: stylized-concept. Asset type: transparent 2D illustrated mobile game character atlas for Pushpo, warm detailed painterly sprites. Reference image is STYLE ONLY: existing gaunt Bangladeshi men atlas. Create TWO DIFFERENT fictional adult male villains, gaunt and emaciated with worn clothes, neither resembling each other. Layout exactly 2 columns and 2 rows with generous transparent margins: top row front elevated orthographic three-quarter views facing right, bottom row matching rear three-quarter views facing right, equal aligned feet and equal cell sizes. Left companion: long narrow face, receding shaved head with short sparse hair, thin moustache, lanky tall shoulders, faded dusty ochre sleeveless vest, ripped dark brown trousers, worn sandals. Right companion: angular face, long messy side-swept hair, patchy short beard, hunched skinny silhouette, faded slate blue rolled-sleeve shirt, worn pale gray trousers, scuffed shoes. Match reference camera and painted shading, warm light upper left, realistic adult proportions. Neutral separated arms and feet suitable for cutout walking and arm rig. NO weapons (renderer attaches live machetes), no drugs or paraphernalia, no text, no ground, no shadows outside body, no backdrop; actual transparent alpha. Preserve distinctions consistently in rear views.

### City prompt

Use case: stylized-concept. Asset type: transparent 2D game building atlas, 2 columns x 2 rows, each complete separate building centered in its own equal square cell with generous transparent margins. Reference image for STYLE, colors and Dhaka architectural detail only; correct its camera. Four fictional Mirpur Dhaka buildings: top left red Bengali tea shop, top right blue grocery, bottom left cream apartment, bottom right aged green pharmacy. Two/three storeys, balconies, tanks, rooftop plants and laundry, Bengali shop signs. CRITICAL CAMERA: true orthographic 2:1 isometric game camera, no perspective convergence. BOTH visible ground edges slope exactly 26.565 degrees from horizontal, equal apparent width left and right facades; central nearest vertical corner on x=.50 of EACH CELL. All walls strictly vertical, corresponding roof and balcony edges parallel to footprint edges, no tilted buildings. Ground footprint left corner at normalized (.13,.76), nearest/front corner (.50,.945), right corner (.87,.76) within EACH cell; building roof safely below .08. Warm painted illustrated detailed mobile-game style matching reference, lighting upper-left, rich but readable. No base terrain or pavement, no people, no cast floor shadow, no extra props outside footprints, actual transparent alpha. Buildings separated, fully uncropped. Keep identity and approved architecture style, redesign to calibrated camera.

