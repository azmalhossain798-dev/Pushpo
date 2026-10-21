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

### Street decoration — `decor-v3.png`

Reference: the illustrated buildings. Four isolated objects in a 2×2 atlas: a lush tropical tree with detailed green/yellow-green leaves and a visible brown trunk; a curved dark-metal streetlamp with amber lantern; pink bougainvillea in a clay planter; a wooden bench with dark metal legs. Match the warm painted style and isometric camera. No people, text, floor tiles, or shadows. The game currently uses the tree and lamp.

## Motion and perspective

Animation is produced in the renderer from the approved artwork: independent leg and arm rotations, alternating weight shift, front/rear selection, and idle/talking gestures. It is a lightweight 2D cutout animation, not a 3D model.

The map projects all world coordinates through the same 2:1 camera. Screen controls are transformed back into world directions. Projected feet/footprints establish draw order. Occluding foreground objects fade around Pushpo. The north-up district map preserves the supplied street relationships.
