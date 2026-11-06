import { describe, expect, it } from 'vitest';
import { createEffects, DEATH_EFFECT_DURATION, hopPose } from './effects';

describe('hopPose', () => {
  it('is neutral when idle and lifts mid-hop', () => {
    expect(hopPose(1)).toEqual({ lift: 0, scaleX: 1, scaleY: 1 });
    const mid = hopPose(0.5);
    expect(mid.lift).toBeGreaterThan(0);
    expect(mid.scaleY).toBeGreaterThan(1);
    expect(mid.scaleX).toBeLessThan(1);
  });
});

describe('effects', () => {
  it('chooses splash for drowning and splat otherwise, and expires', () => {
    const fx = createEffects();
    fx.addDeath('drown', 1, 2);
    fx.addDeath('vehicle', 3, 4);
    expect(fx.deaths.map((d) => d.kind)).toEqual(['splash', 'splat']);
    fx.update(DEATH_EFFECT_DURATION + 0.01);
    expect(fx.deaths).toHaveLength(0);
  });

  it('does not advance when frozen', () => {
    const fx = createEffects({ frozen: true });
    fx.addDeath('vehicle', 0, 0);
    fx.update(1);
    expect(fx.time).toBe(0);
    expect(fx.deaths).toHaveLength(1);
  });

  it('advances time deterministically', () => {
    const fx = createEffects();
    fx.update(0.5);
    fx.update(0.25);
    expect(fx.time).toBeCloseTo(0.75);
  });
});
