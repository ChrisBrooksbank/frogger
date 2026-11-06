import { INITIAL_LIVES } from './config';
import { createFrog, respawnFrog, type Frog } from './frog';

export interface Player {
  frog: Frog;
  lives: number;
}

export function createPlayer(): Player {
  return { frog: createFrog(), lives: INITIAL_LIVES };
}

export function isOutOfLives(player: Player): boolean {
  return player.lives <= 0;
}

/**
 * Kills the frog: costs one life and, if any remain, respawns at the start.
 * Returns true if the player still has lives (game continues).
 */
export function killFrog(player: Player): boolean {
  if (player.lives > 0) player.lives -= 1;
  if (player.lives <= 0) return false;
  respawnFrog(player.frog);
  return true;
}
