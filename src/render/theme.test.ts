import { describe, expect, it } from 'vitest';
import { palette, CELL, FONT_STACK } from './theme';

describe('theme', () => {
  it('defines sizes and a system font stack', () => {
    expect(CELL).toBeGreaterThan(0);
    expect(FONT_STACK).toContain('system-ui');
  });

  it('has several distinct vehicle colours', () => {
    expect(new Set(palette.vehicles).size).toBe(palette.vehicles.length);
    expect(palette.vehicles.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps hazards distinct from their lane backgrounds', () => {
    for (const v of palette.vehicles) expect(v).not.toBe(palette.road);
    expect(palette.log).not.toBe(palette.water);
    expect(palette.turtle).not.toBe(palette.water);
    expect(palette.crocodile).not.toBe(palette.water);
  });
});
