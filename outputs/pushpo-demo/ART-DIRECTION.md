# Pushpo: perspective and motion revision

Generated with the built-in image-generation tool. The game retains the existing Pushpo front sprite and portrait; no API/CLI image-generation fallback was used. Each final asset is stored inside `dist/assets/` and embedded in the standalone download.

## Final asset briefs and prompt set

### Bosses — `bosses-v3.png`

Reference: the existing character atlas. Three adult Bangladeshi male fictional boss sprites, isolated on transparency, equal columns and aligned feet, polished illustrated mobile-game style, elevated orthographic three-quarter view.

- Sumon Mia: strong, bearded; vivid royal blue button-up shirt, black trousers, black shoes.
- Hafizur Rahman: broad middle-aged man with a trimmed beard; army green collared shirt, dark olive trousers, brown shoes.
- Sohel Rana: very skinny and gaunt, tired sunken eyes, unkempt hair, uneven stubble, slightly hunched; loose black shirt, black trousers, worn dark shoes.

Full-body neutral poses, hands away from torso, no weapons or drug paraphernalia, no writing or backdrop.

### Rear views — `backs-v3.png`

References: existing characters and the new boss atlas. A five-column/two-row turnaround atlas, all subjects facing away toward upper right, visible backs of heads and clothing. Preserve the reference designs and adult proportions. Ordered rows: Pushpo, maroon-shirt man, cream-shirt man, mustard-shirt man, purple-clothed woman; white-panjabi man, green-shirt man, Sumon, Hafizur, Sohel. Isolated full bodies, separated feet, transparent background, no floor, shadows, or text.

### Street props — `props-v3.png`

Reference: the illustrated Mirpur buildings. Equal 2×2 atlas: red/green Dhaka bus, decorated cycle rickshaw, wooden fruit cart with bananas/mangoes/papayas/limes and a red parasol, tea counter with kettle/cups/biscuit jar/red stool. All use the same elevated orthographic 2:1 isometric camera, warm light from upper left, and rich painted detail. Transparent background, no people, floor tiles, or lettering.

The final layout edit preserves these designs while keeping every prop inside its own quarter, with generous transparent space and no overlap or clipping.

### City expansion — v4 atlases

- `people-v4.png`: transparent 1536×1024 atlas, four columns and two rows. Columns: gaunt adult men in ragged gray, olive and maroon clothing, then a homeless adult in worn teal clothing carrying a bundle. Front three-quarter views in row one, matching rear views in row two. Slim silhouettes, worn seams and torn fabric; no drug paraphernalia. The first three columns are snatcher variations. Homeless status is a civilian role, not an enemy type.
- `city-v4.png`: transparent 1254×1254 atlas, 2×2. Red tea shop, blue grocery, cream apartment building, aged green pharmacy. Warm illustrated Dhaka storefronts, Bengali signage, balconies, rooftop tanks, plants and awnings; same elevated isometric camera as retained buildings.
- `street-v4.png`: transparent 1254×1254 atlas, 2×2. Green CNG, utility pole with cables, rooftop parapet with tank/laundry/plants, produce stall. Separate cutouts with clear cell boundaries, warm painted shading, no people or ground plane.

These atlases were generated with the built-in image tool and edited for transparent cell separation. All original artwork remains in use. Rapists reuse regular civilian artwork and markers until Sight; appearance must not disclose their identity. Shared character selection is in `dist/city-systems.mjs`.

The metro uses code-drawn carriage roofs, windows, green stripes, bogies, lights, elevated rails, pillars and a corrugated station canopy. The simulation controls movement and dwell; the renderer interleaves carriages with the existing world depth list. New planters and benches reuse `decor-v3.png`.

### Environment polish — v5

Retained building art uses two calibrated facade transforms from left/front/right ground anchors in `dist/environment-v5.mjs`. The transforms preserve vertical walls, align both base edges to the 2:1 footprint, and keep storey height independent of lot width. Tea/pharmacy footprints were made shallower; five landmark placements now clear streets. Floating rooftop overlays were removed; tanks, plants and laundry within the approved building artwork remain.

`dist/assets/rickshaw-v5.png` is a new transparent 1536×1024 turnaround atlas made with the built-in image tool, using `props-v3.png` as style reference. Eight views in row order: right, down-right, down, down-left; left, up-left, up, up-right. Drivers wear cream shirts and blue lungis. The renderer uses measured crop regions rather than cutting through wheels at nominal cell edges. Spokes rotate with traveled distance; the body has subtle riding motion. Original parked rickshaw artwork remains.

