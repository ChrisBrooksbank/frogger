# Player Movement

## Overview

The player controls a frog that hops one grid cell at a time across the playfield.

## User Stories

- As a player, I want to hop up, down, left and right with the keyboard so that I can navigate traffic and river.
- As a player, I want the frog to stay inside the playfield so that I can't hop off-screen.
- As a player, I want to lose a life when I die and respawn at the start so that I can try again.

## Requirements

- [ ] Playfield is a grid (13 columns x 13 rows): start row, road lanes, median, river lanes, goal row
- [ ] Arrow keys and WASD each move the frog exactly one cell per key press (no auto-repeat while held)
- [ ] Hops are discrete; input during an in-progress hop animation is ignored or buffered (one deep)
- [ ] Frog cannot move outside the grid bounds
- [ ] Frog starts at bottom-centre; respawns there after death
- [ ] Player starts with 3 lives; each death costs one life
- [ ] Movement and state logic is pure/testable without a canvas

## Acceptance Criteria

- [ ] Unit tests cover movement in all four directions and each boundary
- [ ] Unit tests cover life loss and respawn position
- [ ] Holding a key produces a single hop

## Out of Scope

- Touch/gamepad input (see input-devices.md)
- Collision with vehicles or water (see traffic-and-river.md)
