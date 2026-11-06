import { describe, expect, it, vi } from 'vitest';
import { createRng } from './rng';
import { createTimestep, FIXED_DT } from './timestep';
import { createEmitter } from './events';

describe('rng', () => {
  it('is deterministic per seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
    expect(createRng(1).next()).not.toBe(createRng(2).next());
  });
  it('stays in range', () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const n = r.next();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
      const k = r.int(3, 5);
      expect(k).toBeGreaterThanOrEqual(3);
      expect(k).toBeLessThanOrEqual(5);
    }
  });
});

describe('timestep', () => {
  it('runs whole fixed steps and keeps remainder', () => {
    const t = createTimestep();
    const step = vi.fn();
    expect(t.advance(FIXED_DT * 2.5, step)).toBe(2);
    expect(step).toHaveBeenCalledWith(FIXED_DT);
    expect(t.alpha()).toBeCloseTo(0.5);
    expect(t.advance(FIXED_DT * 0.5, step)).toBe(1);
  });
  it('accumulates small elapsed values', () => {
    const t = createTimestep(0.1);
    const step = vi.fn();
    expect(t.advance(0.05, step)).toBe(0);
    expect(t.advance(0.05, step)).toBe(1);
  });
  it('caps steps after long stalls', () => {
    const t = createTimestep(0.1, 5);
    const step = vi.fn();
    expect(t.advance(100, step)).toBe(5);
    expect(t.alpha()).toBe(0);
  });
  it('ignores negative elapsed and resets', () => {
    const t = createTimestep(0.1);
    expect(t.advance(-1, vi.fn())).toBe(0);
    t.advance(0.05, vi.fn());
    t.reset();
    expect(t.alpha()).toBe(0);
  });
});

describe('emitter', () => {
  it('delivers typed events and supports unsubscribe', () => {
    const e = createEmitter<{ hop: { row: number }; die: undefined }>();
    const hop = vi.fn();
    const off = e.on('hop', hop);
    e.emit('hop', { row: 3 });
    off();
    e.emit('hop', { row: 4 });
    expect(hop).toHaveBeenCalledTimes(1);
    expect(hop).toHaveBeenCalledWith({ row: 3 });
  });
});
