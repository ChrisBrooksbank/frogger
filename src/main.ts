import { createGame } from './game/game';
import { createCommandSink } from './input/commands';
import { createGamepadPoller, browserGetPads } from './input/gamepad';
import { attachKeyboard } from './input/keyboard';
import { attachTouch } from './input/touch';
import { createLoop } from './loop';
import { drawBackground, drawFrog, frogCentre, createRenderer } from './render/renderer';
import { drawGoalSlots, drawLanes } from './render/entities';
import { createEffects, drawDeathEffects, drawWaterRipples } from './render/effects';
import { drawUi, type HudData } from './render/hud';

export const APP_NAME = 'Frogger';

/** Test/debug hooks, exposed as `window.__frogger`. */
export interface FroggerHooks {
  game: ReturnType<typeof createGame>;
  /** Advances the simulation by `seconds` in fixed steps and redraws. */
  advance(seconds: number): void;
  render(): void;
}

declare global {
  interface Window {
    __frogger?: FroggerHooks;
  }
}

function hudData(game: ReturnType<typeof createGame>): HudData {
  return {
    state: game.flow.state,
    score: game.scoring.score,
    highScore: game.flow.highScore,
    lives: game.player.lives,
    level: game.level.level,
    timeLeft: game.player.timeLeft,
    finalScore: game.flow.finalScore,
    newHighScore: game.flow.newHighScore,
  };
}

const canvas = document.getElementById('game');
if (canvas instanceof HTMLCanvasElement) {
  // `?seed=N` fixes the RNG; `?manual=1` disables the real-time loop so tests
  // can drive time through `window.__frogger.advance()`.
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed') ?? 1) || 1;
  const manual = params.get('manual') === '1';
  // `?frozen=1` freezes cosmetic animations (ripples, death effects) for screenshots.
  const effects = createEffects({ frozen: params.get('frozen') === '1' });

  const renderer = createRenderer(canvas);
  const game = createGame({ seed });
  game.events.on('death', ({ cause }) => {
    const { x, y } = frogCentre(game.player.frog);
    effects.addDeath(cause, x, y);
  });
  const sink = createCommandSink();
  sink.subscribe((c) => game.handle(c));
  attachKeyboard(window, sink);
  attachTouch(canvas, sink);
  const gamepad = createGamepadPoller(browserGetPads, sink, () =>
    game.flow.state === 'title' || game.flow.state === 'gameover' ? 'start' : 'pause',
  );

  const render = (): void => {
    renderer.resize();
    renderer.beginFrame();
    drawBackground(renderer.ctx);
    drawWaterRipples(renderer.ctx, effects.time);
    drawGoalSlots(renderer.ctx, game.slots);
    drawLanes(renderer.ctx, game.lanes);
    drawFrog(renderer.ctx, game.player.frog);
    drawDeathEffects(renderer.ctx, effects.deaths);
    drawUi(renderer.ctx, hudData(game));
  };

  const loop = createLoop(
    {
      requestFrame: (cb) => requestAnimationFrame(cb),
      cancelFrame: (id) => cancelAnimationFrame(id),
      isHidden: () => document.hidden,
    },
    {
      update: (dt) => {
        game.step(dt);
        effects.update(dt);
      },
      render: () => {
        gamepad.poll();
        render();
      },
      onHidden: () => {
        if (game.flow.state === 'playing') game.handle('pause');
      },
    },
  );

  window.addEventListener('resize', render);
  document.addEventListener('visibilitychange', () => loop.visibilityChanged());
  window.__frogger = {
    game,
    render,
    advance(seconds) {
      const steps = Math.round(seconds * 60);
      for (let i = 0; i < steps; i++) {
        game.step(1 / 60);
        effects.update(1 / 60);
      }
      render();
    },
  };

  render();
  if (!manual) loop.start();
}
