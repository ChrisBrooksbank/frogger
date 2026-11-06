import { ROW_ROLES } from './config';
import { frogCenterX } from './collision';
import { isHopping, type Frog } from './frog';

/** Columns of the 5 goal slots; symmetric across the 13-column playfield. */
export const SLOT_COLS: readonly number[] = [1, 4, 6, 8, 11];

export type GoalStatus = 'none' | 'filled' | 'wall' | 'occupied';

export interface GoalResult {
  status: GoalStatus;
  /** Index into SLOT_COLS when status is 'filled' or 'occupied'. */
  slot?: number;
}

export function createSlots(): boolean[] {
  return SLOT_COLS.map(() => false);
}

export function allSlotsFilled(slots: readonly boolean[]): boolean {
  return slots.every(Boolean);
}

/**
 * Resolves the frog arriving in the goal row (once its hop has finished).
 * - Empty slot: marks it filled (caller respawns the frog).
 * - Filled slot: 'occupied' (kills).
 * - Between slots: 'wall' (kills).
 */
export function resolveGoal(frog: Frog, slots: boolean[]): GoalResult {
  if (ROW_ROLES[frog.row] !== 'goal' || isHopping(frog)) return { status: 'none' };
  const cell = Math.floor(frogCenterX(frog));
  const slot = SLOT_COLS.indexOf(cell);
  if (slot < 0) return { status: 'wall' };
  if (slots[slot]) return { status: 'occupied', slot };
  slots[slot] = true;
  return { status: 'filled', slot };
}