Prompt set used:

1. Generate one production atlas of the same floral green/red Dhaka cycle rickshaw and seated adult driver in eight screen directions; elevated orthographic 2:1 camera, four columns/two rows, transparent background, warm painterly mobile-game style, no passengers, labels, ground or unrelated props. Preserve the reference vehicle's hood, thin wheels and rich detailing; driver in cream shirt, blue lungi and sandals.
2. Background extraction only: remove the brown/gold/gray backdrop and ground shading, including between spokes; preserve all eight vehicles, drivers, order, sizes and details; output true transparent RGBA with no replacement backdrop.
3. Layout edit only: shrink individual sprites to 78%, center in their four-column/two-row cells with transparent margins, preserve designs/directions, and prevent clipping. Final crop regions were measured from alpha because some wheels still extend beyond nominal cell edges.

Roadside litter is code-drawn into the existing ground bake: faded plastic bottles, paper sheets, colored wrappers and small cartons. Curb placement excludes driving lanes, roundabout centers and existing solid props. It has no collision radius.

### Street decoration — `decor-v3.png`

Reference: the illustrated buildings. Four isolated objects in a 2×2 atlas: a lush tropical tree with detailed green/yellow-green leaves and a visible brown trunk; a curved dark-metal streetlamp with amber lantern; pink bougainvillea in a clay planter; a wooden bench with dark metal legs. Match the warm painted style and isometric camera. No people, text, floor tiles, or shadows. The game currently uses the tree and lamp.

## Motion and perspective

### Hercules and Stage 2 — v8

`assets/hercules-v8.png` is a 1536×1024 RGBA two-view atlas generated from the user's supplied character reference, with the existing boss sheet as a style reference. Left: front three-quarter; right: rear three-quarter. Retain the hood, opaque angular mask, violet eye slits, gloves, belt, trousers and heavy boots. The existing cutout rig provides walking and contact strikes. Aura swirls, motes and a ground ellipse are live purple drawing commands with front/back layering, separate from Pushpo's gold fish. Full provenance and exact prompt: `../HERCULES-INTEGRATION.md`.

The introduction uses connected streets with a genuine corner turn, a camera focus transition and letterboxing. Nearby unrelated NPCs fade temporarily to keep the speakers readable; they remain in the scene. Completed combat trails are cleared after the Hafizur note, before the approach. Bengali conversation cards reuse the existing story presenter and styles, add speaker portraits, and split long turns only at paragraph boundaries. Both the game and `qa-story.html` use `story-ui-v8.mjs`; no alternate subtitle implementation is maintained.

### Combat — v7

Slap, punch and kick use distinct cutout poses driven by `combat-v7.mjs`; maximum extension matches contact time. Slap uses an open-hand swing, punch a forward fist and kick a raised leg. Contact sparks, recoil, flash and stagger follow actual simulation hits. Pushpo's arm texture is baked from retained front/rear art with stray red scarf fragments removed below the sleeve; no source PNG is replaced. Water Mirror draws a translucent teal/gold full-body water bubble behind and in front of Pushpo, with a reflective rim, rising droplets and a deflection flash. Protection lasts exactly three seconds; a .45-second cosmetic dissolve adds no protection. The existing fish aura remains.

The touch combat pad is two columns and grows from two attacks to four actions as powers unlock. Slap uses a palm icon; Punch & Kick pairs a fist with a boot; Sight retains the eye; Mirror uses a shield with scale arcs. Dodge remains adjacent. Unlock notices use the existing gold/navy palette.

### Environment and story — v6

Road surfaces use a seeded charcoal asphalt bake with fine aggregate, warm light and faint wear; paved sidewalks remain. Utility placements use world/screen spacing instead of per-segment duplicates. All existing PNG atlases remain in use.

The metro reference is interpreted through the shared projection: cream concrete deck and flared piers, blue-gray catenary masts/wires, cream-white rolling stock with dark windows, green cab, red lower trim and roof equipment. Carriages retain real simulation positions, both directions, station dwell and the existing game clock.

Home portals reuse building entrances with a warm animated doorway and walking/fading transition. Indoor residents are not rendered. Boss verdicts use a gold burst and readable Bengali note; the reflection uses a cooler blue-green card. Arrival animation respects reduced-motion preferences; long notes scroll within the viewport. Canonical text is in `dist/story-v6.mjs`.

