import type { DeathCause } from '../game/game';
import { ROW_ROLES, ROWS } from '../game/config';
import { CELL, palette } from './theme';
import { LOGICAL_WIDTH } from './layout';

export const DEATH_EFFECT_DURATION = 0.6; // seconds

/** Hop pose: vertical lift (logical px) and squash/stretch scale for a hop progress in [0, 1]. */
export function hopPose(progress: number): { lift: number; scaleX: number; scaleY: number } {
  const t = Math.min(1, Math.max(0, progress));
  if (t >= 1) return { lift: 0, scaleX: 1, scaleY: 1 };
  const arc = Math.sin(t * Math.PI); // 0 -> 1 -> 0
  return { lift: arc * CELL * 0.22, scaleX: 1 - arc * 0.12, scaleY: 1 + arc * 0.18 };
}

export interface DeathEffect {
  kind: 'splat' | 'splash';
  x: number;
  y: number;
  age: number;
}

export interface Effects {
  /** Animation clock in seconds (does not advance while frozen). */
  readonly time: number;
  readonly frozen: boolean;
  readonly deaths: readonly DeathEffect[];
  update(dt: number): void;
  addDeath(cause: DeathCause, x: number, y: number): void;
}

export function createEffects(options: { frozen?: boolean } = {}): Effects {
  const frozen = options.frozen ?? false;
  let time = 0;
  const deaths: DeathEffect[] = [];
  return {
    get time() {
      return time;
    },
    frozen,
    deaths,
    update(dt) {
      if (frozen) return;
      time += dt;
      for (const d of deaths) d.age += dt;
      for (let i = deaths.length - 1; i >= 0; i--) {
        if ((deaths[i]?.age ?? 0) >= DEATH_EFFECT_DURATION) deaths.splice(i, 1);
      }
    },
    addDeath(cause, x, y) {
      deaths.push({ kind: cause === 'drown' ? 'splash' : 'splat', x, y, age: 0 });
    },
  };
}

/** Subtle animated wave lines on river rows. */
export function drawWaterRipples(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.strokeStyle = palette.waterRipple;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  for (let row = 0; row < ROWS; row++) {
    if (ROW_ROLES[row] !== 'river') continue;
    const y = row * CELL + CELL / 2;
    const phase = time * 1.5 + row;
    ctx.beginPath();
    for (let x = 0; x <= LOGICAL_WIDTH; x += 6) {
      const wy = y + Math.sin(x / 14 + phase) * 3;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawDeathEffects(
  ctx: CanvasRenderingContext2D,
  deaths: readonly DeathEffect[],
): void {
  for (const d of deaths) {
    const t = Math.min(1, d.age / DEATH_EFFECT_DURATION);
    ctx.globalAlpha = 1 - t;
    if (d.kind === 'splat') {
      ctx.fillStyle = palette.splat;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, CELL * (0.3 + 0.2 * t), CELL * (0.22 + 0.12 * t), 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(d.x + Math.cos(a) * CELL * 0.5 * t, d.y + Math.sin(a) * CELL * 0.4 * t, 3, 0, 7);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = palette.splash;
      ctx.lineWidth = 3;
      for (const k of [0.6, 1]) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, CELL * 0.7 * t * k + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}
