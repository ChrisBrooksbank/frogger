# Input Devices

## Overview

Players can control the frog with keyboard, touch/swipe or a gamepad, all producing the same hop commands.

## User Stories

- As a desktop player, I want keyboard controls so that I can play with arrows or WASD.
- As a mobile player, I want swipe and on-screen buttons so that I can play on a phone.
- As a gamepad player, I want to use my controller so that I can play from the couch.

## Requirements

- [ ] An input layer normalises all devices into `up | down | left | right | start | pause | mute` commands
- [ ] Keyboard: arrows and WASD, with no hop auto-repeat while held
- [ ] Touch: swipe in a direction hops once (minimum swipe distance threshold); a tap acts as `start` on title/gameover; on-screen d-pad shown on touch devices
- [ ] Gamepad: Gamepad API polling; d-pad and left stick (with dead zone and edge-triggered hops); Start button = start/pause
- [ ] Canvas scales responsively to the viewport, preserving aspect ratio, with touch controls not overlapping the playfield
- [ ] Prevent page scroll/zoom from swipes on the canvas

## Acceptance Criteria

- [ ] Unit tests for swipe classification (direction, threshold), stick dead zone, and edge-triggering using mocked events/gamepad state
- [ ] Playwright test dispatches keyboard and touch input and verifies the frog moves

## Out of Scope

- Remappable controls
- Haptics
