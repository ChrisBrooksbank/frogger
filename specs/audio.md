# Audio

## Overview

Sound effects give feedback for key game events using the Web Audio API.

## User Stories

- As a player, I want sound feedback for hops, deaths and goals so that the game feels responsive.
- As a player, I want to mute the game so that I can play quietly.

## Requirements

- [ ] Effects: hop, splat (vehicle death), splash (drowning), goal reached, bonus pickup, level complete, game over
- [ ] Sounds are synthesised with WebAudio (oscillators/noise); no external audio assets
- [ ] AudioContext is created/resumed only after the first user gesture (browser autoplay policy)
- [ ] Mute toggle (M key and a UI button), state persisted in localStorage with safe fallback
- [ ] Game logic emits events; a separate audio module subscribes, so logic stays pure and testable
- [ ] Audio failures (unsupported API) never break the game

## Acceptance Criteria

- [ ] Tests verify the correct event maps to the correct sound using a mocked audio player
- [ ] Tests verify mute persistence and that muted state plays nothing
- [ ] Game runs normally with the AudioContext unavailable

## Out of Scope

- Background music
- Volume slider
