// Renders docs/social/haiku-fire-station-ig-reel.md as a 1080x1920 / 30fps mp4.
//
//   npm install            (in this folder — NOT the site root)
//   node render.mjs                  full render -> two-hours-from-paia.mp4
//   node render.mjs --preview        stills at a few timestamps, ~10s instead of ~7min
//   node render.mjs out.mp4          custom output path
//
// Deliberately self-contained: playwright and ffmpeg-static live in this
// folder's own package.json so they stay out of the site's dependency tree.
// See README.md.
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '../../..');

const FPS = 30;
const DUR = 30;
const W = 1080, H = 1920;
const FRAMES = FPS * DUR;

const PHOTO = path.join(REPO, 'public/photos/haiku-road.jpg');
const PREVIEW = process.argv.includes('--preview');
const OUT = path.resolve(process.argv.find(a => a.endsWith('.mp4')) ?? path.join(HERE, 'two-hours-from-paia.mp4'));

// Chromium: an explicit override wins, then a preinstalled browser pool, then
// whatever playwright downloaded for itself.
function chromiumPath() {
  if (process.env.REEL_CHROMIUM) return process.env.REEL_CHROMIUM;
  const pool = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (pool) {
    const link = path.join(pool, 'chromium');
    try { if (fs.statSync(link).isFile()) return link; } catch {}
    try {
      const dir = fs.readdirSync(pool).find(d => /^chromium-\d+$/.test(d));
      const bin = dir && path.join(pool, dir, 'chrome-linux/chrome');
      if (bin && fs.existsSync(bin)) return bin;
    } catch {}
  }
  return undefined; // let playwright resolve its own
}

// ---- inline the fonts + photo so the page has zero external requests ----
const face = (family, pkg, file, weight) => {
  const b = fs.readFileSync(path.join(HERE, 'node_modules/@fontsource', pkg, 'files', file));
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};` +
    `font-display:block;src:url(data:font/woff2;base64,${b.toString('base64')}) format('woff2')}`;
};
// latin-ext is not optional: the macrons in Haʻikū / Pāʻia live there, and
// without it they silently fall back to a system serif mid-word.
const FACES = [
  ['Playfair Display', 'playfair-display', 'playfair-display', [400, 700, 900]],
  ['Source Serif 4', 'source-serif-4', 'source-serif-4', [400, 600]],
  ['DM Mono', 'dm-mono', 'dm-mono', [500]],
].flatMap(([family, pkg, stem, weights]) =>
  weights.flatMap(w => ['latin', 'latin-ext'].map(sub =>
    face(family, pkg, `${stem}-${sub}-${w}-normal.woff2`, w)))).join('\n');

const html = fs.readFileSync(path.join(HERE, 'reel.html.tmpl'), 'utf8')
  .replace('{{FONTFACES}}', FACES)
  .replace('{{PHOTO}}', 'data:image/jpeg;base64,' + fs.readFileSync(PHOTO).toString('base64'));

const htmlPath = path.join(HERE, 'reel.built.html');
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({
  executablePath: chromiumPath(),
  args: ['--no-proxy-server', '--force-color-profile=srgb', '--font-render-hinting=none',
         '--disable-lcd-text', '--hide-scrollbars', '--disable-gpu'],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto('file://' + htmlPath);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

// Guard the diacritics: if a place name measures the same with the font as
// without it, the font never loaded and the frame is silently off-brand.
const glyphs = await page.evaluate(() => ['Pāʻia', 'Haʻikū', 'Keʻanae'].map(text => {
  const c = document.createElement('canvas').getContext('2d');
  c.font = "60px 'Source Serif 4'"; const a = c.measureText(text).width;
  c.font = "60px '__nope__'"; const b = c.measureText(text).width;
  return { text, fallback: Math.abs(a - b) < 0.01 };
}));
if (glyphs.some(g => g.fallback)) throw new Error('font did not load: ' + JSON.stringify(glyphs));
console.log('glyph check ok');

if (PREVIEW) {
  for (const t of [2.6, 4.2, 8.0, 11.5, 16.0, 20.0, 24.5, 29.0]) {
    await page.evaluate(tt => window.render(tt), t);
    await page.screenshot({ path: path.join(HERE, `preview-${String(t).replace('.', '_')}s.png`) });
  }
  console.log('previews written to', HERE);
  await browser.close();
  process.exit(0);
}

// ---- png frames on stdin -> h264 + a silent aac track (instagram wants one) ----
const ff = spawn(ffmpegPath, [
  '-y',
  '-f', 'image2pipe', '-vcodec', 'png', '-framerate', String(FPS), '-i', 'pipe:0',
  '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
  '-map', '0:v', '-map', '1:a', '-shortest',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-profile:v', 'high', '-level', '4.2', '-pix_fmt', 'yuv420p',
  '-r', String(FPS), '-g', String(FPS * 2),
  '-c:a', 'aac', '-b:a', '128k',
  '-movflags', '+faststart',
  OUT,
], { stdio: ['pipe', 'inherit', 'pipe'] });

let ffErr = '';
ff.stderr.on('data', d => { ffErr += d.toString(); });
let stdinErr = null;
ff.stdin.on('error', e => { stdinErr = e; });
const ffDone = new Promise((res, rej) =>
  ff.on('close', c => c === 0 ? res()
    : rej(new Error(`ffmpeg exit ${c}\n${ffErr.slice(-3000)}`))));

const write = buf => new Promise((res, rej) => {
  if (stdinErr) return rej(stdinErr);
  if (ff.stdin.write(buf)) return res();
  ff.stdin.once('drain', res);
});

const t0 = Date.now();
for (let i = 0; i < FRAMES; i++) {
  const t = i / FPS;
  await page.evaluate(tt => window.render(tt), t);
  await write(await page.screenshot({ type: 'png' }));
  if (i % 90 === 0 || i === FRAMES - 1) {
    console.log(`frame ${i + 1}/${FRAMES}  t=${t.toFixed(2)}s  ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed`);
  }
}
ff.stdin.end();
await ffDone;
await browser.close();
console.log('wrote', OUT, (fs.statSync(OUT).size / 1e6).toFixed(2) + ' MB');
