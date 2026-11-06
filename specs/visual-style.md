# Visual Style

## Overview

The game uses a modern, clean vector look: smooth shapes, a cohesive palette and subtle animation, drawn procedurally on canvas.

## User Stories

- As a player, I want a polished, readable look so that hazards and platforms are instantly distinguishable.

## Requirements

- [ ] All sprites are drawn with canvas paths (no image assets); each entity type has a dedicated draw function
- [ ] A central theme module defines the palette and sizes; no colour literals elsewhere
- [ ] Distinct colours/shapes: road, grass/median, water, vehicles (several types), logs, turtles, crocodiles, snakes, frog, goal slots
- [ ] Subtle animation: hop arc/squash, water ripple, turtle sinking warning, death effects (splat/splash)
- [ ] Hazards must meet sufficient contrast against their lane background
- [ ] HUD and title/game-over screens use clean typography (system font stack)
- [ ] Rendering is crisp on high-DPI displays (devicePixelRatio scaling)

## Acceptance Criteria

- [ ] Playwright visual-regression screenshots for title, playing (seeded, paused frame) and game-over screens
- [ ] Rendering is deterministic under test (seeded RNG, fixed clock, animations frozen)

## Out of Scope

- Skins/themes
- Image or sprite-sheet assets
