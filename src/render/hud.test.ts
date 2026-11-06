import { describe, expect, it } from 'vitest';
import { LIFE_TIME } from '../game/config';
import { drawUi, timeBarColour, timeFraction, type HudData } from './hud';
import { palette } from './theme';

function fakeCtx() {
  const texts: string[] = [];
  const target: Record<string | symbol, unknown> = {
    fillText: (s: string) => texts.push(s),
  };
  const ctx = new Proxy(target, {
    get: (t, k) => (k in t ? t[k] : () => undefined),
    set: (t, k, v) => ((t[k] = v), true),
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, texts };
}

const base: HudData = {
  state: 'playing',
  score: 120,
  highScore: 900,
  lives: 3,
  level: 2,
  timeLeft: LIFE_TIME,
  finalScore: 0,
  newHighScore: false,
};

describe('time bar', () => {
  it('computes and clamps the fraction', () => {
    expect(timeFraction(LIFE_TIME)).toBe(1);
    expect(timeFraction(LIFE_TIME / 2)).toBe(0.5);
    expect(timeFraction(-5)).toBe(0);
    expect(timeFraction(999)).toBe(1);
  });
  it('warns when low', () => {
    expect(timeBarColour(1)).toBe(palette.timeBar);
    expect(timeBarColour(0.2)).toBe(palette.timeBarLow);
  });
});

describe('drawUi', () => {
  it('shows score, high score, lives and level while playing', () => {
    const { ctx, texts } = fakeCtx();
    drawUi(ctx, base);
    expect(texts).toEqual(expect.arrayContaining(['SCORE 120', 'HI 900', 'LV 2', '♥♥♥']));
  });
  it('shows the title screen', () => {
    const { ctx, texts } = fakeCtx();
    drawUi(ctx, { ...base, state: 'title' });
    expect(texts).toContain('FROGGER');
    expect(texts).not.toContain('SCORE 120');
  });
  it('shows pause', () => {
    const { ctx, texts } = fakeCtx();
    drawUi(ctx, { ...base, state: 'paused' });
    expect(texts).toContain('PAUSED');
  });
  it('shows game over with final score and new-high flag', () => {
    const a = fakeCtx();
    drawUi(a.ctx, { ...base, state: 'gameover', finalScore: 1500, newHighScore: true });
    expect(a.texts).toEqual(expect.arrayContaining(['GAME OVER', 'Score 1500', 'NEW HIGH SCORE!']));
    const b = fakeCtx();
    drawUi(b.ctx, { ...base, state: 'gameover', finalScore: 10 });
    expect(b.texts).not.toContain('NEW HIGH SCORE!');
  });
});
