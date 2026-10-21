# Pushpo — The Golden Return

Pushpo is a mobile/browser 2D game set in fictionalized Mirpur, Dhaka.
Players guide an adult protagonist through supernatural perception, timed combat, and three bosses.
The playable district combines isometric streets with animated characters and civilian activities.

## Stack and commands
- HTML/CSS, JavaScript ES modules, PixiJS 8.22.0 / WebGL, Web Audio; Node built-ins for serving, tests, and export.
- PixiJS is vendored locally; no package installation, framework, or compilation step. Canvas 2D bakes textures and draws UI maps.
- Run commands from this workspace root:
  - Preview: `node outputs/pushpo-demo/serve.mjs` → `http://127.0.0.1:4173/`
  - Tests: `node --test outputs/pushpo-demo/tests/engine-v3.test.mjs outputs/pushpo-demo/tests/scene-v3.test.mjs outputs/pushpo-demo/tests/pixi-migration.test.mjs outputs/pushpo-demo/tests/portable.test.mjs`
  - Build portable HTML: `node work/export-demo.mjs`
  - Mutation checks: `node work/check-pixi-mutations.mjs`
- Rebuild before portable tests. HTTP QA: `/offline.html`, `/qa-renderer.html`, `/qa-responsive.html`, `/qa-character-motion.html`.

## File map
Paths below are root-relative; `D` means `outputs/pushpo-demo/dist` in prose only.
- `D/index.html`: canonical entry, opening story, HUD, controls; `D/index-v3.html`: matching snapshot.
- `D/style-v2.css`: active responsive styles despite the v2 suffix.
- `D/scene-v3.mjs`: projection, landmarks, solid props, activity locations.
- `D/engine-v3.mjs`: simulation, balance constants, road graph, AI, combat, progression.
- `D/art-v3.mjs`: shared scene drawing, asset loading, cutout rig, depth order, maps; Canvas baseline available for QA.
- `D/pixi-renderer.mjs`: application, resize/DPR, render and disposal; `D/pixi-draw.mjs`: pooled Pixi drawing backend.
- `D/vendor/`: pinned PixiJS browser distribution, license, upstream integrity and upgrade notes.
- `D/game-v3.mjs`: input, UI, audio, pause state, frame loop.
- `D/assets/`: PNG atlases and portrait; active asset list is in the renderer and exporter.
- `outputs/pushpo-demo/tests/`: active v3 tests; earlier tests cover legacy implementations.
- `outputs/pushpo-demo/README.md`: controls, balance, content limits, operating notes.
- `outputs/pushpo-demo/ART-DIRECTION.md`: approved designs, asset briefs, motion approach.
- `outputs/pushpo-demo/.openai/hosting.json`: retained Sites identity; inspect only for hosting work.
- `work/export-demo.mjs`: bundles active sources/assets into `outputs/pushpo-play.html` and `D/offline.html`.
- `work/`: scratch and backups; `work/prepare-v3.mjs` is a one-time migration, not a build command.
- `outputs/`: user deliverables, game project, screenshots; `.context/`: session handoff files.

## Conventions and hard rules
- Match nearby compact JavaScript style: `.mjs`, named exports, semicolons, single-quoted strings; avoid unrelated formatting.
- Keep simulation DOM-free and seeded; use the shared projection for rendering and inverse input mapping.
- Keep one game animation loop in `game-v3.mjs`; Pixi automatic/shared tickers stay disabled. Dispose listeners, observers, audio and GPU resources.
- Preserve shared scene commands for Canvas/Pixi visual comparison; implement added live drawing operations in `pixi-draw.mjs`.
- The exporter concatenates modules: retain single-line semicolon-terminated imports and unique top-level names across bundled modules.
- Update renderer/exporter asset lists together; preserve offline play with local assets.
- Edit canonical sources, then regenerate portable HTML; never hand-edit or dump large embedded/base64 HTML into context.
- Keep the entry snapshot aligned when changing `D/index.html`; do not edit inactive v1/v2 files as the current game.
- Do not rerun `work/prepare-v3.mjs`: it overwrites newer sources and can duplicate intro content.
- Preserve story/content constraints in README and approved character designs in ART-DIRECTION unless explicitly changed.
- Run checks relevant to changed behavior; visually verify renderer/UI changes at desktop and phone sizes.
- Do not infer live hosting from the local manifest or start a new Sites identity for this project.
- Keep user-facing deliverables in `outputs/`; keep context free of credentials, personal data, and machine-specific absolute paths.

## Session protocol
START: read AGENTS.md and .context/STATE.md only. Open DECISIONS.md or GLOSSARY.md only when the task touches them. Then confirm the current goal and next step in 2 lines before working.
DURING: when a real decision is made, append it to DECISIONS.md immediately.
END (or when I say "checkpoint"): rewrite STATE.md from scratch so it reflects now, not history. Delete anything finished or no longer true. Move durable rules into AGENTS.md. Show me a diff summary.

## Context maintenance
- `AGENTS.md`: stable guidance, maximum 120 lines; `.context/STATE.md`: current handoff, maximum 50 lines.
- `.context/DECISIONS.md`: append-only, one costly-to-revisit decision per line: `YYYY-MM-DD | decision | why | files affected`.
- `.context/GLOSSARY.md`: domain terms only, `term: one-line meaning`; open only when relevant.
- Store facts and paths, not conversation history; never duplicate existing code/docs/context.
- Mark unverifiable facts `UNCONFIRMED`; ask only about those. Compress before exceeding line limits.
