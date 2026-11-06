# Implementation Plan

## Status

- Planning iterations: 49 (re-verified: no src/ or package.json; plan unchanged and valid; next step is build mode at Phase 0)
- Build iterations: 0
- Last updated: 2026-11-06
- Codebase state: empty (only specs, prompts, loop scripts, AGENTS.md, netlify.toml). Nothing implemented.

## Tasks (priority order; one task = one build iteration)

### Phase 0: Tooling
- [ ] Bootstrap Vite + TypeScript (strict) + ESLint + Prettier + Vitest; scripts `dev`, `build` (tsc + vite build), `test`, `test:run`, `lint`, `format:check`, `typecheck`, `check`; minimal `index.html` + `src/main.ts` + a trivial passing unit test (spec: all; AGENTS.md)
- [ ] Add Playwright with `test:e2e` / `test:e2e:update`, webServer on `vite preview` of the production build, one smoke test (canvas present, no console errors) (spec: deployment.md, visual-style.md)
- [ ] Vite `base: '/'`, README with dev/test/deploy steps (`npx netlify-cli deploy --build` and `--prod`; owner-run only), verify `netlify.toml` (already has build/publish/Node 22/headers) and that `dist/index.html` is produced. Do NOT run netlify commands (spec: deployment.md)

### Phase 1: Core logic (pure, in `src/game/*`, no DOM)
- [ ] Core utilities: seeded RNG (e.g. mulberry32), fixed-timestep accumulator with injectable `dt`, typed event emitter for game events (spec: all; AGENTS.md)
- [ ] Grid/config constants (13x13, row roles: start, road, median, river, goal) and frog state: one-cell hops in 4 directions, bounds clamping, start at bottom-centre, hop animation progress, one-deep input buffer, no auto-repeat (spec: player-movement.md)
- [ ] Lives (3), death -> lose life -> respawn at start; tests for movement per direction/boundary, life loss, respawn (spec: player-movement.md)
- [ ] Data-driven lane layout (speed, direction, spacing, object widths per lane) + lane object update with wrap-around; deterministic (spec: traffic-and-river.md)
- [ ] Vehicle collision (kills), safe gap, safe rows (start/median/goal) (spec: traffic-and-river.md)
- [ ] River logic: platform overlap check, drowning, carry at platform velocity, off-screen carry death (spec: traffic-and-river.md)
- [ ] Goal row: 5 slots, fill empty slot + respawn, wall/filled-slot death (spec: scoring-and-levels.md)
- [ ] Scoring: +10 new furthest row per life, +50 slot, +10/sec time bonus, +1000 all slots, extra life at 20,000 once (spec: scoring-and-levels.md)
- [ ] Levels: slots cleared on completion, per-level speed multiplier (+10%, capped), tests incl. cap (spec: scoring-and-levels.md)
- [ ] Per-life 30s timer; expiry kills frog (spec: game-flow-and-ui.md)
- [ ] Game state machine `title -> playing -> (paused) -> gameover -> title`; final score + new-high-score flag (spec: game-flow-and-ui.md)
- [ ] High score persistence via injectable storage with safe fallback (mocked storage tests) (spec: game-flow-and-ui.md)

### Phase 2: Input
- [ ] Input command layer + keyboard (arrows/WASD, ignore `event.repeat`, start/pause/mute keys) (spec: input-devices.md, player-movement.md)
- [ ] Touch: swipe classification (direction, min threshold), tap = start, preventDefault for scroll/zoom, on-screen d-pad (spec: input-devices.md)
- [ ] Gamepad polling: d-pad + left stick with dead zone, edge-triggered, Start = start/pause (spec: input-devices.md)

### Phase 3: Rendering and loop
- [ ] Theme module (palette + sizes; sole home of colour literals) (spec: visual-style.md)
- [ ] Canvas renderer base: DPR scaling, responsive aspect-preserving resize, playfield/lane backgrounds, frog (spec: visual-style.md, input-devices.md)
- [ ] Draw functions per entity: vehicles (several types), logs, turtles, goal slots (spec: visual-style.md)
- [ ] HUD (score, high score, lives, level, time bar) + title/game-over/pause screens, system font stack (spec: game-flow-and-ui.md, visual-style.md)
- [ ] Main loop: requestAnimationFrame + fixed timestep, pause on tab hidden, wire input -> game -> render; expose test hooks (seed, frozen clock/animations) (spec: game-flow-and-ui.md)
- [ ] Animations: hop arc/squash, water ripple, death splat/splash; all freezable under test (spec: visual-style.md)

### Phase 4: Extras
- [ ] Diving turtles cycle (surfaced/sinking/submerged/rising), drowning when submerged, sinking warning visual (spec: extra-hazards-and-bonuses.md)
- [ ] Crocodiles (body rideable, head kills, slot croc), enabled from level 2 (spec: extra-hazards-and-bonuses.md)
- [ ] Snakes (median/log), enabled from level 3 (spec: extra-hazards-and-bonuses.md)
- [ ] Bonus fly (+200, timed, seeded spawn) and lady frog (+200 delivered to slot) (spec: extra-hazards-and-bonuses.md)
- [ ] Draw functions for crocodiles, snakes, fly, lady frog (spec: visual-style.md)

### Phase 5: Audio
- [ ] Audio module: event -> sound mapping with injectable player (hop, splat, splash, goal, bonus, level complete, game over); WebAudio synth player; AudioContext created/resumed on first gesture; failure-safe (spec: audio.md)
- [ ] Mute: M key + UI button, localStorage persistence with safe fallback, muted plays nothing (spec: audio.md)

### Phase 6: E2E and visual
- [ ] Playwright interaction tests: keyboard hop moves frog, touch swipe moves frog, title -> playing -> gameover flow (spec: input-devices.md, game-flow-and-ui.md)
- [ ] Playwright visual-regression baselines: title, playing (seeded, paused frame), game-over (spec: visual-style.md)
- [ ] Final audit: walk every spec checkbox against tests; run `npm run check` and `npm run test:e2e` (spec: all)

## Cross-cutting requirements (from interview 2026-11-06)

- Visual style: modern clean vector, procedural canvas drawing (spec: visual-style.md)
- Extras: diving turtles, bonus fly/lady frog, crocodiles/snakes, sound effects
- Input: keyboard, touch/swipe, gamepad
- Testing: Vitest unit tests + Playwright interaction tests + visual-regression screenshots
- Determinism: seeded RNG, injectable clock, frozen animations under test

## Completed

<!-- Completed tasks move here -->

## Notes

- Suggested layout: `src/game/*` (pure logic), `src/input/*`, `src/render/*` (+ `theme.ts`), `src/audio/*`, `src/main.ts` wiring.
- Game logic emits events (hop, death-by-vehicle, drown, goal, bonus, level, gameover); audio and any effects subscribe.
- Storage (high score, mute) goes through an injectable interface wrapping localStorage in try/catch.
- `netlify.toml` already exists and satisfies headers/Node/publish requirements; do not run netlify deploys.
