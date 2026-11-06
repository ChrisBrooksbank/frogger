# Traffic and River

## Overview

Moving hazards and platforms create the danger of crossing: vehicles kill on contact, and water kills unless the frog stands on a log or turtle.

## User Stories

- As a player, I want vehicles to move in lanes so that I must time my crossing.
- As a player, I want to ride logs and turtles so that I can cross the river.
- As a player, I want to die when hit or when I fall in water so that the game has risk.

## Requirements

- [ ] Road lanes contain vehicles moving at per-lane speeds and directions, wrapping around the screen edges
- [ ] Touching a vehicle kills the frog
- [ ] River lanes contain logs and turtles moving at per-lane speeds and directions, wrapping around
- [ ] Frog on river rows must overlap a platform, else it drowns
- [ ] A frog on a platform is carried horizontally at the platform's velocity
- [ ] Being carried off either side of the screen kills the frog
- [ ] Lane layout (speeds, spacing, object widths) is data-driven and deterministic
- [ ] Collision/overlap logic is pure and unit-tested

## Acceptance Criteria

- [ ] Tests cover vehicle collision, safe gap, drowning, riding a log, and being carried off-screen
- [ ] Tests verify wrap-around of lane objects
- [ ] Median/start/goal rows are safe from vehicles and water

## Out of Scope

- Diving turtles, crocodiles, snakes, bonus flies (see extra-hazards-and-bonuses.md)
- Otters
- Sound (see audio.md)
