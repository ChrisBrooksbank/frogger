# Scoring and Levels

## Overview

Reaching goal slots earns points, and filling all slots advances to a harder level.

## User Stories

- As a player, I want to score points for progress so that I have a goal to beat.
- As a player, I want to fill goal slots so that I complete a level.
- As a player, I want each level to be harder so that the game stays challenging.

## Requirements

- [ ] Goal row has 5 slots; reaching an empty slot fills it and respawns the frog at start
- [ ] Reaching a filled slot, or a gap between slots (the wall), kills the frog
- [ ] +10 points for each new furthest-forward row reached per life
- [ ] +50 points for filling a slot; +time-remaining bonus (10 per second)
- [ ] +1000 points for filling all 5 slots, then the next level starts with slots cleared
- [ ] Each level increases lane speeds by a fixed multiplier (e.g. +10%, capped)
- [ ] Extra life awarded at 20,000 points (once)

## Acceptance Criteria

- [ ] Tests cover each scoring rule, slot filling, wall death and filled-slot death
- [ ] Tests cover level progression and speed scaling including the cap
- [ ] Scoring logic is pure and independent of rendering

## Out of Scope

- Online leaderboards
- High score persistence (see game-flow-and-ui.md)
