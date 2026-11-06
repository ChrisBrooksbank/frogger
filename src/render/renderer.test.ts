import { describe, expect, it } from 'vitest';
import { createFrog, requestHop } from '../game/frog';
import { START_COL, START_ROW } from '../game/config';
import { frogCentre } from './renderer';
import { CELL } from './theme';

describe('frogCentre', () => {
  it('is at the centre of the start cell when idle', () => {
    const c = frogCentre(createFrog());
    expect(c.x).toBe((START_COL + 0.5) * CELL);
    expect(c.y).toBe((START_ROW + 0.5) * CELL);
  });

  it('interpolates between cells during a hop', () => {
    const f = createFrog();
    requestHop(f, 'up');
    f.hopProgress = 0.5;
    expect(frogCentre(f).y).toBe((START_ROW - 0.5 + 0.5) * CELL);
  });

  it('includes platform carry offset', () => {
    const f = createFrog();
    f.offsetX = 1.5;
    expect(frogCentre(f).x).toBe((START_COL + 1.5 + 0.5) * CELL);
  });
});
