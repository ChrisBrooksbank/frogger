import { COLS, ROW_ROLES } from './config';
import { FROG_HITBOX, frogCenterX, intervalsOverlap } from './collision';
import { isHopping, type Frog } from './frog';
import { laneForRow, type Lane } from './lanes';

export type RiverStatus = 'safe' | 'drowned' | 'carried-off';

/** The platform (log/turtle) the frog currently overlaps, if any. */
export function platformUnderFrog(frog: Frog, lanes: readonly Lane[]) {
  const lane = laneForRow(lanes, frog.row);
  if (!lane || lane.def.kind === 'vehicle') return undefined;
  const left = frogCenterX(frog) - FROG_HITBOX / 2;
  const obj = lane.objects.find((o) => intervalsOverlap(left, FROG_HITBOX, o.x, o.width));
  return obj ? { lane, obj } : undefined;
}

/** Folds carry displacement back into the grid column (used when leaving the river). */
function snapToGrid(frog: Frog): void {
  if (frog.offsetX === 0) return;
  const col = Math.round(frog.col + frog.offsetX);
  frog.col = Math.min(COLS - 1, Math.max(0, col));
  frog.fromCol = frog.col;
  frog.offsetX = 0;
}

/**
 * Applies river rules for one step. Call after lanes have moved by `dt`.
 * - Off the river: carry offset is snapped to the grid; always safe.
 * - Mid-hop: no check (resolved on landing).
 * - On a platform: carried at the platform velocity; leaving either side kills.
 * - Otherwise: drowns.
 */
export function updateRiver(
  frog: Frog,
  lanes: readonly Lane[],
  dt: number,
  speedMultiplier = 1,
): RiverStatus {
  if (ROW_ROLES[frog.row] !== 'river') {
    if (!isHopping(frog)) snapToGrid(frog);
    return 'safe';
  }
  if (isHopping(frog)) return 'safe';
  const platform = platformUnderFrog(frog, lanes);
  if (!platform) return 'drowned';
  const { dir, speed } = platform.lane.def;
  frog.offsetX += dir * speed * speedMultiplier * dt;
  const cx = frogCenterX(frog);
  return cx < 0 || cx > COLS ? 'carried-off' : 'safe';
}
