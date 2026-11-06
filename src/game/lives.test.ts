import { describe, expect, it } from 'vitest';
import { INITIAL_LIVES, LIFE_TIME, START_COL, START_ROW } from './config';
import { requestHop } from './frog';
import { createPlayer, isOutOfLives, killFrog, resetLifeTimer, tickLifeTimer } from './lives';

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

  describe('life timer', () => {
    it('is 30 seconds and counts down', () => {
      const p = createPlayer();
      expect(LIFE_TIME).toBe(30);
      expect(tickLifeTimer(p, 10)).toBe('running');
      expect(p.timeLeft).toBeCloseTo(20);
      expect(p.lives).toBe(3);
    });

    it('expiry kills the frog, costs a life, respawns and resets the timer', () => {
      const p = createPlayer();
      requestHop(p.frog, 'up');
      expect(tickLifeTimer(p, 29.9)).toBe('running');
      expect(tickLifeTimer(p, 0.2)).toBe('expired');
      expect(p.lives).toBe(2);
      expect(p.timeLeft).toBe(LIFE_TIME);
      expect([p.frog.col, p.frog.row]).toEqual([START_COL, START_ROW]);
    });

    it('last-life expiry ends the game and does not tick afterwards', () => {
      const p = createPlayer();
      p.lives = 1;
      expect(tickLifeTimer(p, 31)).toBe('expired');
      expect(isOutOfLives(p)).toBe(true);
      expect(tickLifeTimer(p, 31)).toBe('running');
      expect(p.lives).toBe(0);
    });

    it('death by other causes resets the timer; reset restores full time', () => {
      const p = createPlayer();
      tickLifeTimer(p, 12);
      killFrog(p);
      expect(p.timeLeft).toBe(LIFE_TIME);
      tickLifeTimer(p, 5);
      resetLifeTimer(p);
      expect(p.timeLeft).toBe(LIFE_TIME);
    });
  });
});
