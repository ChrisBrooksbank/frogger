import { COLS, HOP_DURATION, ROWS, START_COL, START_ROW } from './config';

export type Direction = 'up' | 'down' | 'left' | 'right';

const DELTAS: Record<Direction, { dc: number; dr: number }> = {
  up: { dc: 0, dr: -1 },
  down: { dc: 0, dr: 1 },
  left: { dc: -1, dr: 0 },
  right: { dc: 1, dr: 0 },
};

export interface Frog {
  col: number;
  row: number;
  /** Cell the current hop started from (equals col/row when idle). */
  fromCol: number;
  fromRow: number;
  /** Hop animation progress in [0, 1]; 1 = idle. */
  hopProgress: number;
  /** Horizontal displacement in cells from being carried by a platform. */
  offsetX: number;
  /** One-deep buffered direction, applied when the current hop ends. */
  buffered: Direction | null;
}

export function createFrog(): Frog {
  return {
    col: START_COL,
    row: START_ROW,
    fromCol: START_COL,
    fromRow: START_ROW,
    hopProgress: 1,
    offsetX: 0,
    buffered: null,
  };
}

export function isHopping(frog: Frog): boolean {
  return frog.hopProgress < 1;
}

function startHop(frog: Frog, dir: Direction): boolean {
  const { dc, dr } = DELTAS[dir];
  const col = frog.col + dc;
  const row = frog.row + dr;
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  frog.fromCol = frog.col;
  frog.fromRow = frog.row;
  frog.col = col;
  frog.row = row;
  frog.hopProgress = 0;
  return true;
}

/**
 * Requests a hop. Starts immediately if idle; otherwise buffers (one deep,
 * later requests overwrite earlier). Returns true if a hop started now.
 * Callers must not call this for key auto-repeat.
 */
export function requestHop(frog: Frog, dir: Direction): boolean {
  if (isHopping(frog)) {
    frog.buffered = dir;
    return false;
  }
  return startHop(frog, dir);
}

/** Advances the hop animation; starts a buffered hop when the current one ends. */
export function updateFrog(frog: Frog, dt: number): void {
  if (!isHopping(frog)) return;
  frog.hopProgress = Math.min(1, frog.hopProgress + dt / HOP_DURATION);
  if (frog.hopProgress >= 1 && frog.buffered) {
    const dir = frog.buffered;
    frog.buffered = null;
    startHop(frog, dir);
  }
}

/** Resets position to bottom-centre and clears animation/buffer. */
export function respawnFrog(frog: Frog): void {
  Object.assign(frog, createFrog());
}
