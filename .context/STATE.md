# State — 2026-10-21

## Current goal
PixiJS migration complete; ready for the next requested change.

## Done since last session
- Migrated live scene to pinned PixiJS; retained gameplay/map source byte-for-byte.
- Added renderer cleanup, pooled objects, offline dependency embedding and browser QA pages.
- Passed 19 Node tests, 11 browser fixture checks and 3 mutation checks.
- Verified live combat, controls, character poses, bosses and desktop/phone-size layouts.
- Refreshed download; validation scope and limits: `outputs/PUSHPO-PIXI-MIGRATION.md`.

## In progress
None.

## Next 3 steps
1. Take the next requested change; do not invent a backlog.
2. Inspect affected files using `AGENTS.md`; use QA pages for renderer changes.
3. Rebuild the portable edition, run relevant checks and rewrite this handoff.

## Open questions and blockers
- No implementation blocker. Distribution remains local/downloadable only.
- UNCONFIRMED: unattributed MutationObserver console message in embedded responsive QA; see validation report. Main/portable/motion checks were clean.

## Known gotchas still relevant
- WebGL required; static texture generation and UI maps still use Canvas 2D.
- GPU glow/text are not pixel-identical; device/browser coverage limits are in the validation report.
- A local Git repo at the workspace root tracks this workspace (generated files ignored, see `.gitignore`); no remote. Baseline copies: `work/pixi-migration-baseline/`; older `work/city-v4-baseline/`.
- Check preview processes/tabs each session; do not assume they survive.
