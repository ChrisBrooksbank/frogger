import { describe, expect, it, vi } from 'vitest';
import { createCommandSink, type Command } from './commands';
import {
  attachTouch,
  classifySwipe,
  createDpad,
  createTouchTracker,
  DPAD_BUTTONS,
  SWIPE_THRESHOLD,
  type ButtonLike,
  type TouchEventLike,
  type TouchEventType,
} from './touch';

function setup() {
  const sink = createCommandSink();
  const got: Command[] = [];
  sink.subscribe((c) => got.push(c));
  return { sink, got };
}

describe('classifySwipe', () => {
  it('classifies the four directions', () => {
    expect(classifySwipe(0, -50)).toBe('up');
    expect(classifySwipe(0, 50)).toBe('down');
    expect(classifySwipe(-50, 0)).toBe('left');
    expect(classifySwipe(50, 0)).toBe('right');
  });

  it('picks the dominant axis for diagonals', () => {
    expect(classifySwipe(60, -30)).toBe('right');
    expect(classifySwipe(10, -40)).toBe('up');
  });

  it('returns undefined below the threshold and accepts at it', () => {
    expect(classifySwipe(SWIPE_THRESHOLD - 1, 0)).toBeUndefined();
    expect(classifySwipe(0, 0)).toBeUndefined();
    expect(classifySwipe(SWIPE_THRESHOLD, 0)).toBe('right');
    expect(classifySwipe(5, 5, 4)).toBe('down');
  });
});

describe('touch tracker', () => {
  it('dispatches one hop per swipe', () => {
    const { sink, got } = setup();
    const t = createTouchTracker(sink);
    t.begin(100, 100);
    t.end(100, 40);
    expect(got).toEqual(['up']);
  });

  it('treats a tap as start', () => {
    const { sink, got } = setup();
    const t = createTouchTracker(sink);
    t.begin(100, 100);
    t.end(102, 101);
    expect(got).toEqual(['start']);
  });

  it('ignores end without begin and after cancel', () => {
    const { sink, got } = setup();
    const t = createTouchTracker(sink);
    t.end(0, 0);
    t.begin(0, 0);
    t.cancel();
    t.end(100, 0);
    expect(got).toEqual([]);
  });
});

describe('attachTouch', () => {
  function makeTarget() {
    const listeners = new Map<TouchEventType, (e: TouchEventLike) => void>();
    return {
      listeners,
      target: {
        addEventListener: (t: TouchEventType, l: (e: TouchEventLike) => void) =>
          void listeners.set(t, l),
        removeEventListener: (t: TouchEventType, l: (e: TouchEventLike) => void) => {
          if (listeners.get(t) === l) listeners.delete(t);
        },
      },
    };
  }
  const ev = (x: number, y: number): TouchEventLike => ({
    changedTouches: [{ clientX: x, clientY: y }],
    preventDefault: vi.fn(),
  });

  it('swipes, prevents default on every event, and detaches', () => {
    const { sink, got } = setup();
    const { target, listeners } = makeTarget();
    const detach = attachTouch(target, sink);
    const start = ev(200, 200);
    const move = ev(150, 200);
    const end = ev(100, 200);
    listeners.get('touchstart')?.(start);
    listeners.get('touchmove')?.(move);
    listeners.get('touchend')?.(end);
    expect(got).toEqual(['left']);
    for (const e of [start, move, end]) expect(e.preventDefault).toHaveBeenCalled();
    detach();
    expect(listeners.size).toBe(0);
  });

  it('cancel aborts the gesture', () => {
    const { sink, got } = setup();
    const { target, listeners } = makeTarget();
    attachTouch(target, sink);
    listeners.get('touchstart')?.(ev(0, 0));
    listeners.get('touchcancel')?.(ev(0, 0));
    listeners.get('touchend')?.(ev(0, 100));
    expect(got).toEqual([]);
  });
});

describe('createDpad', () => {
  function fakeEl(tag: string): ButtonLike & {
    tag: string;
    children: ButtonLike[];
    press?: (e: { preventDefault(): void }) => void;
    attrs: Record<string, string>;
  } {
    const el = {
      tag,
      className: '',
      textContent: null as string | null,
      children: [] as ButtonLike[],
      attrs: {} as Record<string, string>,
      press: undefined as ((e: { preventDefault(): void }) => void) | undefined,
      setAttribute(n: string, v: string) {
        el.attrs[n] = v;
      },
      addEventListener(_t: 'pointerdown', l: (e: { preventDefault(): void }) => void) {
        el.press = l;
      },
      appendChild(c: ButtonLike) {
        el.children.push(c);
      },
    };
    return el;
  }

  it('creates four buttons that dispatch their commands', () => {
    const { sink, got } = setup();
    const container = fakeEl('div');
    createDpad({ createElement: fakeEl }, container, sink);
    const pad = container.children[0] as ReturnType<typeof fakeEl>;
    expect(pad.children).toHaveLength(DPAD_BUTTONS.length);
    const prevent = vi.fn();
    for (const b of pad.children as ReturnType<typeof fakeEl>[])
      b.press?.({ preventDefault: prevent });
    expect(got).toEqual(DPAD_BUTTONS.map((b) => b.command));
    expect(prevent).toHaveBeenCalledTimes(4);
  });
});
