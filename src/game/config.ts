export const COLS = 13;
export const ROWS = 13;

export type RowRole = 'goal' | 'river' | 'median' | 'road' | 'start';

/** Row 0 is the top (goal); row ROWS-1 is the bottom (start). */
export const ROW_ROLES: readonly RowRole[] = [
  'goal',
  'river',
  'river',
  'river',
  'river',
  'river',
  'median',
  'road',
  'road',
  'road',
  'road',
  'road',
  'start',
];

export const START_COL = Math.floor(COLS / 2);
export const START_ROW = ROWS - 1;

export const HOP_DURATION = 0.12; // seconds
export const INITIAL_LIVES = 3;
