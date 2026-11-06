import { describe, expect, it } from 'vitest';
import { advance, createFlow, endGame, togglePause } from './flow';

describe('game flow', () => {
  it('cycles title -> playing -> gameover -> title', () => {
    const f = createFlow();
    expect(f.state).toBe('title');
    expect(advance(f)).toBe('playing');
    expect(advance(f)).toBe('playing');
    expect(endGame(f, 0)).toBe(true);
    expect(f.state).toBe('gameover');
    expect(advance(f)).toBe('title');
  });

  it('pauses and resumes only while playing', () => {
    const f = createFlow();
    expect(togglePause(f)).toBe('title');
    advance(f);
    expect(togglePause(f)).toBe('paused');
    expect(advance(f)).toBe('paused');
    expect(endGame(f, 10)).toBe(false);
    expect(togglePause(f)).toBe('playing');
  });

  it('flags and stores a new high score', () => {
    const f = createFlow(100);
    advance(f);
    endGame(f, 250);
    expect(f.finalScore).toBe(250);
    expect(f.newHighScore).toBe(true);
    expect(f.highScore).toBe(250);
  });

  it('does not flag a lower or equal score, and resets flag on restart', () => {
    const f = createFlow(500);
    advance(f);
    endGame(f, 500);
    expect(f.newHighScore).toBe(false);
    expect(f.highScore).toBe(500);
    advance(f);
    advance(f);
    expect(f.finalScore).toBe(0);
  });

  it('does not treat zero as a high score', () => {
    const f = createFlow();
    advance(f);
    endGame(f, 0);
    expect(f.newHighScore).toBe(false);
  });
});
