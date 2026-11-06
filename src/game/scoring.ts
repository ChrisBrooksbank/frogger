import { START_ROW } from './config';

export const ROW_POINTS = 10;
export const SLOT_POINTS = 50;
export const TIME_POINTS_PER_SECOND = 10;
export const ALL_SLOTS_POINTS = 1000;
export const EXTRA_LIFE_SCORE = 20000;

export interface Scoring {
  score: number;
  /** Smallest (furthest-forward) row index reached during the current life. */
  furthestRow: number;
  extraLifeAwarded: boolean;
}

export function createScoring(): Scoring {
  return { score: 0, furthestRow: START_ROW, extraLifeAwarded: false };
}

/**
 * Adds points. Returns true exactly once, when the score first reaches
 * EXTRA_LIFE_SCORE (the caller grants the life).
 */
export function addPoints(s: Scoring, points: number): boolean {
  s.score += points;
  if (!s.extraLifeAwarded && s.score >= EXTRA_LIFE_SCORE) {
    s.extraLifeAwarded = true;
    return true;
  }
  return false;
}

/** Resets per-life progress (call on respawn). */
export function resetFurthestRow(s: Scoring): void {
  s.furthestRow = START_ROW;
}

export interface ScoreResult {
  points: number;
  extraLife: boolean;
}

/** Awards +10 for each new furthest-forward row reached this life. */
export function scoreRowReached(s: Scoring, row: number): ScoreResult {
  if (row >= s.furthestRow) return { points: 0, extraLife: false };
  const points = (s.furthestRow - row) * ROW_POINTS;
  s.furthestRow = row;
  return { points, extraLife: addPoints(s, points) };
}

/** +50 for a slot, +10 per whole second remaining, +1000 if it completed the set. */
export function scoreSlotFilled(
  s: Scoring,
  secondsRemaining: number,
  allFilled: boolean,
): ScoreResult {
  const time = Math.floor(Math.max(0, secondsRemaining)) * TIME_POINTS_PER_SECOND;
  const points = SLOT_POINTS + time + (allFilled ? ALL_SLOTS_POINTS : 0);
  return { points, extraLife: addPoints(s, points) };
}
