import { writeFile } from 'node:fs/promises'

import { defineCollection, defineConfig } from '@content-collections/core'
import { marked } from 'marked'
import { z } from 'zod'

const SITE_URL = 'https://publicsafetyfactshawaii.org'

function deriveSlug(title: string): string {
  return title
    .toLowerCase()
    .replace('.md', '')
    .replace(/[^\w-]+/g, '_')
}

type SitemapDoc = { slug: string; date: string; updated?: string }

// Static (non-post) pages, kept in sync here so the sitemap never drifts.
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'yearly', priority: '0.5' },
  { path: '/how-we-source', changefreq: 'yearly', priority: '0.5' },
  { path: '/glossary', changefreq: 'yearly', priority: '0.5' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
  { path: '/hawaii_firefighter_disciplines.html', changefreq: 'monthly', priority: '0.8' },
]

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

type RssDoc = { slug: string; date: string; title: string; summary: string }

// RSS 2.0 feed of every post, newest first. MailerLite's RSS-to-email campaign
// polls this and sends each new <item> to subscribers, so the feed IS the
// auto-newsletter. Dates are date-only in frontmatter; treat them as UTC midnight.
function buildRss(docs: RssDoc[]): string {
  const sorted = [...docs].sort((a, b) => (a.date < b.date ? 1 : -1))
  const rfc822 = (d: string) => new Date(`${d}T00:00:00Z`).toUTCString()
  const lastBuild = sorted[0] ? rfc822(sorted[0].date) : new Date(0).toUTCString()

  const items = sorted
    .map((d) => {
      const url = `${SITE_URL}/posts/${d.slug}`
      return `    <item>\n      <title>${xmlEscape(d.title)}</title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <pubDate>${rfc822(d.date)}</pubDate>\n      <description>${xmlEscape(d.summary)}</description>\n    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated at build time from content/posts — do not edit by hand. -->\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>PublicSafetyFactsHawaii</title>\n    <link>${SITE_URL}/</link>\n    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n    <description>Records-based community education on Hawaii firefighter pay, overtime, and labor rights.</description>\n    <language>en-us</language>\n    <lastBuildDate>${lastBuild}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`
}

function buildSitemap(docs: SitemapDoc[]): string {
  const mod = (d: SitemapDoc) => d.updated ?? d.date
  const latest =
    docs.map(mod).sort().at(-1) ?? new Date(0).toISOString().slice(0, 10)

  const postUrls = [...docs]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(
      (d) =>
        `  <url>\n    <loc>${SITE_URL}/posts/${d.slug}</loc>\n    <lastmod>${mod(d)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    )

  const staticUrls = STATIC_PAGES.map(
    (p) =>
      `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <lastmod>${latest}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
  )

  // Home first, then posts (newest first), then the remaining static pages.
  const [home, ...restStatic] = staticUrls
  const body = [home, ...postUrls, ...restStatic].join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generated at build time from content/posts — do not edit by hand. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: z.object({
    title: z.string(),
    titleHtml: z.string().optional(),
    seoTitle: z.string().optional(),
    summary: z.string(),
    metaDescription: z.string().optional(),
    updated: z.string().optional(),
    categories: z.array(z.string()),
    slug: z.string().optional(),
    image: z.string(),
    date: z.string(),
    content: z.string(),
    kicker: z.string().optional(),
    subtitle: z.string().optional(),
    byline: z.string().optional(),
    masthead: z.string().optional(),
  }),
  // Render markdown to HTML at build time so the `marked` parser never ships to
  // the browser. `content` (raw markdown) is dropped from the output in favour
  // of the precomputed `html`.
  transform: async (doc) => {
    const { content, ...rest } = doc
    return {
      ...rest,
      slug: doc.slug ?? deriveSlug(doc.title),
      html: await marked.parse(content),
    }
  },
  // Regenerate sitemap.xml + rss.xml from the posts on every build so they never
  // drift. rss.xml is what MailerLite polls to auto-email new articles.
  onSuccess: async (documents) => {
    await writeFile('public/sitemap.xml', buildSitemap(documents), 'utf8')
    await writeFile('public/rss.xml', buildRss(documents), 'utf8')
  },
})

export default defineConfig({
  collections: [posts],
})
