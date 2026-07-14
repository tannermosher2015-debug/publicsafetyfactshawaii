// Generates AVIF + WebP variants (768w for cards, 1280w for heroes) for every
// JPEG in public/photos so <picture> can serve small, modern images instead of
// shipping the full 1280px JPEG to a 360px card. Runs as the first build step.
// Idempotent: skips any variant already newer than its source, so rebuilds are
// fast and only changed photos are re-encoded.
import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const DIR = 'public/photos'
const WIDTHS = [768, 1280]
// Quality tuned to be visually indistinguishable from the source at web sizes.
const FORMATS = {
  avif: (p) => p.avif({ quality: 60 }),
  webp: (p) => p.webp({ quality: 80 }),
}

const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f))
let written = 0
for (const file of files) {
  const src = path.join(DIR, file)
  const base = file.replace(/\.jpe?g$/i, '')
  const srcStat = await stat(src)
  for (const w of WIDTHS) {
    for (const [ext, apply] of Object.entries(FORMATS)) {
      const out = path.join(DIR, `${base}-${w}.${ext}`)
      try {
        if ((await stat(out)).mtimeMs >= srcStat.mtimeMs) continue
      } catch {
        /* missing -> build it */
      }
      await apply(sharp(src).resize({ width: w, withoutEnlargement: true })).toFile(out)
      written++
    }
  }
}
console.log(`[optimize-images] ${files.length} sources, ${written} variants written`)
