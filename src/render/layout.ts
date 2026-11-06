import { COLS, ROWS } from '../game/config';
import { CELL } from './theme';

/** Logical (device-independent) playfield size in pixels. */
export const LOGICAL_WIDTH = COLS * CELL;
export const LOGICAL_HEIGHT = ROWS * CELL;

export interface CanvasLayout {
  /** CSS size of the canvas element. */
  cssWidth: number;
  cssHeight: number;
  /** Backing-store size (CSS size * devicePixelRatio, rounded). */
  pixelWidth: number;
  pixelHeight: number;
  /** Factor mapping logical coordinates to backing-store pixels. */
  scale: number;
}

/** Fits the playfield into the available area, preserving aspect ratio and honouring DPR. */
export function computeLayout(availWidth: number, availHeight: number, dpr = 1): CanvasLayout {
  const ratio = dpr > 0 ? dpr : 1;
  const fit = Math.max(0.1, Math.min(availWidth / LOGICAL_WIDTH, availHeight / LOGICAL_HEIGHT));
  const cssWidth = Math.floor(LOGICAL_WIDTH * fit);
  const cssHeight = Math.floor(LOGICAL_HEIGHT * fit);
  const pixelWidth = Math.round(cssWidth * ratio);
  const pixelHeight = Math.round(cssHeight * ratio);
  return { cssWidth, cssHeight, pixelWidth, pixelHeight, scale: pixelWidth / LOGICAL_WIDTH };
}