Animation is produced in the renderer from the approved artwork: independent leg and arm rotations, alternating weight shift, front/rear selection, and idle/talking gestures. Combat adds arm windup and striking poses driven by actual simulation attack phases for Pushpo and enemies, including bosses. It is a lightweight 2D cutout animation, not a 3D model.

The map projects all world coordinates through the same 2:1 camera. Screen controls are transformed back into world directions. Projected feet/footprints establish draw order. Occluding foreground objects fade around Pushpo. The north-up district map preserves the supplied street relationships.

## Final group (Stage 3)
Sohel retains the approved black-shirt, black-trouser front/rear atlas appearance. Both companions use `assets/companions-v12.png`: a balding, narrow-faced ochre-vest man and a long-haired, bearded slate-blue-shirt man, each with matching rear artwork and the existing cutout rig. Live hand-attached weapons distinguish the small knife from long, worn machetes; Hercules remains unarmed and alternates punch/kick poses. Violet bands and a spreading ground pulse communicate his three-second freeze. Health and freeze cooldown share the HUD. Foreground transparency includes the final group, and their nameplates are vertically separated when projected bounds overlap. Static shared-renderer reviews: `../pushpo-final-character-review.png`, `../pushpo-final-scene.png`, `../pushpo-final-phone-canvas.png`; these do not verify browser typography or GPU output.

## World lighting and fuchka
Three retained tea-cart sprites are dressed with baked fuchka platters, tamarind sauce and FUCHKA signs; reuse the existing adult pedestrian atlas for vendors. The single 200×220 cart texture is baked at startup. Scene positions live in `dist/scene-v3.mjs`; food rules and phase timing in `dist/world-v10.mjs`. The world lighting pass uses fixed-color gradients with changing opacity, a cool night wash and bounded warm lamp pools; effects/guidance remain on top. Ground litter now has six varieties and is still baked once. Static shared-renderer review: `../pushpo-world-day.png`, `../pushpo-world-dusk.png`, `../pushpo-world-night.png`, `../pushpo-world-dawn.png`, `../pushpo-world-phone-canvas.png`, `../pushpo-world-detail-review.png`. These do not verify browser typography or GPU performance.

## Four-lane main roads
Begum Rokeya Sarani and Mirpur Road use two lanes in each direction, double yellow center lines, white lane dividers, directional arrows and full-width crossings. The central roundabout has two circulating lanes. Markings share the ground projection and are baked once by `dist/boulevards-v11.mjs`; crossing and roundabout interiors clip approaching paint. Retained buildings, curb props and activity entrances sit outside the widened carriageways. Static shared-renderer reviews: `../pushpo-boulevards-day.png`, `../pushpo-boulevards-night.png`, `../pushpo-boulevards-phone-canvas.png`; these are not browser screenshots.

## Identity, stalls and calibrated city — v12
The four city storefront types use `assets/city-v12.png`, retaining the red tea shop, blue grocery, cream apartment and green pharmacy identities. Measured crop regions keep complete source buildings together; their ground anchors in `environment-v5.mjs` rectify both facades to the shared footprint. Original city-v4 artwork remains on disk.

Exactly three fuchka counters are baked from code: striped canopy, Bengali sign, glass shell display, bowls of filling/tamarind water, spoon, utensil jar and wooden counter. Sellers retain their civilian art with distinct aprons. Nearby decorative trees/planters/lamps clear the counters; food props do not become transparent around their seller.

All enemy identity presentation requires active, unlocked Sight in range, including bosses. Ordinary appearances and blue diamonds return when Sight ends. Final weapons share the arm shoulder transform and hand endpoint through walking, wind-up, contact and recovery. The pause control has a visible label; the existing menu retains Resume and Restart.

Built-in image-generation prompts, asset provenance and validation limits: `../PUSHPO-INTEGRATION-UPDATE.md`. Static shared-renderer reviews: `../pushpo-v12-building-review.png`, `../pushpo-v12-character-review.png`, `../pushpo-v12-combat-review.png`, `../pushpo-v12-stall-1.png`, `../pushpo-v12-stall-2.png`, `../pushpo-v12-stall-3.png`, `../pushpo-v12-bubble.png`, `../pushpo-v12-phone-canvas.png`.
