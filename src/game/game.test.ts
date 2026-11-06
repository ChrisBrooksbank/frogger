import { describe, expect, it } from 'vitest';
import { LIFE_TIME, START_ROW } from './config';
import { createGame, type Game } from './game';
import type { KeyValueStorage } from './storage';

function memoryStorage(initial?: string): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial) data.set('frogger.highScore', initial);
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

function started(storage = memoryStorage()): Game {
  const game = createGame({ storage });
  game.handle('start');
  return game;
}

/** Clears all traffic so tests are not affected by vehicles. */
function clearRoad(game: Game): void {
  for (const lane of game.lanes) if (lane.def.kind === 'vehicle') lane.objects = [];
}

/** Places the frog on row 1 at `col` with no river lane there, ready to hop into the goal. */
function atGoalEdge(game: Game, col: number): void {
  const frog = game.player.frog;
  frog.col = col;
  frog.fromCol = col;
  frog.row = 1;
  frog.fromRow = 1;
  game.lanes = game.lanes.filter((l) => l.def.row !== 1);
}

describe('game', () => {
  it('starts on the title screen and ignores steps and hops', () => {
    const game = createGame({ storage: memoryStorage() });
    game.handle('up');
    game.step(1);
    expect(game.flow.state).toBe('title');
    expect(game.player.frog.row).toBe(START_ROW);
  });

  it('loads the stored high score', () => {
    expect(createGame({ storage: memoryStorage('420') }).flow.highScore).toBe(420);
  });

  it('start begins play, pause toggles and freezes the simulation', () => {
    const game = started();
    expect(game.flow.state).toBe('playing');
    game.handle('pause');
    expect(game.flow.state).toBe('paused');
    const before = game.player.timeLeft;
    game.step(1);
    expect(game.player.timeLeft).toBe(before);
    game.handle('pause');
    expect(game.flow.state).toBe('playing');
  });

  it('hops and scores a new furthest row', () => {
    const game = started();
    clearRoad(game);
    game.handle('up');
    game.step(0.2);
    expect(game.player.frog.row).toBe(START_ROW - 1);
    expect(game.scoring.score).toBe(10);
  });

  it('emits hop events', () => {
    const game = started();
    let hops = 0;
    game.events.on('hop', () => hops++);
    game.handle('up');
    expect(hops).toBe(1);
  });

  it('loses a life when hit by a vehicle', () => {
    const game = started();
    clearRoad(game);
    const lane = game.lanes.find((l) => l.def.row === START_ROW - 1);
    lane?.objects.push({ x: 7.2, width: 1 });
    const causes: string[] = [];
    game.events.on('death', (e) => causes.push(e.cause));
    game.handle('up');
    game.step(0.2);
    expect(game.player.lives).toBe(2);
    expect(causes).toEqual(['vehicle']);
    expect(game.player.frog.row).toBe(START_ROW);
  });

  it('kills the frog when the life timer expires', () => {
    const game = started();
    clearRoad(game);
    const causes: string[] = [];
    game.events.on('death', (e) => causes.push(e.cause));
    for (let i = 0; i < LIFE_TIME * 60 + 5; i++) game.step(1 / 60);
    expect(causes[0]).toBe('timeout');
    expect(game.player.lives).toBe(2);
  });

  it('ends the game when lives run out and saves a new high score', () => {
    const storage = memoryStorage('5');
    const game = started(storage);
    clearRoad(game);
    game.scoring.score = 100;
    let over: unknown;
    game.events.on('gameOver', (e) => (over = e));
    for (let i = 0; i < LIFE_TIME * 60 * 3 + 30; i++) game.step(1 / 60);
    expect(game.flow.state).toBe('gameover');
    expect(over).toEqual({ score: 100, newHighScore: true });
    expect(storage.data.get('frogger.highScore')).toBe('100');
    game.handle('start');
    expect(game.flow.state).toBe('title');
  });

  it('fills a goal slot, scores it and respawns the frog', () => {
    const game = started();
    atGoalEdge(game, 6);
    game.handle('up');
    game.step(0.2);
    expect(game.slots[2]).toBe(true);
    expect(game.scoring.score).toBeGreaterThanOrEqual(50);
    expect(game.player.frog.row).toBe(START_ROW);
  });

  it('kills the frog on a wall between slots', () => {
    const game = started();
    atGoalEdge(game, 5);
    game.handle('up');
    game.step(0.2);
    expect(game.player.lives).toBe(2);
  });

  it('completes a level when all slots are filled', () => {
    const game = started();
    game.slots.fill(true);
    game.slots[2] = false;
    atGoalEdge(game, 6);
    game.handle('up');
    game.step(0.2);
    expect(game.level.level).toBe(2);
    expect(game.slots.every((s) => !s)).toBe(true);
    expect(game.scoring.score).toBeGreaterThanOrEqual(1050);
  });

  it('is deterministic for the same seed and inputs', () => {
    const run = (): number => {
      const g = started();
      for (let i = 0; i < 200; i++) {
        if (i % 20 === 0) g.handle('up');
        g.step(1 / 60);
      }
      return g.scoring.score * 1000 + g.player.frog.row;
    };
    expect(run()).toBe(run());
  });
});
