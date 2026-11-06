# Game Flow and UI

## Overview

The game presents a start screen, a playing HUD, a per-life timer and a game-over screen, and remembers the high score.

## User Stories

- As a player, I want a start screen so that I can begin when ready.
- As a player, I want to see score, lives, level and time so that I know my status.
- As a player, I want a game-over screen and a restart option so that I can play again.
- As a player, I want my high score remembered so that I can beat it later.

## Requirements

- [ ] State machine: `title` -> `playing` -> `gameover` -> `title` (Enter/Space to advance); optional `paused` via P/Escape
- [ ] Canvas renders the playfield, lanes, frog, vehicles, logs, turtles and goal slots (simple shapes/colours acceptable)
- [ ] HUD shows score, high score, lives, level and a time bar
- [ ] Each life has a 30 second timer; running out kills the frog
- [ ] Game over when lives reach 0; show final score and whether it is a new high score
- [ ] High score persists in localStorage, with safe fallback if unavailable
- [ ] Main loop uses requestAnimationFrame with a fixed-timestep update; pauses when the tab is hidden

## Acceptance Criteria

- [ ] Tests cover state transitions, timer expiry, game over, and high score save/load (with a mocked storage)
- [ ] `npm run build` succeeds and the app runs via `npm run dev`
- [ ] `npm run check` passes

## Out of Scope

- Sound (see audio.md) and music
- Touch controls and responsive scaling (see input-devices.md)
