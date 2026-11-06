import { describe, expect, it } from 'vitest';
import { createSlots } from './goal';
import {
  MAX_SPEED_MULTIPLIER,
  advanceLevelIfComplete,
  createLevel,
  speedMultiplierFor,
} from './levels';

describe('levels', () => {
  it('starts at level 1 with 1x speed', () => {
    expect(createLevel().level).toBe(1);
    expect(speedMultiplierFor(1)).toBe(1);
  });

  it('adds 10% per level', () => {
    expect(speedMultiplierFor(2)).toBeCloseTo(1.1);
    expect(speedMultiplierFor(5)).toBeCloseTo(1.4);
  });

  it('caps the multiplier', () => {
    expect(speedMultiplierFor(11)).toBe(MAX_SPEED_MULTIPLIER);
    expect(speedMultiplierFor(100)).toBe(MAX_SPEED_MULTIPLIER);
  });

  it('does not advance with empty slots remaining', () => {
    const s = createLevel();
    const slots = createSlots();
    slots[0] = true;
    expect(advanceLevelIfComplete(s, slots)).toBe(false);
    expect(s.level).toBe(1);
    expect(slots[0]).toBe(true);
  });

  it('clears slots and advances when all filled', () => {
    const s = createLevel();
    const slots = createSlots().map(() => true);
    expect(advanceLevelIfComplete(s, slots)).toBe(true);
    expect(s.level).toBe(2);
    expect(slots.every((x) => !x)).toBe(true);
  });
});
