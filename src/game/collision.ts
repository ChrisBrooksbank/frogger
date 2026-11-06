import { ROW_ROLES } from './config';
import type { Frog } from './frog';
import { laneForRow, type Lane } from './lanes';

/** Frog hit-box is slightly narrower than a cell so near-misses feel fair. */
export const FROG_HITBOX = 0.7;

/** Continuous horizontal centre of the frog in cells, interpolating during a hop. */
export function frogCenterX(frog: Frog): number {
  const x = frog.fromCol + (frog.col - frog.fromCol) * frog.hopProgress;
  return x + 0.5 + frog.offsetX;
}

/** True if the open intervals [aLeft, aLeft+aWidth) and [bLeft, bLeft+bWidth) overlap. */
export function intervalsOverlap(
  aLeft: number,
  aWidth: number,
  bLeft: number,
  bWidth: number,
): boolean {
  return aLeft < bLeft + bWidth && bLeft < aLeft + aWidth;
}

/** Start, median and goal rows have no vehicles or water of their own. */
export function isSafeRow(row: number): boolean {
  const role = ROW_ROLES[row];
  return role === 'start' || role === 'median' || role === 'goal';
}

/** True if the frog overlaps any vehicle in its row. Safe rows never hit. */
export function hitsVehicle(frog: Frog, lanes: readonly Lane[]): boolean {
  const lane = laneForRow(lanes, frog.row);
  if (!lane || lane.def.kind !== 'vehicle') return false;
  const left = frogCenterX(frog) - FROG_HITBOX / 2;
  return lane.objects.some((o) => intervalsOverlap(left, FROG_HITBOX, o.x, o.width));
}
