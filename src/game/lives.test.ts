import { describe, expect, it } from 'vitest';
import { INITIAL_LIVES, START_COL, START_ROW } from './config';
import { requestHop } from './frog';
import { createPlayer, isOutOfLives, killFrog } from './lives';

describe('lives', () => {
  it('starts with 3 lives', () => {
    expect(INITIAL_LIVES).toBe(3);
    expect(createPlayer().lives).toBe(3);
  });

  it('death costs one life and respawns at start', () => {
    const p = createPlayer();
    requestHop(p.frog, 'up');
    requestHop(p.frog, 'left');
    expect(killFrog(p)).toBe(true);
    expect(p.lives).toBe(2);
    expect([p.frog.col, p.frog.row]).toEqual([START_COL, START_ROW]);
    expect(p.frog.hopProgress).toBe(1);
    expect(p.frog.buffered).toBeNull();
  });

  it('last death ends the game and lives never go negative', () => {
    const p = createPlayer();
    killFrog(p);
    killFrog(p);
    expect(isOutOfLives(p)).toBe(false);
    expect(killFrog(p)).toBe(false);
    expect(p.lives).toBe(0);
    expect(isOutOfLives(p)).toBe(true);
    killFrog(p);
    expect(p.lives).toBe(0);
  });
});
