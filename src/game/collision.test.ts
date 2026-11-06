import { describe, expect, it } from 'vitest';
import { ROW_ROLES, START_COL } from './config';
import { frogCenterX, hitsVehicle, intervalsOverlap, isSafeRow } from './collision';
import { createFrog } from './frog';
import { createLane, type Lane, type LaneDef } from './lanes';

const def: LaneDef = {
  row: 8,
  kind: 'vehicle',
  speed: 1,
  dir: 1,
  width: 1,
  spacing: 13,
  offset: 0,
};

function laneWithCar(x: number, width = 1): Lane {
  const lane = createLane(def);
  lane.objects = [{ x, width }];
  return lane;
}

function frogAt(col: number, row: number) {
  const f = createFrog();
  f.col = f.fromCol = col;
  f.row = f.fromRow = row;
  return f;
}

describe('intervalsOverlap', () => {
  it('detects overlap and treats touching edges as no overlap', () => {
    expect(intervalsOverlap(0, 1, 0.5, 1)).toBe(true);
    expect(intervalsOverlap(0, 1, 1, 1)).toBe(false);
    expect(intervalsOverlap(2, 1, 0, 1)).toBe(false);
  });
});

describe('vehicle collision', () => {
  it('kills when a vehicle overlaps the frog', () => {
    expect(hitsVehicle(frogAt(5, 8), [laneWithCar(5)])).toBe(true);
    expect(hitsVehicle(frogAt(5, 8), [laneWithCar(4.5)])).toBe(true);
  });

  it('is safe in the gap between vehicles', () => {
    expect(hitsVehicle(frogAt(5, 8), [laneWithCar(2)])).toBe(false);
    expect(hitsVehicle(frogAt(5, 8), [laneWithCar(7)])).toBe(false);
  });

  it('ignores vehicles in other rows', () => {
    expect(hitsVehicle(frogAt(5, 9), [laneWithCar(5)])).toBe(false);
  });

  it('uses wide vehicles', () => {
    expect(hitsVehicle(frogAt(6, 8), [laneWithCar(4.5, 2)])).toBe(true);
  });

  it('interpolates frog position while hopping sideways', () => {
    const f = frogAt(5, 8);
    f.fromCol = 4;
    f.hopProgress = 0.5;
    expect(frogCenterX(f)).toBeCloseTo(5);
  });

  it('never hits on start, median or goal rows', () => {
    const lanes = [laneWithCar(START_COL)];
    expect(hitsVehicle(frogAt(START_COL, 12), lanes)).toBe(false);
    expect(hitsVehicle(frogAt(START_COL, 6), lanes)).toBe(false);
    expect(hitsVehicle(frogAt(START_COL, 0), lanes)).toBe(false);
  });
});

describe('safe rows', () => {
  it('flags start, median and goal as safe; road and river as not', () => {
    ROW_ROLES.forEach((role, row) => {
      expect(isSafeRow(row)).toBe(role === 'start' || role === 'median' || role === 'goal');
    });
  });
});
