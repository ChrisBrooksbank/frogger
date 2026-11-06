import { describe, expect, it } from 'vitest';
import { createCommandSink, type Command } from './commands';
import { browserGetPads, createGamepadPoller, stickDirection, type GamepadLike } from './gamepad';

function pad(pressed: number[] = [], axes: number[] = [0, 0]): GamepadLike {
  const buttons = Array.from({ length: 17 }, (_, i) => ({ pressed: pressed.includes(i) }));
  return { buttons, axes };
}

function setup(startCommand?: () => 'start' | 'pause') {
  const sink = createCommandSink();
  const got: Command[] = [];
  sink.subscribe((c) => got.push(c));
  let current: GamepadLike | null = pad();
  const poller = createGamepadPoller(() => [current], sink, startCommand);
  return {
    got,
    poller,
    set: (p: GamepadLike | null) => {
      current = p;
    },
  };
}

describe('stickDirection', () => {
  it('ignores values inside the dead zone', () => {
    expect(stickDirection(0.3, 0.3)).toBeUndefined();
    expect(stickDirection(0, 0)).toBeUndefined();
  });
  it('classifies by dominant axis', () => {
    expect(stickDirection(0.9, 0.2)).toBe('right');
    expect(stickDirection(-0.9, 0.2)).toBe('left');
    expect(stickDirection(0.1, -0.9)).toBe('up');
    expect(stickDirection(0.1, 0.9)).toBe('down');
  });
});

describe('gamepad poller', () => {
  it('maps d-pad buttons', () => {
    const t = setup();
    for (const [btn, cmd] of [
      [12, 'up'],
      [13, 'down'],
      [14, 'left'],
      [15, 'right'],
    ] as const) {
      t.set(pad([btn]));
      t.poller.poll();
      t.set(pad());
      t.poller.poll();
      expect(t.got.at(-1)).toBe(cmd);
    }
    expect(t.got).toHaveLength(4);
  });

  it('is edge-triggered: holding fires once', () => {
    const t = setup();
    t.set(pad([12]));
    t.poller.poll();
    t.poller.poll();
    t.poller.poll();
    expect(t.got).toEqual(['up']);
    t.set(pad());
    t.poller.poll();
    t.set(pad([12]));
    t.poller.poll();
    expect(t.got).toEqual(['up', 'up']);
  });

  it('left stick respects the dead zone and is edge-triggered', () => {
    const t = setup();
    t.set(pad([], [0.2, -0.2]));
    t.poller.poll();
    expect(t.got).toEqual([]);
    t.set(pad([], [0, -1]));
    t.poller.poll();
    t.poller.poll();
    expect(t.got).toEqual(['up']);
    t.set(pad([], [1, 0]));
    t.poller.poll();
    expect(t.got).toEqual(['up', 'right']);
  });

  it('Start button emits start or pause depending on callback', () => {
    let mode: 'start' | 'pause' = 'start';
    const t = setup(() => mode);
    t.set(pad([9]));
    t.poller.poll();
    t.set(pad());
    t.poller.poll();
    mode = 'pause';
    t.set(pad([9]));
    t.poller.poll();
    expect(t.got).toEqual(['start', 'pause']);
  });

  it('handles missing pads and missing buttons', () => {
    const t = setup();
    t.set(null);
    expect(() => t.poller.poll()).not.toThrow();
    t.set({ buttons: [], axes: [] });
    t.poller.poll();
    expect(t.got).toEqual([]);
  });
});

describe('browserGetPads', () => {
  it('returns [] when unsupported or throwing', () => {
    expect(browserGetPads({})).toEqual([]);
    expect(
      browserGetPads({
        getGamepads: () => {
          throw new Error('x');
        },
      }),
    ).toEqual([]);
  });
});
