# AGENTS.md - Operational Guide

Keep this file under 60 lines. It's loaded every iteration.

Goal: a browser Frogger clone in TypeScript (HTML canvas, Vite, Vitest).
Done when: all tests pass (`npm run check` and `npm run test:e2e` are green and every spec requirement is covered by tests).

## Build Commands

```bash
npm run dev            # Vite dev server
npm run build          # Production build (tsc + vite build)
```

## Test Commands

```bash
npm test               # Vitest watch mode
npm run test:run       # Run tests once
```

## E2E / Visual (Playwright)

```bash
npm run test:e2e             # Playwright smoke + interaction tests
npm run test:e2e:update      # Update visual-regression baselines (only when a visual change is intended)
```

## Validation (run before finishing a task)

```bash
npm run check          # typecheck + lint + format check + unit tests (run once)
npm run test:e2e       # also run when the task touches rendering, input or UI
```

## Project Notes

- The project is NOT scaffolded yet. The first plan task is to bootstrap
  Vite + TypeScript (strict) + ESLint + Prettier + Vitest + Playwright and
  define the `check`, `test:run`, `build`, `test:e2e` scripts above.
- Keep game logic pure and separated from rendering (e.g. `src/game/*` has no
  DOM access) so it is unit-testable without a canvas.
- Use a fixed-timestep update with injectable `dt` so tests are deterministic.
- Render with canvas in `src/render/*`; keep it thin.
- Style: modern clean vector, drawn procedurally; palette lives in one theme module.
- Audio is WebAudio-synthesised; game logic emits events, audio subscribes.
- Input layer normalises keyboard/touch/gamepad into commands.
- Use a seeded RNG and fixed clock everywhere so tests/screenshots are deterministic.
- Hosting: Netlify static site (`netlify.toml`, publish `dist`). Never run netlify
  deploy commands from the loop; the owner deploys manually.
- Add learnings from iterations below.
