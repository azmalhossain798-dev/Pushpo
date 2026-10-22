# Pushpo Stage 2 — Story and character progression

Download: `pushpo-play.html` (31.4 MiB). Reload the existing file tab or open the rebuilt download.

## Implemented
- The unknown golden fish shares part of its own life force, giving Pushpo only 60 days. The opening describes her apartment awakening, remembered conversation and decision to choose her path. The HUD carries the borrowed-life deadline. No calendar/day simulation was added.
- The opening button is Get Revenge, with its existing start behavior.
- Sumon's existing verdict and reflection remain. Actual defeat unlocks Water Mirror; its post-sequence notification explains automatic golden-scale protection and the shared 10-second cooldown.
- Hafizur's mission and exact defeat note remain. Dismissing the note starts Hercules's physical entrance from a connected street corner, followed by his approach and cinematic conversation.
- All seven supplied dialogue turns are retained across 12 paragraph-sized Bengali cards. The same subtitle presenter is used in the game and story QA page. Speaker portraits, camera focus, letterboxing, keyboard advance and scrolling support the sequence. Events trigger once per run and reset on restart.
- Hercules uses the supplied character reference: black hooded coat, angular mask, violet eyes, gloves, trousers and heavy boots. A new front/rear transparent atlas drives the existing walking/combat rig; his purple aura animates separately.
- He patrols independently, selects owned rapist cases, navigates real roads/traffic and resolves actual contact damage. Each of his kills records the exact pocket note: Be careful Rapist Hercules is coming. The Pocket notes journal exposes those records and pauses the world.
- Hercules kills do not award Pushpo points, defeats, health or unlock credit. If Pushpo intervenes against a Sight-revealed case target, her own combat credit works normally.
- After the introduction, Hercules investigates Sohel Rana while normal city exploration/combat remain available. Score cannot start the final mission. The interlude suspends the unavailable final-mission countdown; Stage 3 was not begun.

## Verification
73/73 regression tests passed, including 11 Stage 2 tests. Three intentional mutation faults were caught. Final guard and portable checks also passed after rebuilding.

Coverage includes both boss transitions, Mirror notification/cooldown, corner approach among retained crowds/rickshaws, once-only ordering, all dialogue paragraphs and speaker presentation, independent hunts, note deduplication, player reward isolation, RGBA atlas integrity, restart and the final-mission gate. Existing combat, NPC navigation, houses, metro, no-healing and portable/vendor regressions passed.

## Remaining verification limits
The local HTTP browser preview timed out again. Live WebGL, phone touch/layout and device Bengali typography remain UNCONFIRMED. The native Canvas scene/rig renders are static art checks, not browser screenshots. No known automated regression is failing.

Fast manual QA when preview access works: `/qa-story.html` uses the actual engine, sprites, subtitle presenter and CSS; `/qa-responsive.html` checks the real opening/game at different sizes. Sumon/Hafizur defeat controls and final-gate checks are QA-only.

## Files and previews
- Active behavior: `pushpo-demo/dist/story-v8.mjs`, `hercules-v8.mjs`, `story-ui-v8.mjs`, existing engine/game/rendering modules.
- Reference hashes, generated asset path and exact built-in imagegen prompt: `HERCULES-INTEGRATION.md`.
- Static previews: `pushpo-hercules-scene.png`, `pushpo-hercules-phone-canvas.png`, `pushpo-hercules-sprite-review.png`.
- Commands and balance: `pushpo-demo/README.md`.

This update did not commit, push or deploy.
