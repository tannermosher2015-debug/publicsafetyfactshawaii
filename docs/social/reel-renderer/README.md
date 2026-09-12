# Reel renderer

Renders [`../haiku-fire-station-ig-reel.md`](../haiku-fire-station-ig-reel.md) to a
1080×1920, 30fps, 30-second mp4 for Instagram Reels.

**This is a standalone tool.** It has its own `package.json` and its own
`node_modules`, and nothing in the site build imports it. Do not hoist
`playwright` or `ffmpeg-static` into the root `package.json` — the root lockfile
has a deliberately pinned drizzle in it and does not need a browser and a
100 MB ffmpeg binary alongside it.

## Running it

```bash
cd docs/social/reel-renderer
npm install

npm run preview   # stills at 8 timestamps, ~10 seconds — use this while editing
npm run render    # full 900-frame render, ~7 minutes -> two-hours-from-paia.mp4
```

Output is git-ignored. The mp4 is a build artifact; upload it and let it go.

On a machine with a preinstalled browser pool (`PLAYWRIGHT_BROWSERS_PATH`), the
script finds Chromium there instead of downloading one. `REEL_CHROMIUM=/path/to/chrome`
overrides that. Otherwise `npm install` fetches playwright's own browser.

## How it works

`reel.html.tmpl` is a single 1080×1920 page with all four scenes stacked and a
global `render(t)` function that positions everything for time `t` — no CSS
animations, no timing drift. `render.mjs` inlines the fonts and the hero photo as
data URIs, then walks `t` from 0 to 30 in 1/30s steps, screenshotting each frame
and piping the PNGs straight into ffmpeg. Nothing hits the network and nothing
touches disk except the finished mp4.

Two things that will bite you if you edit the template:

- **Scene seams are one-sided fades.** Each scene fades *in* on top of the one
  before it, which is left at full opacity underneath. Fading the outgoing scene
  out at the same time punches a half-second of empty background through every
  seam. This only works because every scene after the first has a full-bleed
  opaque `.slab`; keep it that way.
- **Fonts need the `latin-ext` subset.** The macrons in Haʻikū and Pāʻia are not
  in `latin`. Without `latin-ext` they fall back to a system serif mid-word,
  which is subtle enough to miss. `render.mjs` measures the three place names at
  startup and throws if the font did not load.

## Editing the content

Text, colors and layout are in `reel.html.tmpl`. Timings are in two places at
the bottom of it:

- `T` — the four scene boundaries (`s1` 0–5s, `s2` 5–13s, `s3` 13–22s, `s4` 22–30s).
- `CUES` — the burned-in captions as `[start, end, html]`.

Captions carry the VO word-for-word, so if the script changes, change both. The
accuracy notes in the script doc explain why several lines are worded the way
they are — particularly that August 24 is a **committee** date, not a full
Council vote, and that oral testimony is closed. Re-read those before rewording.

## Reusing it for another post

Nothing here is generic yet — the scenes are hand-built for this piece. For the
next article, copy the folder and rewrite the four scenes. If a third reel comes
along, that is the point to pull the scene structure out into data.
