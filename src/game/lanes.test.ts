import { describe, expect, it } from 'vitest';
import { COLS, ROW_ROLES } from './config';
import {
  LANE_DEFS,
  createLane,
  createLanes,
  laneForRow,
  updateLane,
  updateLanes,
  wrapX,
} from './lanes';

describe('lane layout', () => {
  it('assigns lanes only to road and river rows, one per row', () => {
    const rows = LANE_DEFS.map((d) => d.row);
    expect(new Set(rows).size).toBe(rows.length);
    for (const d of LANE_DEFS) {
      expect(['road', 'river']).toContain(ROW_ROLES[d.row]);
      expect(d.kind === 'vehicle').toBe(ROW_ROLES[d.row] === 'road');
    }
    for (const [r, role] of ROW_ROLES.entries()) {
      if (role === 'road' || role === 'river') expect(rows).toContain(r);
    }
  });

  it('has mixed directions and per-lane speeds', () => {
    expect(new Set(LANE_DEFS.map((d) => d.dir)).size).toBe(2);
    expect(new Set(LANE_DEFS.map((d) => d.speed)).size).toBeGreaterThan(3);
  });

  it('is deterministic', () => {
    expect(createLanes()).toEqual(createLanes());
  });

  it('covers the screen so lanes are never empty on a side', () => {
    for (const lane of createLanes()) {
      expect(lane.period).toBeGreaterThanOrEqual(COLS + lane.def.width);
    }
  });

  it('rejects overlapping objects', () => {
    expect(() =>
      createLane({ row: 7, kind: 'vehicle', speed: 1, dir: 1, width: 3, spacing: 2, offset: 0 }),
    ).toThrow();
  });
});

describe('lane movement', () => {
  const def = {
    row: 7,
    kind: 'vehicle',
    speed: 2,
    dir: 1,
    width: 1,
    spacing: 5,
    offset: 0,
  } as const;

  it('moves right at speed * dt', () => {
    const lane = createLane(def);
    const before = lane.objects.map((o) => o.x);
    updateLane(lane, 0.5);
    lane.objects.forEach((o, i) => {
      const expected = wrapX(before[i]! + 1, 1, lane.period);
      expect(o.x).toBeCloseTo(expected);
    });
  });

  it('moves left for dir -1 and applies speed multiplier', () => {
    const lane = createLane({ ...def, dir: -1, offset: 6 });
    const x0 = lane.objects[0]!.x;
    updateLane(lane, 0.5, 1.5);
    expect(lane.objects[0]!.x).toBeCloseTo(x0 - 1.5);
  });

  it('wraps right-moving objects from the right edge to the left', () => {
    const lane = createLane(def);
    const obj = lane.objects[0]!;
    obj.x = COLS + 0.5;
    updateLane(lane, 0.5); // +1 -> far right, beyond the visible area
    expect(obj.x).toBeGreaterThanOrEqual(-obj.width);
    expect(obj.x).toBeLessThan(lane.period - obj.width);
    obj.x = lane.period - obj.width - 0.1;
    updateLane(lane, 0.1); // +0.2 crosses the seam
    expect(obj.x).toBeLessThan(0);
    expect(obj.x).toBeGreaterThanOrEqual(-obj.width);
  });

  it('wraps left-moving objects from the left edge to the right', () => {
    const lane = createLane({ ...def, dir: -1 });
    const obj = lane.objects[0]!;
    obj.x = -obj.width;
    updateLane(lane, 0.1); // crosses the seam
    expect(obj.x).toBeGreaterThan(COLS - 1);
  });

  it('keeps object count and spacing constant over a long run', () => {
    const lanes = createLanes();
    const counts = lanes.map((l) => l.objects.length);
    for (let i = 0; i < 2000; i++) updateLanes(lanes, 1 / 60);
    expect(lanes.map((l) => l.objects.length)).toEqual(counts);
    for (const l of lanes) {
      for (const o of l.objects) {
        expect(o.x).toBeGreaterThanOrEqual(-o.width);
        expect(o.x).toBeLessThan(l.period - o.width);
      }
    }
  });

  it('finds lanes by row', () => {
    const lanes = createLanes();
    expect(laneForRow(lanes, 7)?.def.kind).toBe('vehicle');
    expect(laneForRow(lanes, 6)).toBeUndefined();
  });
});
