import type { Command, CommandSink } from './commands';

/** Stick deflection below this magnitude is ignored. */
export const STICK_DEAD_ZONE = 0.5;

/** Standard-mapping button indices. */
const BUTTON_UP = 12;
const BUTTON_DOWN = 13;
const BUTTON_LEFT = 14;
const BUTTON_RIGHT = 15;
const BUTTON_START = 9;

export interface GamepadButtonLike {
  pressed: boolean;
}

export interface GamepadLike {
  buttons: readonly GamepadButtonLike[];
  axes: readonly number[];
}

type Held = Record<Command, boolean>;

function emptyHeld(): Held {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    start: false,
    pause: false,
    mute: false,
  };
}

/** Classifies a stick position into one direction (dominant axis), or undefined inside the dead zone. */
export function stickDirection(
  x: number,
  y: number,
  deadZone: number = STICK_DEAD_ZONE,
): 'up' | 'down' | 'left' | 'right' | undefined {
  if (Math.hypot(x, y) < deadZone) return undefined;
  if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
  return y > 0 ? 'down' : 'up';
}

/** Commands currently held by a single pad (d-pad + left stick directions, Start). */
export function commandsHeld(pad: GamepadLike): Set<Command> {
  const held = new Set<Command>();
  const pressed = (i: number) => pad.buttons[i]?.pressed === true;
  if (pressed(BUTTON_UP)) held.add('up');
  if (pressed(BUTTON_DOWN)) held.add('down');
  if (pressed(BUTTON_LEFT)) held.add('left');
  if (pressed(BUTTON_RIGHT)) held.add('right');
  if (pressed(BUTTON_START)) held.add('start');
  const dir = stickDirection(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
  if (dir) held.add(dir);
  return held;
}

export interface GamepadPoller {
  /** Reads the current pad state and dispatches commands on newly pressed inputs only. */
  poll(): void;
}

/**
 * Edge-triggered gamepad poller: a command fires once when it becomes held,
 * and not again until released. The Start button maps to `start` or `pause`
 * depending on `startCommand` (wired to the game state; defaults to `start`).
 */
export function createGamepadPoller(
  getPads: () => ReadonlyArray<GamepadLike | null | undefined>,
  sink: CommandSink,
  startCommand: () => 'start' | 'pause' = () => 'start',
): GamepadPoller {
  let previous = emptyHeld();
  return {
    poll() {
      const now = new Set<Command>();
      for (const pad of getPads()) {
        if (!pad) continue;
        for (const c of commandsHeld(pad)) now.add(c);
      }
      const next = emptyHeld();
      for (const c of now) {
        next[c] = true;
        if (!previous[c]) {
          sink.dispatch(c === 'start' ? startCommand() : c);
        }
      }
      previous = next;
    },
  };
}

/** Safe wrapper around navigator.getGamepads (absent or throwing in some browsers). */
export function browserGetPads(
  nav: { getGamepads?: () => ArrayLike<GamepadLike | null> } = navigator,
): ReadonlyArray<GamepadLike | null> {
  try {
    return nav.getGamepads ? Array.from(nav.getGamepads()) : [];
  } catch {
    return [];
  }
}
