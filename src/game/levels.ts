import { allSlotsFilled } from './goal';

export const SPEED_STEP = 0.1;
export const MAX_SPEED_MULTIPLIER = 2;

export interface LevelState {
  level: number;
}

export function createLevel(): LevelState {
  return { level: 1 };
}

/** Lane speed multiplier for a level: +10% per level, capped. */
export function speedMultiplierFor(level: number): number {
  const m = 1 + (Math.max(1, level) - 1) * SPEED_STEP;
  return Math.min(MAX_SPEED_MULTIPLIER, Math.round(m * 1e9) / 1e9);
}

/**
 * If all slots are filled, clears them in place and advances the level.
 * Returns true when a level was completed.
 */
export function advanceLevelIfComplete(state: LevelState, slots: boolean[]): boolean {
  if (!allSlotsFilled(slots)) return false;
  slots.fill(false);
  state.level += 1;
  return true;
}
