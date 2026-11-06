import { describe, expect, it } from 'vitest';
import { START_ROW } from './config';
import {
  EXTRA_LIFE_SCORE,
  addPoints,
  createScoring,
  resetFurthestRow,
  scoreRowReached,
  scoreSlotFilled,
} from './scoring';

describe('scoring', () => {
  it('awards 10 for each new furthest row only', () => {
    const s = createScoring();
    expect(scoreRowReached(s, START_ROW - 1).points).toBe(10);
    expect(scoreRowReached(s, START_ROW).points).toBe(0);
    expect(scoreRowReached(s, START_ROW - 1).points).toBe(0);
    expect(scoreRowReached(s, START_ROW - 2).points).toBe(10);
    expect(s.score).toBe(20);
  });

  it('resets furthest row per life', () => {
    const s = createScoring();
    scoreRowReached(s, START_ROW - 3);
    resetFurthestRow(s);
    expect(scoreRowReached(s, START_ROW - 1).points).toBe(10);
  });

  it('awards slot, time and all-slots bonuses', () => {
    const s = createScoring();
    expect(scoreSlotFilled(s, 12.9, false).points).toBe(50 + 120);
    expect(scoreSlotFilled(s, 0, true).points).toBe(50 + 1000);
    expect(scoreSlotFilled(s, -3, false).points).toBe(50);
    expect(s.score).toBe(170 + 1050 + 50);
  });

  it('awards an extra life once at 20,000', () => {
    const s = createScoring();
    expect(addPoints(s, EXTRA_LIFE_SCORE - 1)).toBe(false);
    expect(addPoints(s, 1)).toBe(true);
    expect(addPoints(s, 5000)).toBe(false);
  });

  it('reports extra life through results', () => {
    const s = createScoring();
    s.score = EXTRA_LIFE_SCORE - 10;
    expect(scoreSlotFilled(s, 0, false).extraLife).toBe(true);
  });
});
