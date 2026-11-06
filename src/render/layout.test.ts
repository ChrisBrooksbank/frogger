import { describe, expect, it } from 'vitest';
import { computeLayout, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './layout';

describe('computeLayout', () => {
  it('preserves aspect ratio when height-limited', () => {
    const l = computeLayout(2000, LOGICAL_HEIGHT, 1);
    expect(l.cssHeight).toBe(LOGICAL_HEIGHT);
    expect(l.cssWidth).toBe(LOGICAL_WIDTH);
  });

  it('preserves aspect ratio when width-limited', () => {
    const l = computeLayout(LOGICAL_WIDTH / 2, 5000, 1);
    expect(l.cssWidth).toBe(Math.floor(LOGICAL_WIDTH / 2));
    expect(l.cssHeight / l.cssWidth).toBeCloseTo(LOGICAL_HEIGHT / LOGICAL_WIDTH, 1);
  });

  it('scales the backing store by devicePixelRatio', () => {
    const l = computeLayout(LOGICAL_WIDTH, LOGICAL_HEIGHT, 2);
    expect(l.pixelWidth).toBe(l.cssWidth * 2);
    expect(l.pixelHeight).toBe(l.cssHeight * 2);
    expect(l.scale).toBe(2);
  });

  it('falls back to dpr 1 for invalid values', () => {
    expect(computeLayout(LOGICAL_WIDTH, LOGICAL_HEIGHT, 0).scale).toBe(1);
  });
});
