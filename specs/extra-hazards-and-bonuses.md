# Extra Hazards and Bonuses

## Overview

Diving turtles, crocodiles, snakes and a bonus fly/lady frog add variety and risk-reward to each level.

## User Stories

- As a player, I want turtles that dive so that river crossings require timing.
- As a player, I want crocodiles and snakes so that the river and median are not always safe.
- As a player, I want bonus pickups so that risky play is rewarded.

## Requirements

- [ ] Diving turtles: designated turtle groups cycle surfaced -> sinking (visual warning) -> submerged -> rising; frog on a submerged turtle drowns
- [ ] Crocodiles: appear on a river lane as platforms; the frog may ride the body but dies if on the head/jaws region, and may die if it enters a slot containing a crocodile
- [ ] Snakes: move along the median and/or on a log; touching one kills the frog
- [ ] Bonus fly: spawns randomly in an empty goal slot for a limited time; reaching it awards +200
- [ ] Lady frog: appears on a log; carrying her to a goal slot awards +200 (touching her picks her up)
- [ ] Spawn timing uses an injectable RNG so tests are deterministic
- [ ] Hazard/bonus counts and frequency scale or enable with level (e.g. crocodiles from level 2, snakes from level 3)
- [ ] All state and collision logic is pure and unit-tested

## Acceptance Criteria

- [ ] Tests cover the diving cycle timing and drowning on submerged turtles
- [ ] Tests cover crocodile head vs body, snake collision, fly scoring and lady-frog delivery
- [ ] Tests use a seeded RNG for spawns

## Out of Scope

- Otters
- Sound (see audio.md)
