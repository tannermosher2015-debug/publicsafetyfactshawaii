// Reports the RENDERED <title> and meta description length for every route, by
// fetching each one through the real built server. Run it after a build:
// `npm run build && npm run check:seo`.
//
// Two things it gets right that a grep over the source does not:
//   - Entities are decoded first. `&#x27;` is 6 characters in the markup and 1 on
//     screen, so counting raw markup inflates every title with an apostrophe.
//   - It sees the composed head, so a route-level override of a root tag counts
//     once, the way a crawler sees it.
//
// The limits below are DISPLAY heuristics, not Google rules. Google's own snippet
// doc says there is no limit on meta description length and the snippet is simply
// truncated to fit the device width, so being over is a judgment call about what
// gets cut, never a violation. Read the list, don't automate a gate on being over.
//
// EXIT CODES, and the reason they exist: 0 = the scan RAN (over-limit routes are
// reported, not failed). 2 = the scan could NOT run. Until 2026-09-09 this script
// imported `../dist/server/server.js` and always exited 0. The build has written
// `.output/` since the nitro move, so for 8 days it silently measured a Sep 1
// build and reported stale numbers with nothing to signal it. "Not measured" and
// "measured clean" must never look alike, hence the 2.
//
// It boots the built server itself (preset `node-server`, whose entry LISTENS on
// import and exports {}, so there is no fetch handler to import), reads the route
// list from the generated sitemap so it cannot drift from what ships, and prints
// the build's own timestamp so a stale build is visible on sight.
import { spawn } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

const TITLE_LIMIT = 62
const DESC_LIMIT = 160
const PORT = process.env.SEO_CHECK_PORT ?? '4180'
const OUT = new URL('../.output/', import.meta.url)
const ENTRY = new URL('server/index.mjs', OUT)
const SITEMAP = new URL('public/sitemap.xml', OUT)
const ORIGIN = 'https://publicsafetyfactshawaii.org'

// URL.pathname keeps a leading slash before a Windows drive letter (/C:/dev/...).
const local = (u) => u.pathname.replace(/^\/([A-Za-z]:)/, '$1')

const die = (msg) => {
  console.error(`check:seo could not run: ${msg}`)
  process.exit(2)
}

if (!existsSync(ENTRY)) die(`no built server at ${local(ENTRY)}. Run \`npm run build\` first.`)
if (!existsSync(SITEMAP)) die(`no sitemap at ${local(SITEMAP)}. Run \`npm run build\` first.`)

const meta = JSON.parse(readFileSync(new URL('nitro.json', OUT), 'utf8'))
console.log(`build: ${meta.date}  preset: ${meta.preset}\n`)

const routes = [...readFileSync(SITEMAP, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(ORIGIN, '') || '/')
  .sort()
if (!routes.length) die('the sitemap contains no <loc> entries')

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const server = spawn(process.execPath, [local(ENTRY)], {
  env: { ...process.env, NITRO_PORT: PORT, PORT },
  stdio: 'ignore',
})
const stop = () => server.kill()
process.on('exit', stop)
process.on('SIGINT', () => process.exit(130))

const base = `http://127.0.0.1:${PORT}`
let up = false
for (let i = 0; i < 40 && !up; i++) {
  try {
    await fetch(`${base}/`)
    up = true
  } catch {
    await new Promise((r) => setTimeout(r, 250))
  }
}
if (!up) die(`the built server did not answer on ${base} within 10s`)

const over = []
let maxT = ['', 0]
let maxD = ['', 0]

for (const route of routes) {
  let body
  try {
    const res = await fetch(base + route)
    if (!res.ok) die(`${route} returned HTTP ${res.status}`)
    body = await res.text()
  } catch (e) {
    die(`${route} could not be fetched: ${e.message}`)
  }
  const end = body.toLowerCase().indexOf('</head>')
  const head = end === -1 ? body : body.slice(0, end)

  const t = decode((head.match(/<title[^>]*>(.*?)<\/title>/is) || [, ''])[1].trim())
  const d = decode(
    (head.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [, ''])[1].trim()
  )
  if (!t && !d) die(`${route} rendered neither a title nor a description`)
  if (t.length > maxT[1]) maxT = [t, t.length]
  if (d.length > maxD[1]) maxD = [d, d.length]

  const flags = []
  if (t.length > TITLE_LIMIT) flags.push(`title ${t.length}`)
  if (d.length > DESC_LIMIT) flags.push(`desc ${d.length}`)
  if (flags.length) over.push([route, flags.join(', ')])
  console.log(`${String(t.length).padStart(3)} ${String(d.length).padStart(4)}  ${route}`)
}

console.log(`\nlongest title (${maxT[1]}): ${maxT[0]}`)
console.log(`longest desc  (${maxD[1]}): ${maxD[0]}`)
console.log(`\nmeasured ${routes.length} routes`)
console.log(`over ${TITLE_LIMIT}/${DESC_LIMIT}: ${over.length} of ${routes.length}`)
for (const [r, f] of over) console.log(`  ${r}  -> ${f}`)

stop()
process.exit(0)
