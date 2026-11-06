import { COLS } from './config';

export type LaneKind = 'vehicle' | 'log' | 'turtle';

export interface LaneDef {
  /** Grid row index (see ROW_ROLES). */
  row: number;
  kind: LaneKind;
  /** Cells per second, always positive; see `dir`. */
  speed: number;
  /** +1 moves right, -1 moves left. */
  dir: 1 | -1;
  /** Width of each object in cells. */
  width: number;
  /** Distance in cells between the left edges of consecutive objects. */
  spacing: number;
  /** Left edge of the first object at t=0. */
  offset: number;
}

export interface LaneObject {
  /** Left edge in cells (may be fractional; can be off-screen while wrapping). */
  x: number;
  width: number;
}

export interface Lane {
  def: LaneDef;
  objects: LaneObject[];
  /** Length of the loop objects travel along before wrapping. */
  period: number;
}

/** Data-driven layout: rows 1-5 are river, rows 7-11 are road. */
export const LANE_DEFS: readonly LaneDef[] = [
  { row: 1, kind: 'turtle', speed: 1.5, dir: -1, width: 2, spacing: 5, offset: 0 },
  { row: 2, kind: 'log', speed: 2.0, dir: 1, width: 3, spacing: 6, offset: 1 },
  { row: 3, kind: 'log', speed: 3.5, dir: 1, width: 5, spacing: 9, offset: 2 },
  { row: 4, kind: 'log', speed: 1.5, dir: 1, width: 2, spacing: 5, offset: 0 },
  { row: 5, kind: 'turtle', speed: 2.0, dir: -1, width: 3, spacing: 6, offset: 3 },
  { row: 7, kind: 'vehicle', speed: 1.5, dir: -1, width: 1, spacing: 5, offset: 0 },
  { row: 8, kind: 'vehicle', speed: 2.5, dir: 1, width: 1, spacing: 4, offset: 2 },
  { row: 9, kind: 'vehicle', speed: 2.0, dir: -1, width: 1, spacing: 6, offset: 1 },
  { row: 10, kind: 'vehicle', speed: 3.0, dir: 1, width: 2, spacing: 7, offset: 3 },
  { row: 11, kind: 'vehicle', speed: 4.0, dir: -1, width: 2, spacing: 8, offset: 4 },
];

/** Wraps a left edge into [-width, period - width). */
export function wrapX(x: number, width: number, period: number): number {
  return ((((x + width) % period) + period) % period) - width;
}

export function createLane(def: LaneDef): Lane {
  if (def.spacing < def.width) throw new Error('lane spacing must be >= object width');
  // Enough objects that the loop covers the screen plus one object width, so
  // objects wrap fully off-screen before reappearing on the other side.
  const count = Math.ceil((COLS + def.width) / def.spacing);
  const period = count * def.spacing;
  const objects: LaneObject[] = [];
  for (let i = 0; i < count; i++) {
    objects.push({ x: wrapX(def.offset + i * def.spacing, def.width, period), width: def.width });
  }
  return { def, objects, period };
}

export function createLanes(defs: readonly LaneDef[] = LANE_DEFS): Lane[] {
  return defs.map(createLane);
}

/** Moves lane objects; `speedMultiplier` scales the lane's base speed. */
export function updateLane(lane: Lane, dt: number, speedMultiplier = 1): void {
  const { dir, speed } = lane.def;
  const dx = dir * speed * speedMultiplier * dt;
  for (const obj of lane.objects) {
    obj.x = wrapX(obj.x + dx, obj.width, lane.period);
  }
}

export function updateLanes(lanes: readonly Lane[], dt: number, speedMultiplier = 1): void {
  for (const lane of lanes) updateLane(lane, dt, speedMultiplier);
}

export function laneForRow(lanes: readonly Lane[], row: number): Lane | undefined {
  return lanes.find((l) => l.def.row === row);
}
