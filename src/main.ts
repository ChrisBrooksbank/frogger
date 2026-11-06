import { createFrog } from './game/frog';
import { drawBackground, drawFrog, createRenderer } from './render/renderer';

export const APP_NAME = 'Frogger';

const canvas = document.getElementById('game');
if (canvas instanceof HTMLCanvasElement) {
  const renderer = createRenderer(canvas);
  const frog = createFrog();
  const draw = (): void => {
    renderer.resize();
    renderer.beginFrame();
    drawBackground(renderer.ctx);
    drawFrog(renderer.ctx, frog);
  };
  draw();
  window.addEventListener('resize', draw);
}
