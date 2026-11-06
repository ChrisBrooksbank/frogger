import { describe, expect, it } from 'vitest';
import { HIGH_SCORE_KEY, loadHighScore, saveHighScore, type KeyValueStorage } from './storage';

function memory(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
  };
}

const throwing: KeyValueStorage = {
  getItem() {
    throw new Error('denied');
  },
  setItem() {
    throw new Error('denied');
  },
};

describe('high score storage', () => {
  it('round-trips a score', () => {
    const s = memory();
    expect(saveHighScore(1234, s)).toBe(true);
    expect(s.data.get(HIGH_SCORE_KEY)).toBe('1234');
    expect(loadHighScore(s)).toBe(1234);
  });

  it('returns 0 when nothing is stored', () => {
    expect(loadHighScore(memory())).toBe(0);
  });

  it('returns 0 for invalid stored data', () => {
    const s = memory();
    s.data.set(HIGH_SCORE_KEY, 'abc');
    expect(loadHighScore(s)).toBe(0);
    s.data.set(HIGH_SCORE_KEY, '-5');
    expect(loadHighScore(s)).toBe(0);
  });

  it('falls back safely when storage throws', () => {
    expect(loadHighScore(throwing)).toBe(0);
    expect(saveHighScore(10, throwing)).toBe(false);
  });

  it('falls back safely when storage is unavailable', () => {
    expect(loadHighScore(null)).toBe(0);
    expect(saveHighScore(10, null)).toBe(false);
  });
});
