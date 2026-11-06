import { describe, expect, it } from 'vitest';
import { createFrog } from './frog';
import { SLOT_COLS, allSlotsFilled, createSlots, resolveGoal } from './goal';

function frogAt(col: number, row = 0) {
  const f = createFrog();
  f.col = f.fromCol = col;
  f.row = f.fromRow = row;
  return f;
}

describe('goal row', () => {
  it('has 5 empty slots', () => {
    expect(SLOT_COLS).toHaveLength(5);
    expect(createSlots()).toEqual([false, false, false, false, false]);
  });

  it('fills an empty slot', () => {
    const slots = createSlots();
    expect(resolveGoal(frogAt(6), slots)).toEqual({ status: 'filled', slot: 2 });
    expect(slots[2]).toBe(true);
  });

  it('kills on a filled slot', () => {
    const slots = createSlots();
    resolveGoal(frogAt(6), slots);
    expect(resolveGoal(frogAt(6), slots)).toEqual({ status: 'occupied', slot: 2 });
  });

  it('kills on the wall between slots', () => {
    const slots = createSlots();
    for (const col of [0, 2, 3, 5, 7, 9, 10, 12]) {
      expect(resolveGoal(frogAt(col), slots).status).toBe('wall');
    }
    expect(slots.some(Boolean)).toBe(false);
  });

  it('ignores other rows and mid-hop', () => {
    const slots = createSlots();
    expect(resolveGoal(frogAt(6, 1), slots).status).toBe('none');
    const f = frogAt(6);
    f.hopProgress = 0.5;
    expect(resolveGoal(f, slots).status).toBe('none');
  });

  it('detects all slots filled', () => {
    const slots = createSlots();
    SLOT_COLS.forEach((c) => resolveGoal(frogAt(c), slots));
    expect(allSlotsFilled(slots)).toBe(true);
    expect(allSlotsFilled(createSlots())).toBe(false);
  });
});
