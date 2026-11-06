import { describe, expect, it } from 'vitest';
import { createLoop, type LoopEnv } from './loop';

function fakeEnv() {
  let cb: ((t: number) => void) | null = null;
  const env: LoopEnv & { hidden: boolean; tick(t: number): void } = {
    hidden: false,
    requestFrame(c) {
      cb = c;
      return 1;
    },
    cancelFrame() {
      cb = null;
    },
    isHidden() {
      return env.hidden;
    },
    tick(t) {
      const c = cb;
      cb = null;
      c?.(t);
    },
  };
  return env;
}

describe('loop', () => {
  it('runs fixed updates and renders each frame', () => {
    const env = fakeEnv();
    let updates = 0;
    let renders = 0;
    const loop = createLoop(env, { update: () => updates++, render: () => renders++ });
    loop.start();
    env.tick(0);
    env.tick(1000 / 30); // two 1/60 steps
    expect(updates).toBe(2);
    expect(renders).toBe(2);
  });

  it('does not update while hidden and drops the gap on return', () => {
    const env = fakeEnv();
    let updates = 0;
    const loop = createLoop(env, { update: () => updates++, render: () => {} });
    loop.start();
    env.tick(0);
    env.hidden = true;
    env.tick(5000);
    expect(updates).toBe(0);
    env.hidden = false;
    env.tick(10000);
    expect(updates).toBe(0);
    env.tick(10000 + 1000 / 60);
    expect(updates).toBe(1);
  });

  it('notifies when the tab is hidden and stops cleanly', () => {
    const env = fakeEnv();
    let hidden = 0;
    const loop = createLoop(env, { update: () => {}, render: () => {}, onHidden: () => hidden++ });
    loop.start();
    env.hidden = true;
    loop.visibilityChanged();
    expect(hidden).toBe(1);
    loop.stop();
    expect(loop.running).toBe(false);
  });
});
