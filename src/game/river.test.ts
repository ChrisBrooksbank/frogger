import { describe, expect, it } from 'vitest';
import { COLS } from './config';
import { createFrog } from './frog';
import { createLane, updateLane, type Lane, type LaneDef } from './lanes';
import { platformUnderFrog, updateRiver } from './river';

function logLane(x: number, dir: 1 | -1 = 1, speed = 2): Lane {
  const def: LaneDef = { row: 3, kind: 'log', speed, dir, width: 3, spacing: 20, offset: 0 };
  const lane = createLane(def);
  lane.objects = [{ x, width: 3 }];
  return lane;
}

function frogAt(col: number, row: number) {
  const f = createFrog();
  f.col = f.fromCol = col;
  f.row = f.fromRow = row;
  return f;
}

describe('river', () => {
  it('drowns when no platform overlaps', () => {
    expect(updateRiver(frogAt(8, 3), [logLane(2)], 0.1)).toBe('drowned');
  });

  it('is safe on a platform', () => {
    const f = frogAt(3, 3);
    expect(platformUnderFrog(f, [logLane(2)])).toBeDefined();
    expect(updateRiver(f, [logLane(2)], 0.1)).toBe('safe');
  });

  it('carries the frog at platform velocity', () => {
    const lane = logLane(2, 1, 2);
    const f = frogAt(3, 3);
    updateLane(lane, 0.5);
    expect(updateRiver(f, [lane], 0.5)).toBe('safe');
    expect(f.offsetX).toBeCloseTo(1);
    const lane2 = logLane(2, -1, 2);
    const g = frogAt(3, 3);
    updateRiver(g, [lane2], 0.5);
    expect(g.offsetX).toBeCloseTo(-1);
  });

  it('dies when carried off either side', () => {
    const f = frogAt(0, 3);
    f.offsetX = -0.6;
    expect(updateRiver(f, [logLane(-1, -1)], 0.01)).toBe('carried-off');
    const g = frogAt(COLS - 1, 3);
    g.offsetX = 0.6;
    expect(updateRiver(g, [logLane(COLS - 3)], 0.01)).toBe('carried-off');
  });

  it('does not check while hopping', () => {
    const f = frogAt(8, 3);
    f.hopProgress = 0.5;
    expect(updateRiver(f, [logLane(2)], 0.1)).toBe('safe');
  });

  it('is safe on non-river rows and snaps carry offset to the grid', () => {
    const f = frogAt(4, 6);
    f.offsetX = 1.2;
    expect(updateRiver(f, [], 0.1)).toBe('safe');
    expect(f.col).toBe(5);
    expect(f.offsetX).toBe(0);
    expect(updateRiver(frogAt(4, 12), [], 0.1)).toBe('safe');
  });
});
