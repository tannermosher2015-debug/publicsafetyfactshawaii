// One-time: copy the live Netlify view counts into the Vercel/Neon database.
//
// The two databases are separate. Measured 2026-09-01: the live Netlify site's
// public GET /api/views returned 19 rows and 2,386 views, while the Vercel
// project's Neon store held a single /__test__ row. Without this the counter
// resets to zero at cutover.
//
// Run it with DATABASE_URL pointing at the VERCEL database:
//   vercel env pull .env.local          (writes DATABASE_URL, gitignored dotfile)
//   node --env-file=.env.local scripts/seed-page-views.mjs
//
// Idempotent: it takes the HIGHER of the two counts per path, so running it
// twice cannot double anything, and a path that has already accumulated real
// traffic on the new host is never revised downwards.
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const SEED = 'db/seed/page_views-2026-09-01.json'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Run `vercel env pull .env.local` first.')
  process.exit(1)
}

const rows = JSON.parse(readFileSync(SEED, 'utf8'))
if (!Array.isArray(rows) || rows.length === 0) {
  console.error(`${SEED} is empty or not an array; refusing to run.`)
  process.exit(1)
}

const sql = neon(url)

const before = await sql`select count(*)::int as n, coalesce(sum(view_count),0)::int as total from page_views`
console.log(`before: ${before[0].n} rows, ${before[0].total} views`)

let applied = 0
for (const r of rows) {
  const path = r.pagePath
  const count = r.viewCount
  if (typeof path !== 'string' || !path.startsWith('/') || !Number.isInteger(count)) {
    console.error(`skipping malformed row: ${JSON.stringify(r)}`)
    continue
  }
  await sql`
    insert into page_views (page_path, view_count)
    values (${path}, ${count})
    on conflict (page_path) do update
      set view_count = greatest(page_views.view_count, excluded.view_count)`
  applied++
}

const after = await sql`select count(*)::int as n, coalesce(sum(view_count),0)::int as total from page_views`
console.log(`applied ${applied} of ${rows.length} seed rows`)
console.log(`after:  ${after[0].n} rows, ${after[0].total} views`)

// Assert the seed actually landed, rather than trusting that no error was thrown.
const expected = rows.reduce((a, r) => a + (Number.isInteger(r.viewCount) ? r.viewCount : 0), 0)
if (after[0].total < expected) {
  console.error(`FAILED: total ${after[0].total} is below the ${expected} seeded.`)
  process.exit(1)
}
console.log('OK: every seeded path is present at or above its exported count.')
