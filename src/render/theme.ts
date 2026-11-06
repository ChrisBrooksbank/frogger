/** Sole home of colour literals and drawing sizes. Renderers import from here. */

export const CELL = 48; // logical pixels per grid cell
export const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const palette = {
  background: '#0b1220',
  text: '#f1f5f9',
  textDim: '#94a3b8',
  accent: '#facc15',
  danger: '#ef4444',
  overlay: 'rgba(11, 18, 32, 0.78)',

  road: '#2b3340',
  roadMarking: '#e2e8f0',
  grass: '#2f7d3a',
  grassDark: '#256330',
  water: '#1d5fa8',
  waterRipple: '#5aa2e6',
  goalBank: '#1f5a2c',
  goalSlot: '#0f3d63',
  goalSlotFilled: '#86efac',

  frog: '#7be04a',
  frogBelly: '#c9f5a6',
  frogEye: '#ffffff',
  frogPupil: '#111827',

  vehicles: ['#f97316', '#e11d48', '#facc15', '#a855f7', '#f8fafc'],
  vehicleWindow: '#cbd5e1',
  vehicleWheel: '#0f172a',

  log: '#92613a',
  logDark: '#6b4423',
  turtle: '#2f9e6e',
  turtleShell: '#1f7a52',
  turtleSinking: '#f59e0b',

  crocodile: '#4d7c0f',
  crocodileHead: '#3f6212',
  snake: '#c026d3',
  fly: '#fde047',
  ladyFrog: '#f472b6',

  splat: '#dc2626',
  splash: '#bfdbfe',
  timeBar: '#22c55e',
  timeBarLow: '#ef4444',
} as const;

export type Palette = typeof palette;
