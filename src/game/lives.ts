import { INITIAL_LIVES, LIFE_TIME } from './config';
import { createFrog, respawnFrog, type Frog } from './frog';

export interface Player {
  frog: Frog;
  lives: number;
  /** Seconds left on the current life's timer. */
  timeLeft: number;
}

export function createPlayer(): Player {
  return { frog: createFrog(), lives: INITIAL_LIVES, timeLeft: LIFE_TIME };
}

export function isOutOfLives(player: Player): boolean {
  return player.lives <= 0;
}

/**
 * Kills the frog: costs one life and, if any remain, respawns at the start.
 * Returns true if the player still has lives (game continues).
 */
/** Restarts the per-life timer (new life, or frog reached a goal slot). */
export function resetLifeTimer(player: Player): void {
  player.timeLeft = LIFE_TIME;
}

/**
 * Advances the per-life timer. On expiry the frog dies (see killFrog).
 * Returns 'expired' if the timer killed the frog, otherwise 'running'.
 */
export function tickLifeTimer(player: Player, dt: number): 'running' | 'expired' {
  if (player.lives <= 0) return 'running';
  player.timeLeft = Math.max(0, player.timeLeft - dt);
  if (player.timeLeft > 0) return 'running';
  killFrog(player);
  return 'expired';
}

export function killFrog(player: Player): boolean {
  if (player.lives > 0) player.lives -= 1;
  resetLifeTimer(player);
  if (player.lives <= 0) return false;
  respawnFrog(player.frog);
  return true;
}
