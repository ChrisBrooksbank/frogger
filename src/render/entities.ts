import { COLS, ROW_ROLES } from '../game/config';
import { SLOT_COLS } from '../game/goal';
import type { Lane, LaneObject } from '../game/lanes';
import { CELL, palette } from './theme';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Vehicle body; `dir` is the travel direction (+1 right, -1 left), `variant` picks the colour. */
export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  obj: LaneObject,
  row: number,
  dir: 1 | -1,
  variant: number,
): void {
  const x = obj.x * CELL;
  const y = row * CELL;
  const w = obj.width * CELL;
  const pad = CELL * 0.14;
  const colours = palette.vehicles;
  ctx.fillStyle = colours[variant % colours.length] ?? colours[0] ?? palette.danger;
  roundRect(ctx, x + 2, y + pad, w - 4, CELL - pad * 2, CELL * 0.18);
  ctx.fill();
  // Windscreen at the leading end.
  const winW = Math.min(CELL * 0.3, w * 0.3);
  const winX = dir === 1 ? x + w - winW - CELL * 0.12 : x + CELL * 0.12;
  ctx.fillStyle = palette.vehicleWindow;
  roundRect(ctx, winX, y + pad + 3, winW, CELL - pad * 2 - 6, 3);
  ctx.fill();
  // Wheels.
  ctx.fillStyle = palette.vehicleWheel;
  for (const wx of [x + w * 0.22, x + w * 0.78]) {
    ctx.fillRect(wx - CELL * 0.1, y + pad - 2, CELL * 0.2, 4);
    ctx.fillRect(wx - CELL * 0.1, y + CELL - pad - 2, CELL * 0.2, 4);
  }
}

export function drawLog(ctx: CanvasRenderingContext2D, obj: LaneObject, row: number): void {
  const x = obj.x * CELL;
  const y = row * CELL;
  const w = obj.width * CELL;
  const pad = CELL * 0.12;
  ctx.fillStyle = palette.log;
  roundRect(ctx, x + 1, y + pad, w - 2, CELL - pad * 2, CELL * 0.3);
  ctx.fill();
  ctx.strokeStyle = palette.logDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 1; i < obj.width * 2; i++) {
    const gx = x + i * (CELL / 2);
    ctx.moveTo(gx, y + pad + 4);
    ctx.lineTo(gx - 4, y + CELL - pad - 4);
  }
  ctx.stroke();
}

/** A raft of turtles, one per cell of width. */
export function drawTurtles(ctx: CanvasRenderingContext2D, obj: LaneObject, row: number): void {
  for (let i = 0; i < obj.width; i++) {
    const cx = (obj.x + i + 0.5) * CELL;
    const cy = (row + 0.5) * CELL;
    ctx.fillStyle = palette.turtle;
    ctx.beginPath();
    ctx.arc(cx, cy - CELL * 0.32, CELL * 0.1, 0, Math.PI * 2); // head
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy, CELL * 0.36, CELL * 0.32, 0, 0, Math.PI * 2); // body
    ctx.fill();
    ctx.fillStyle = palette.turtleShell;
    ctx.beginPath();
    ctx.ellipse(cx, cy, CELL * 0.26, CELL * 0.23, 0, 0, Math.PI * 2); // shell
    ctx.fill();
  }
}

export function drawLane(ctx: CanvasRenderingContext2D, lane: Lane): void {
  const { row, kind, dir } = lane.def;
  for (const obj of lane.objects) {
    if (kind === 'vehicle') drawVehicle(ctx, obj, row, dir, row);
    else if (kind === 'log') drawLog(ctx, obj, row);
    else drawTurtles(ctx, obj, row);
  }
}

export function drawLanes(ctx: CanvasRenderingContext2D, lanes: readonly Lane[]): void {
  for (const lane of lanes) drawLane(ctx, lane);
}

/** Goal bank: a notch per slot, highlighted with a frog marker once filled. */
export function drawGoalSlots(ctx: CanvasRenderingContext2D, slots: readonly boolean[]): void {
  const goalRow = ROW_ROLES.indexOf('goal');
  const y = goalRow * CELL;
  SLOT_COLS.forEach((col, i) => {
    if (col < 0 || col >= COLS) return;
    ctx.fillStyle = palette.goalSlot;
    roundRect(ctx, col * CELL + 2, y + 4, CELL - 4, CELL - 8, 8);
    ctx.fill();
    if (slots[i]) {
      ctx.fillStyle = palette.goalSlotFilled;
      ctx.beginPath();
      ctx.arc((col + 0.5) * CELL, y + CELL / 2, CELL * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
