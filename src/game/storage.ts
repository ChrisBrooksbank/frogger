/** Minimal key/value storage interface (subset of the Web Storage API). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const HIGH_SCORE_KEY = 'frogger.highScore';

/** Returns the default browser storage, or null if unavailable. */
export function defaultStorage(): KeyValueStorage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Loads the persisted high score; any failure or invalid data yields 0. */
export function loadHighScore(storage: KeyValueStorage | null = defaultStorage()): number {
  if (!storage) return 0;
  try {
    const raw = storage.getItem(HIGH_SCORE_KEY);
    if (raw === null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** Persists the high score; returns false if storage is unavailable or throws. */
export function saveHighScore(
  score: number,
  storage: KeyValueStorage | null = defaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(HIGH_SCORE_KEY, String(Math.floor(score)));
    return true;
  } catch {
    return false;
  }
}
