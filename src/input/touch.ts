import type { Command, CommandSink } from './commands';

/** Minimum finger travel (CSS px) for a gesture to count as a swipe. */
export const SWIPE_THRESHOLD = 24;

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Classifies a finger displacement as a swipe direction.
 * Returns undefined when the travel is below the threshold (i.e. a tap).
 * Screen coordinates: +y is down.
 */
export function classifySwipe(
  dx: number,
  dy: number,
  threshold: number = SWIPE_THRESHOLD,
): Direction | undefined {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < threshold) return undefined;
  if (ax > ay) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export interface TouchTracker {
  begin(x: number, y: number): void;
  /** Ends the gesture: dispatches a swipe direction, or `start` for a tap. */
  end(x: number, y: number): Command | undefined;
  cancel(): void;
}

export function createTouchTracker(
  sink: CommandSink,
  threshold: number = SWIPE_THRESHOLD,
): TouchTracker {
  let origin: { x: number; y: number } | undefined;
  return {
    begin(x, y) {
      origin = { x, y };
    },
    end(x, y) {
      if (!origin) return undefined;
      const { x: ox, y: oy } = origin;
      origin = undefined;
      const command: Command = classifySwipe(x - ox, y - oy, threshold) ?? 'start';
      sink.dispatch(command);
      return command;
    },
    cancel() {
      origin = undefined;
    },
  };
}

export interface TouchPointLike {
  clientX: number;
  clientY: number;
}

export interface TouchEventLike {
  changedTouches: ArrayLike<TouchPointLike>;
  preventDefault(): void;
}

export type TouchEventType = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';

export interface TouchTarget {
  addEventListener(type: TouchEventType, listener: (e: TouchEventLike) => void): void;
  removeEventListener(type: TouchEventType, listener: (e: TouchEventLike) => void): void;
}

/**
 * Attaches swipe/tap handling. All touch events are default-prevented so the
 * page never scrolls or zooms from gestures on the target. Returns a detach function.
 */
export function attachTouch(
  target: TouchTarget,
  sink: CommandSink,
  threshold: number = SWIPE_THRESHOLD,
): () => void {
  const tracker = createTouchTracker(sink, threshold);
  const onStart = (e: TouchEventLike) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    if (t) tracker.begin(t.clientX, t.clientY);
  };
  const onMove = (e: TouchEventLike) => e.preventDefault();
  const onEnd = (e: TouchEventLike) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    if (t) tracker.end(t.clientX, t.clientY);
    else tracker.cancel();
  };
  const onCancel = (e: TouchEventLike) => {
    e.preventDefault();
    tracker.cancel();
  };
  target.addEventListener('touchstart', onStart);
  target.addEventListener('touchmove', onMove);
  target.addEventListener('touchend', onEnd);
  target.addEventListener('touchcancel', onCancel);
  return () => {
    target.removeEventListener('touchstart', onStart);
    target.removeEventListener('touchmove', onMove);
    target.removeEventListener('touchend', onEnd);
    target.removeEventListener('touchcancel', onCancel);
  };
}

export const DPAD_BUTTONS: readonly { command: Direction; label: string }[] = [
  { command: 'up', label: '▲' },
  { command: 'left', label: '◀' },
  { command: 'right', label: '▶' },
  { command: 'down', label: '▼' },
];

export interface ButtonLike {
  className: string;
  textContent: string | null;
  setAttribute(name: string, value: string): void;
  addEventListener(type: 'pointerdown', listener: (e: { preventDefault(): void }) => void): void;
  appendChild(child: ButtonLike): unknown;
}

export interface DocumentLike {
  createElement(tag: string): ButtonLike;
}

/** Builds an on-screen d-pad inside `container`; each button dispatches its command on press. */
export function createDpad(doc: DocumentLike, container: ButtonLike, sink: CommandSink): void {
  const pad = doc.createElement('div');
  pad.className = 'dpad';
  pad.setAttribute('aria-label', 'Touch controls');
  for (const { command, label } of DPAD_BUTTONS) {
    const btn = doc.createElement('button');
    btn.className = `dpad-btn dpad-${command}`;
    btn.textContent = label;
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', command);
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sink.dispatch(command);
    });
    pad.appendChild(btn);
  }
  container.appendChild(pad);
}
