// Records the README gameplay GIF: a deterministic bot plays the real game
// (manual-clock mode) and canvas frames are stitched together with ffmpeg.
// Usage: node scripts/capture-readme.mjs [seed]   (needs `npm run preview` on :4173 and ffmpeg)
import { chromium } from '@playwright/test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const seed = process.argv[2] ?? '1';
const out = 'docs/.frames';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 700, height: 760 } });
await page.goto(`http://localhost:4173/?manual=1&seed=${seed}`);
await page.waitForFunction(() => window.__frogger);

// Bot lives in the page: a BFS planner over hop-sized time steps, using exact lane kinematics.
await page.evaluate(() => {
  const g = window.__frogger.game;
  const SLOTS = [1, 4, 6, 8, 11];
  const TICKS = 8; // one hop (0.12s) completes in 8 fixed ticks
  const h = TICKS / 60;
  const wrap = (x, w, p) => ((((x + w) % p) + p) % p) - w;
  const lane = (row) => g.lanes.find((l) => l.def.row === row);
  const objs = (l, T) =>
    l.objects.map((o) => ({
      x: wrap(o.x + l.def.dir * l.def.speed * T, o.width, l.period),
      w: o.width,
    }));
  const vehicleHit = (row, x, T0) => {
    const l = lane(row);
    if (!l) return false;
    for (let i = 0; i <= TICKS; i += 2) {
      const T = T0 + i / 60;
      if (objs(l, T).some((o) => x - 0.45 < o.x + o.w && o.x < x + 0.45)) return true;
    }
    return false;
  };
  const onPlatform = (row, x, T) => {
    const l = lane(row);
    return objs(l, T).some((o) => x - 0.3 >= o.x && x + 0.3 <= o.x + o.w);
  };
  const kind = (row) =>
    row === 0 ? 'goal' : row <= 5 ? 'river' : row === 6 || row === 12 ? 'safe' : 'road';
  const plan = () => {
    const f = g.player.frog;
    const start = { row: f.row, x: f.col + 0.5, k: 0, prev: null, act: null };
    let layer = [start];
    for (let k = 1; k <= 200 && layer.length; k++) {
      const seen = new Map();
      for (const st of layer) {
        for (const act of ['up', 'wait', 'left', 'right', 'down']) {
          let row = st.row,
            x = st.x;
          if (act === 'up') row--;
          if (act === 'down') row++;
          if (act === 'left') x--;
          if (act === 'right') x++;
          if (row < 0 || row > 12 || x < 0.5 || x > 12.5) continue;
          if (act === 'left' || act === 'right') {
            if (kind(st.row) === 'road') continue;
          }
          const T0 = st.k * h,
            T1 = k * h;
          let ok = true;
          const kd = kind(row);
          if (kd === 'road') ok = !vehicleHit(row, x, T0);
          if (ok && kd === 'road' && st.row !== row) ok = true;
          if (kd === 'river') {
            if (act === 'wait') {
              // carried by the platform; stays aboard unless carried off-screen
              const l = lane(row);
              x = st.x + l.def.dir * l.def.speed * h;
              ok = x > 0.5 && x < 12.5 && onPlatform(row, x, T1);
            } else ok = onPlatform(row, x, T1);
          }
          if (kd === 'goal') {
            const si = SLOTS.findIndex((s, i) => !g.slots[i] && Math.abs(s + 0.5 - x) < 0.2);
            ok = si >= 0;
          }
          if (!ok) continue;
          if (kd === 'road' && act === 'wait' && vehicleHit(row, x, T1)) ok = false;
          if (!ok) continue;
          const key = row + ':' + Math.round(x * 10);
          if (seen.has(key)) continue;
          const nx = { row, x, k, prev: st, act };
          seen.set(key, nx);
          if (kd === 'goal') {
            const acts = [];
            for (let c = nx; c.prev; c = c.prev) acts.unshift(c.act);
            return acts;
          }
        }
      }
      layer = [...seen.values()];
    }
    return null;
  };
  let queue = [];
  let tickInStep = TICKS;
  window.bot = () => {
    if (g.flow.state !== 'playing') return;
    if (tickInStep >= TICKS) {
      const f = g.player.frog;
      if (!queue.length && f.row === 12 && f.hopProgress >= 1) queue = plan() ?? [];
      const act = queue.shift();
      tickInStep = 0;
      if (act && act !== 'wait') g.handle(act);
    }
    tickInStep++;
  };
});

let n = 0;
const canvas = page.locator('canvas#game');
const shot = async () => {
  await canvas.screenshot({ path: `${out}/f${String(n++).padStart(4, '0')}.png` });
};

// Title screen for ~1s, then start.
for (let i = 0; i < 10; i++) await shot();
await page.evaluate(() => window.__frogger.game.handle('start'));

let goals = 0;
for (let tick = 0; tick < 60 * 40 && goals < 3; tick++) {
  const info = await page.evaluate(() => {
    window.bot();
    window.__frogger.advance(1 / 60);
    const g = window.__frogger.game;
    return { filled: g.slots.filter(Boolean).length, lives: g.player.lives, state: g.flow.state };
  });
  goals = info.filled;
  if (info.state !== 'playing') {
    console.log('stopped', tick, JSON.stringify(info));
    break;
  }
  if (tick % 5 === 0) await shot(); // 12 fps
}
for (let i = 0; i < 14; i++) await shot();
console.log(`frames=${n} goals=${goals}`);
await browser.close();

writeFileSync(`${out}/.done`, '');
execFileSync(
  'ffmpeg',
  [
    '-y',
    '-framerate',
    '12',
    '-i',
    `${out}/f%04d.png`,
    '-vf',
    'scale=420:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
    '-loop',
    '0',
    'docs/gameplay.gif',
  ],
  { stdio: 'inherit' },
);
rmSync(out, { recursive: true, force: true });
