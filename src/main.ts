export const APP_NAME = 'Frogger';

const canvas = document.getElementById('game');
if (canvas instanceof HTMLCanvasElement) {
  canvas.width = 480;
  canvas.height = 480;
}
