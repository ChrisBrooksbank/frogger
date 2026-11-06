import { describe, expect, it } from 'vitest';
import { COLS, HOP_DURATION, ROW_ROLES, ROWS, START_COL, START_ROW } from './config';
import { createFrog, isHopping, requestHop, respawnFrog, updateFrog, type Direction } from './frog';

function settle(frog: ReturnType<typeof createFrog>): void {
  updateFrog(frog, HOP_DURATION);
}

describe('grid config', () => {
  it('is 13x13 with matching row roles', () => {
    expect(COLS).toBe(13);
    expect(ROWS).toBe(13);
    expect(ROW_ROLES).toHaveLength(ROWS);
    expect(ROW_ROLES[0]).toBe('goal');
    expect(ROW_ROLES[ROWS - 1]).toBe('start');
    expect(ROW_ROLES.filter((r) => r === 'median')).toHaveLength(1);
  });
});

describe('frog', () => {
  it('starts bottom-centre', () => {
    const f = createFrog();
    expect([f.col, f.row]).toEqual([START_COL, START_ROW]);
    expect(START_COL).toBe(6);
    expect(isHopping(f)).toBe(false);
  });

  it.each<[Direction, number, number]>([
    ['up', 0, -1],
    ['left', -1, 0],
    ['right', 1, 0],
  ])('hops one cell %s', (dir, dc, dr) => {
    const f = createFrog();
    expect(requestHop(f, dir)).toBe(true);
    expect([f.col, f.row]).toEqual([START_COL + dc, START_ROW + dr]);
  });

  it('hops down when not on bottom row', () => {
    const f = createFrog();
    requestHop(f, 'up');
    settle(f);
    requestHop(f, 'down');
    expect([f.col, f.row]).toEqual([START_COL, START_ROW]);
  });

  it('cannot move below the bottom boundary', () => {
    const f = createFrog();
    expect(requestHop(f, 'down')).toBe(false);
    expect(f.row).toBe(START_ROW);
    expect(isHopping(f)).toBe(false);
  });

  it('cannot move past left, right or top boundaries', () => {
    const f = createFrog();
    for (let i = 0; i < COLS + 2; i++) {
      requestHop(f, 'left');
      settle(f);
    }
    expect(f.col).toBe(0);
    for (let i = 0; i < COLS + 2; i++) {
      requestHop(f, 'right');
      settle(f);
    }
    expect(f.col).toBe(COLS - 1);
    for (let i = 0; i < ROWS + 2; i++) {
      requestHop(f, 'up');
      settle(f);
    }
    expect(f.row).toBe(0);
  });

  it('animates hop progress and finishes', () => {
    const f = createFrog();
    requestHop(f, 'up');
    expect(f.hopProgress).toBe(0);
    updateFrog(f, HOP_DURATION / 2);
    expect(f.hopProgress).toBeCloseTo(0.5);
    expect(isHopping(f)).toBe(true);
    updateFrog(f, HOP_DURATION);
    expect(f.hopProgress).toBe(1);
    expect(isHopping(f)).toBe(false);
  });

  it('buffers one deep during a hop and applies it afterwards', () => {
    const f = createFrog();
    requestHop(f, 'up');
    expect(requestHop(f, 'left')).toBe(false);
    expect(requestHop(f, 'right')).toBe(false); // overwrites buffer
    expect([f.col, f.row]).toEqual([START_COL, START_ROW - 1]);
    updateFrog(f, HOP_DURATION);
    expect([f.col, f.row]).toEqual([START_COL + 1, START_ROW - 1]);
    expect(f.buffered).toBeNull();
  });

  it('respawns at start, clearing animation and buffer', () => {
    const f = createFrog();
    requestHop(f, 'up');
    requestHop(f, 'left');
    respawnFrog(f);
    expect(f).toEqual(createFrog());
  });
});
