# State — 2026-10-22 (after publication)

## Current goal
Live site now serves the v4–v12 integrations at https://pushpo.pages.dev; live device verification still pending; awaiting next direction.

## Done since last session
- Added six integration regressions: `outputs/pushpo-demo/tests/integration-v12.test.mjs`; preserved earlier simulation/story/traffic coverage.
- Exactly three bound fuchka sellers/counters, temporary Sight presentation, explicit Pause/Resume/Restart and updated one-shot Bengali verdict integrated into existing systems.
- Distinct companion front/rear sprites, hand-attached contact-timed machetes, three-second protective bubble and calibrated replacement city artwork integrated; original assets retained.
- 103/103 full tests and 32/32 final focused tests passed; 3/3 mutations caught. Rebuilt 33.7 MiB portable HTML; portable checks passed.
- Report, task diff, prompt provenance and review paths: `outputs/PUSHPO-INTEGRATION-UPDATE.md`. Static desktop/phone/character/building renders inspected.

## In progress
- No known automated simulation failure. Live WebGL, touch controls, browser typography/reflow and physical-device performance are UNCONFIRMED.

## Next 3 steps
1. When HTTP browser preview works, verify the actual game HUD/pause menu and Sight concealment at phone/desktop sizes.
2. Inspect `/qa-world.html`, `/qa-city.html`, `/qa-renderer.html` and `/qa-final.html` on a WebGL device; fix reproduced issues only.
3. Await user direction; edit canonical sources and regenerate portable output before relevant checks.

## Open questions / blockers
- New IAB request to the running local HTTP server returned ERR_CONNECTION_TIMED_OUT; prior file-URL restriction remains. Preview server started for this check was stopped.
- Static shared Canvas reviews and DOM-harness tests do not verify GPU output, real touch, browser Bengali shaping or mobile frame rate.

## Known gotchas
- Reload/reopen `outputs/pushpo-play.html` for changed embedded code and artwork; generated deliverables are gitignored.
- Identity rules/cover selection: `dist/city-systems.mjs`; combat eligibility remains separate so opening attackers are fightable.
- Food ownership: `dist/world-v10.mjs`; canonical stall positions: `dist/scene-v3.mjs`. Meals reset only with a new run.
- New city crops: `dist/art-v3.mjs`; ground anchors: `dist/environment-v5.mjs`; asset lists must match `work/export-demo.mjs`.
- Machete contact state: `dist/final-v9.mjs`; shared pose: `dist/combat-v7.mjs`. Cosmetic Mirror dissolve must never extend protection.
- Existing road layout, 180 NPCs, 14 moving rickshaws, three bosses, Hercules/final rescue and story progression retained.
- Publication: commit `ea4600a` (135 files) pushed to `origin/main`, Pages build `0295c816` deployed; serving verified (`boulevards-v11.mjs`, Hercules ally HUD present). Every pushed change auto-deploys, so run relevant checks before pushing.
- Static review helper: `work/render-v12.mjs`. Read AGENTS for commands; never run `work/prepare-v3.mjs`.
