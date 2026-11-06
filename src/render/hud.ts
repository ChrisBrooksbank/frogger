import { LIFE_TIME } from '../game/config';
import type { GameState } from '../game/flow';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './layout';
import { FONT_STACK, palette } from './theme';

/** Plain data the HUD needs; keeps drawing decoupled from game internals. */
export interface HudData {
  state: GameState;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  timeLeft: number;
  finalScore: number;
  newHighScore: boolean;
}

export const HUD_BAR_HEIGHT = 8;

/** Fraction of the life timer remaining, clamped to 0..1. */
export function timeFraction(timeLeft: number): number {
  return Math.min(1, Math.max(0, timeLeft / LIFE_TIME));
}

/** Time bar turns to the warning colour in the last quarter. */
export function timeBarColour(fraction: number): string {
  return fraction <= 0.25 ? palette.timeBarLow : palette.timeBar;
}

function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size: number,
  colour: string,
  align: CanvasTextAlign = 'left',
  weight = 'bold',
): void {
  ctx.font = `${weight} ${size}px ${FONT_STACK}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colour;
  ctx.fillText(s, x, y);
}

export function drawHud(ctx: CanvasRenderingContext2D, hud: HudData): void {
  text(ctx, `SCORE ${hud.score}`, 8, 14, 16, palette.text);
  text(ctx, `HI ${hud.highScore}`, LOGICAL_WIDTH / 2, 14, 16, palette.accent, 'center');
  text(ctx, `LV ${hud.level}`, LOGICAL_WIDTH - 8, 14, 16, palette.text, 'right');
  text(ctx, '♥'.repeat(Math.max(0, hud.lives)), 8, LOGICAL_HEIGHT - 14, 18, palette.danger);

  const f = timeFraction(hud.timeLeft);
  const barW = LOGICAL_WIDTH * 0.5;
  const x = LOGICAL_WIDTH - barW - 8;
  const y = LOGICAL_HEIGHT - HUD_BAR_HEIGHT - 6;
  ctx.fillStyle = palette.overlay;
  ctx.fillRect(x, y, barW, HUD_BAR_HEIGHT);
  ctx.fillStyle = timeBarColour(f);
  ctx.fillRect(x, y, barW * f, HUD_BAR_HEIGHT);
}

function dim(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = palette.overlay;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
}

export function drawTitleScreen(ctx: CanvasRenderingContext2D, hud: HudData): void {
  dim(ctx);
  const cx = LOGICAL_WIDTH / 2;
  text(ctx, 'FROGGER', cx, LOGICAL_HEIGHT * 0.3, 56, palette.frog, 'center');
  text(
    ctx,
    'Press Enter, Space or tap to start',
    cx,
    LOGICAL_HEIGHT * 0.5,
    20,
    palette.text,
    'center',
  );
  text(
    ctx,
    'Arrows / WASD / swipe to hop',
    cx,
    LOGICAL_HEIGHT * 0.57,
    16,
    palette.textDim,
    'center',
    'normal',
  );
  text(ctx, `High score ${hud.highScore}`, cx, LOGICAL_HEIGHT * 0.68, 18, palette.accent, 'center');
}

export function drawPauseScreen(ctx: CanvasRenderingContext2D): void {
  dim(ctx);
  const cx = LOGICAL_WIDTH / 2;
  text(ctx, 'PAUSED', cx, LOGICAL_HEIGHT * 0.45, 44, palette.text, 'center');
  text(
    ctx,
    'Press P or Esc to resume',
    cx,
    LOGICAL_HEIGHT * 0.55,
    18,
    palette.textDim,
    'center',
    'normal',
  );
}

export function drawGameOverScreen(ctx: CanvasRenderingContext2D, hud: HudData): void {
  dim(ctx);
  const cx = LOGICAL_WIDTH / 2;
  text(ctx, 'GAME OVER', cx, LOGICAL_HEIGHT * 0.3, 48, palette.danger, 'center');
  text(ctx, `Score ${hud.finalScore}`, cx, LOGICAL_HEIGHT * 0.46, 28, palette.text, 'center');
  if (hud.newHighScore)
    text(ctx, 'NEW HIGH SCORE!', cx, LOGICAL_HEIGHT * 0.54, 24, palette.accent, 'center');
  else
    text(
      ctx,
      `High score ${hud.highScore}`,
      cx,
      LOGICAL_HEIGHT * 0.54,
      20,
      palette.textDim,
      'center',
    );
  text(
    ctx,
    'Press Enter or Space to continue',
    cx,
    LOGICAL_HEIGHT * 0.68,
    18,
    palette.text,
    'center',
    'normal',
  );
}

/** Draws the HUD plus whichever overlay the current state needs. */
export function drawUi(ctx: CanvasRenderingContext2D, hud: HudData): void {
  if (hud.state !== 'title') drawHud(ctx, hud);
  if (hud.state === 'title') drawTitleScreen(ctx, hud);
  else if (hud.state === 'paused') drawPauseScreen(ctx);
  else if (hud.state === 'gameover') drawGameOverScreen(ctx, hud);
}
