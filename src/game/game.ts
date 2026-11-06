import { hitsVehicle } from './collision';
import { createEmitter, type Emitter } from './events';
import { advance, createFlow, endGame, togglePause, type Flow } from './flow';
import { isHopping, requestHop, respawnFrog, updateFrog } from './frog';
import { allSlotsFilled, createSlots, resolveGoal } from './goal';
import { createLanes, updateLanes, type Lane } from './lanes';
import { advanceLevelIfComplete, createLevel, speedMultiplierFor, type LevelState } from './levels';
import { createPlayer, killFrog, resetLifeTimer, tickLifeTimer, type Player } from './lives';
import { updateRiver } from './river';
import { createRng, type Rng } from './rng';
import {
  createScoring,
  resetFurthestRow,
  scoreRowReached,
  scoreSlotFilled,
  type Scoring,
} from './scoring';
import { loadHighScore, saveHighScore, type KeyValueStorage } from './storage';
import type { Command } from '../input/commands';

export type DeathCause = 'vehicle' | 'drown' | 'timeout' | 'wall';

export interface GameEvents extends Record<string, unknown> {
  hop: undefined;
  death: { cause: DeathCause };
  goal: { slot: number };
  levelComplete: { level: number };
  extraLife: undefined;
  gameOver: { score: number; newHighScore: boolean };
}

export interface Game {
  flow: Flow;
  player: Player;
  scoring: Scoring;
  level: LevelState;
  slots: boolean[];
  lanes: Lane[];
  rng: Rng;
  events: Emitter<GameEvents>;
  /** Applies an input command (movement, start, pause). */
  handle(command: Command): void;
  /** Advances the simulation by one fixed step; only runs while playing. */
  step(dt: number): void;
}

export interface GameOptions {
  seed?: number;
  storage?: KeyValueStorage | null;
}

export function createGame(options: GameOptions = {}): Game {
  const seed = options.seed ?? 1;
  const storage = options.storage;
  const events = createEmitter<GameEvents>();
  const game: Game = {
    flow: createFlow(storage === undefined ? loadHighScore() : loadHighScore(storage)),
    player: createPlayer(),
    scoring: createScoring(),
    level: createLevel(),
    slots: createSlots(),
    lanes: createLanes(),
    rng: createRng(seed),
    events,
    handle,
    step,
  };

  function reset(): void {
    game.player = createPlayer();
    game.scoring = createScoring();
    game.level = createLevel();
    game.slots = createSlots();
    game.lanes = createLanes();
    game.rng = createRng(seed);
  }

  /** Points are already added by scoring; this grants the one-time extra life. */
  function award(result: { extraLife: boolean }): void {
    if (!result.extraLife) return;
    game.player.lives += 1;
    events.emit('extraLife', undefined);
  }

  function afterDeath(cause: DeathCause, hasLives: boolean): void {
    resetFurthestRow(game.scoring);
    events.emit('death', { cause });
    if (!hasLives) finish();
  }

  function die(cause: DeathCause): void {
    afterDeath(cause, killFrog(game.player));
  }

  function finish(): void {
    const score = game.scoring.score;
    if (!endGame(game.flow, score)) return;
    if (game.flow.newHighScore) {
      if (storage === undefined) saveHighScore(score);
      else saveHighScore(score, storage);
    }
    events.emit('gameOver', { score, newHighScore: game.flow.newHighScore });
  }

  function handle(command: Command): void {
    switch (command) {
      case 'start': {
        const was = game.flow.state;
        advance(game.flow);
        if (was === 'title') reset();
        break;
      }
      case 'pause':
        togglePause(game.flow);
        break;
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        if (game.flow.state === 'playing' && requestHop(game.player.frog, command)) {
          events.emit('hop', undefined);
        }
        break;
      default:
        break;
    }
  }

  function step(dt: number): void {
    if (game.flow.state !== 'playing') return;
    const { player, lanes } = game;
    const frog = player.frog;
    const mult = speedMultiplierFor(game.level.level);

    updateLanes(lanes, dt, mult);
    const hadBuffered = frog.buffered !== null;
    updateFrog(frog, dt);
    // A buffered hop starts as soon as the previous one lands.
    if (hadBuffered && frog.buffered === null && isHopping(frog)) events.emit('hop', undefined);

    if (tickLifeTimer(player, dt) === 'expired') {
      afterDeath('timeout', player.lives > 0);
      return;
    }

    const river = updateRiver(frog, lanes, dt, mult);
    if (river !== 'safe') return die('drown');
    if (hitsVehicle(frog, lanes)) return die('vehicle');

    if (!isHopping(frog)) award(scoreRowReached(game.scoring, frog.row));

    const goal = resolveGoal(frog, game.slots);
    if (goal.status === 'wall' || goal.status === 'occupied') return die('wall');
    if (goal.status === 'filled') {
      const all = allSlotsFilled(game.slots);
      award(scoreSlotFilled(game.scoring, player.timeLeft, all));
      events.emit('goal', { slot: goal.slot ?? -1 });
      respawnFrog(frog);
      resetLifeTimer(player);
      resetFurthestRow(game.scoring);
      if (advanceLevelIfComplete(game.level, game.slots)) {
        events.emit('levelComplete', { level: game.level.level });
      }
    }
  }

  return game;
}
