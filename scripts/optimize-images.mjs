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
// Social cards: og:image must be a fixed, known size because the width/height we
// declare in <meta> has to be true for every photo. 1200x630 is the 1.91:1 shape
// twitter:card=summary_large_image and Facebook both crop to, so we cut it once
// here instead of letting each scraper crop a differently-shaped source.
const OG = { w: 1200, h: 630 }

// AVIF quality per image. 60 is visually indistinguishable from the source at web
// sizes for every photo but one: overtime.jpg is a grainy source, and grain is
// exactly what AVIF spends bits on. At 60 its 768 variant encoded to 206KB, which
// is LARGER than its own 188KB WebP, so <picture> served the bigger file to modern
// browsers (the only inverted pair in the set). 50 puts it back under the WebP.
// Measured: 768 AVIF 205.7KB at q60, 155.1KB at q50. A mild blur does nothing here.
const AVIF_QUALITY = { overtime: 50 }
const DEFAULT_AVIF_QUALITY = 60

// `-og.jpg` is this script's OWN output and lives in the same directory, so it has
// to be excluded from the source list or every run feeds on the last one's cards
// (`hero-og-og.jpg`, `hero-og-768.avif`, ...) and public/ ships the junk.
const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f) && !/-og\.jpe?g$/i.test(f))
let written = 0
for (const file of files) {
  const src = path.join(DIR, file)
  const base = file.replace(/\.jpe?g$/i, '')
  const srcStat = await stat(src)
  const formats = {
    avif: (p) => p.avif({ quality: AVIF_QUALITY[base] ?? DEFAULT_AVIF_QUALITY }),
    webp: (p) => p.webp({ quality: 80 }),
  }
  for (const w of WIDTHS) {
    for (const [ext, apply] of Object.entries(formats)) {
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
  // JPEG, not AVIF/WebP: social scrapers are the one consumer that still can't be
  // assumed to decode modern formats.
  const ogOut = path.join(DIR, `${base}-og.jpg`)
  let ogStale = true
  try {
    ogStale = (await stat(ogOut)).mtimeMs < srcStat.mtimeMs
  } catch {
    /* missing -> build it */
  }
  if (ogStale) {
    await sharp(src)
      .resize({ width: OG.w, height: OG.h, fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(ogOut)
    written++
  }
}
console.log(`[optimize-images] ${files.length} sources, ${written} variants written`)
