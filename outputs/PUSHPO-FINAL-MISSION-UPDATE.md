# Pushpo — Final Mission & Ending

Stage 3 is integrated into the existing demo. Download/open `pushpo-play.html` beside this report; refresh any previously opened copy. No Stage 4 content is added.

## Implemented
- Existing Sumon and Hafizur story transitions remain. After Hercules's introduction, exploration and independent hunts continue while he investigates. A completed case after 30 seconds, or a 90-second fallback, sends him physically to East Junction roundabout.
- Hercules's arrival starts one visible 60-second rescue deadline and one group spawn. Missing the deadline kills Hercules and ends the run. Arrival latches permanently; leaving/re-entering does not restart it. Pause, map, journal and reader-paced story retain their pause behavior.
- Sohel: 300 maximum health and a small knife. Companions: 200 each, one on either side, carrying long worn machetes. Health derives from the ordinary murderer's 100 maximum. Their skinny front/rear cutouts reuse Sohel's approved appearance with narrower companion proportions and distinct clothing repairs.
- Hercules: punches/kicks, contact-time hits, target switching, guarding, evasive navigation and real damage. His 360-health encounter balance preserves a viable rescue window in the tested populated seeds. His nearby-enemy freeze lasts three seconds and shares a twelve-second cooldown, with violet bindings/pulse and HUD feedback. Both allies must survive the fight.
- Defeating all three enemies, in any order, opens eight Bengali farewell cards. They establish the sixty-day borrowed lifespan, her few remaining days, suffering, a request to protect innocents and preserve the light, and Hercules's promise/farewell. The game ends only after the final card is dismissed. Killing Sohel alone cannot win.
- Shared foreground fading now includes the final group; their nameplates separate when projected bounds overlap. Existing NPCs, traffic, metro, abilities, assets and earlier story events remain.

## Verification
- **83 / 83 automated tests passed**, including ten final-mission tests: actual boss-to-mission progression; one-time spawns; 60-second expiry and boundary arrival; pause and re-entry; maximum health/weapons; three-second immobilization/twelve-second cooldown; Hercules contact attacks, guarding, damage and target changes; full-health 700-point group defeat; required all-three victory; one-time Bengali farewell; failure/restart; on-foot rescue route; full-crowd traffic clearance and survival across three seeds.
- **3 / 3 mutation checks caught** intentional civilian-protection, countdown and obstruction faults.
- Portable scripts parse, use embedded local assets and match `dist/offline.html`; canonical entry/snapshot match. Download: approximately 31.4 MiB.
- Shared Canvas renderer inspected at 1280×800 and 544×884, plus a weapon/character pose review. These are static engine renders, not browser screenshots.
- Browser preview remained blocked by a local HTTP timeout. **Live WebGL output, responsive HUD/subtitle layout, Bengali font shaping and touch interaction remain UNCONFIRMED.** No automated simulation regression remains known.

## Review paths
- Mission, balance and final Bengali dialogue: `pushpo-demo/dist/final-v9.mjs`.
- Browser scenario: `/qa-final.html` after running the preview command in the root `AGENTS.md`. Start rescue → Arrive on time → Defeat group → read the farewell; Miss deadline tests failure. This QA page uses the real engine and shared subtitle presenter.
- Actual responsive game: `/qa-responsive.html`. Existing story transitions: `/qa-story.html`.
- Static reviews: `pushpo-final-character-review.png`, `pushpo-final-scene.png`, `pushpo-final-phone-canvas.png`.
- Reproducible render helper: `../work/render-final-v9.mjs`; full test command: root `AGENTS.md`.

## Change summary
Added `dist/final-v9.mjs`, `dist/qa-final.html` and `tests/final-v9.test.mjs`. Extended existing engine, Hercules AI, subtitle presenter, rendering, HUD/CSS and portable exporter. Updated prior progression tests to use the actual final group/farewell, documentation and session handoff. No commit, push or deployment was performed.
