// Reports the RENDERED <title> and meta description length for every route, by
// fetching each one through the real built SSR handler. Run it after a build:
// `npm run build && npm run check:seo` (it reads dist/, so it is stale or absent
// without one).
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
// gets cut, never a violation. Several routes here are over on purpose. This
// script reports and always exits 0; read the list, don't automate a gate on it.
import entry from '../dist/server/server.js'
import { allPosts } from '../.content-collections/generated/index.js'

const TITLE_LIMIT = 62
const DESC_LIMIT = 160

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const routes = [
  '/',
  '/about',
  '/how-we-source',
  '/numbers',
  '/glossary',
  '/disclaimer',
  ...allPosts.map((p) => `/posts/${p.slug}`),
]

const over = []
let maxT = ['', 0]
let maxD = ['', 0]

for (const route of routes) {
  const res = await entry.fetch(new Request(`https://publicsafetyfactshawaii.org${route}`))
  const body = await res.text()
  const head = body.slice(0, body.toLowerCase().indexOf('</head>'))

  const t = decode((head.match(/<title[^>]*>(.*?)<\/title>/is) || [, ''])[1].trim())
  const d = decode(
    (head.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [, ''])[1].trim()
  )
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
console.log(`\nover ${TITLE_LIMIT}/${DESC_LIMIT}: ${over.length} of ${routes.length}`)
for (const [r, f] of over) console.log(`  ${r}  -> ${f}`)
