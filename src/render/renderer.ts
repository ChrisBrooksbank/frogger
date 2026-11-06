import { COLS, ROW_ROLES, ROWS, type RowRole } from '../game/config';
import type { Frog } from '../game/frog';
import { computeLayout, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './layout';
import { CELL, palette } from './theme';

const ROW_COLOURS: Record<RowRole, string> = {
  goal: palette.goalBank,
  river: palette.water,
  median: palette.grass,
  road: palette.road,
  start: palette.grass,
};

/** Logical-pixel centre of the frog, interpolated along its current hop. */
export function frogCentre(frog: Frog): { x: number; y: number } {
  const t = Math.min(1, Math.max(0, frog.hopProgress));
  const col = frog.fromCol + (frog.col - frog.fromCol) * t + frog.offsetX;
  const row = frog.fromRow + (frog.row - frog.fromRow) * t;
  return { x: (col + 0.5) * CELL, y: (row + 0.5) * CELL };
}

export function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  for (let row = 0; row < ROWS; row++) {
    const role = ROW_ROLES[row];
    if (!role) continue;
    const y = row * CELL;
    ctx.fillStyle = ROW_COLOURS[role];
    ctx.fillRect(0, y, LOGICAL_WIDTH, CELL);
    if (role === 'road') {
      // Dashed lane divider between adjacent road rows.
      const below = ROW_ROLES[row + 1];
      if (below === 'road') {
        ctx.fillStyle = palette.roadMarking;
        for (let c = 0; c < COLS; c++)
          ctx.fillRect(c * CELL + CELL * 0.25, y + CELL - 1, CELL / 2, 2);
      }
    }
  }
}

export function drawFrog(ctx: CanvasRenderingContext2D, frog: Frog): void {
  const { x, y } = frogCentre(frog);
  const r = CELL * 0.36;
  ctx.fillStyle = palette.frog;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.frogBelly;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.2, r * 0.5, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const dx of [-1, 1]) {
    ctx.fillStyle = palette.frogEye;
    ctx.beginPath();
    ctx.arc(x + dx * r * 0.5, y - r * 0.6, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.frogPupil;
    ctx.beginPath();
    ctx.arc(x + dx * r * 0.5, y - r * 0.65, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
}

export interface Renderer {
  ctx: CanvasRenderingContext2D;
  /** Re-fits the canvas to the window; call on load and resize. */
  resize(): void;
  /** Clears and applies the logical->pixel transform; call at the start of each frame. */
  beginFrame(): void;
}

export function createRenderer(canvas: HTMLCanvasElement, win: Window = window): Renderer {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas not supported');
  let scale = 1;
  return {
    ctx,
    resize() {
      const layout = computeLayout(win.innerWidth, win.innerHeight, win.devicePixelRatio || 1);
      canvas.width = layout.pixelWidth;
      canvas.height = layout.pixelHeight;
      canvas.style.width = `${layout.cssWidth}px`;
      canvas.style.height = `${layout.cssHeight}px`;
      scale = layout.scale;
    },
    beginFrame() {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    },
  };
}
