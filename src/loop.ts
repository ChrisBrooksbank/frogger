import { createTimestep, FIXED_DT, type Timestep } from './game/timestep';

export interface LoopEnv {
  requestFrame(cb: (timeMs: number) => void): number;
  cancelFrame(id: number): void;
  isHidden(): boolean;
}

export interface Loop {
  start(): void;
  stop(): void;
  /** Called when page visibility changes; discards elapsed time so no catch-up burst occurs. */
  visibilityChanged(): void;
  readonly running: boolean;
}

export interface LoopCallbacks {
  /** Fixed-step simulation update. */
  update(dt: number): void;
  /** Called once per frame with interpolation alpha. */
  render(alpha: number): void;
  /** Called when the tab becomes hidden (e.g. to auto-pause). */
  onHidden?(): void;
}

/**
 * requestAnimationFrame loop with a fixed-timestep update. While the tab is
 * hidden no updates run; on return the elapsed gap is discarded.
 */
export function createLoop(
  env: LoopEnv,
  callbacks: LoopCallbacks,
  stepper: Timestep = createTimestep(FIXED_DT),
): Loop {
  let id = 0;
  let running = false;
  let last: number | null = null;

  const frame = (timeMs: number): void => {
    if (!running) return;
    id = env.requestFrame(frame);
    if (env.isHidden()) {
      last = null;
      return;
    }
    const elapsed = last === null ? 0 : (timeMs - last) / 1000;
    last = timeMs;
    stepper.advance(elapsed, callbacks.update);
    callbacks.render(stepper.alpha());
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = null;
      id = env.requestFrame(frame);
    },
    stop() {
      running = false;
      env.cancelFrame(id);
    },
    visibilityChanged() {
      last = null;
      stepper.reset();
      if (env.isHidden()) callbacks.onHidden?.();
    },
    get running() {
      return running;
    },
  };
}
