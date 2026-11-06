import { describe, expect, it } from 'vitest';
import { createLanes } from '../game/lanes';
import { drawGoalSlots, drawLanes } from './entities';
import { palette } from './theme';

function fakeCtx() {
  const fills: string[] = [];
  const target: Record<string | symbol, unknown> = {
    fillStyle: '',
    fill: () => fills.push(String(target.fillStyle)),
    fillRect: () => fills.push(String(target.fillStyle)),
  };
  const ctx = new Proxy(target, {
    get: (t, k) => (k in t ? t[k] : () => undefined),
    set: (t, k, v) => ((t[k] = v), true),
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, fills };
}

describe('entity drawing', () => {
  it('draws vehicles, logs and turtles in their theme colours', () => {
    const { ctx, fills } = fakeCtx();
    drawLanes(ctx, createLanes());
    expect(fills).toContain(palette.log);
    expect(fills).toContain(palette.turtle);
    expect(fills.some((f) => (palette.vehicles as readonly string[]).includes(f))).toBe(true);
  });

  it('marks only filled goal slots', () => {
    const empty = fakeCtx();
    drawGoalSlots(empty.ctx, [false, false, false, false, false]);
    expect(empty.fills).not.toContain(palette.goalSlotFilled);
    const some = fakeCtx();
    drawGoalSlots(some.ctx, [true, false, false, false, false]);
    expect(some.fills.filter((f) => f === palette.goalSlotFilled)).toHaveLength(1);
  });
});
