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

type SitemapDoc = { slug: string; date: string }

// Static (non-post) pages, kept in sync here so the sitemap never drifts.
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'yearly', priority: '0.5' },
  { path: '/how-we-source', changefreq: 'yearly', priority: '0.5' },
  { path: '/glossary', changefreq: 'yearly', priority: '0.5' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
  { path: '/hawaii_firefighter_disciplines.html', changefreq: 'monthly', priority: '0.8' },
]

function buildSitemap(docs: SitemapDoc[]): string {
  const latest =
    docs.map((d) => d.date).sort().at(-1) ?? new Date(0).toISOString().slice(0, 10)

  const postUrls = [...docs]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(
      (d) =>
        `  <url>\n    <loc>${SITE_URL}/posts/${d.slug}</loc>\n    <lastmod>${d.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
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
    summary: z.string(),
    categories: z.array(z.string()),
    slug: z.string().optional(),
    image: z.string(),
    date: z.string(),
    content: z.string(),
    kicker: z.string().optional(),
    subtitle: z.string().optional(),
    byline: z.string().optional(),
    masthead: z.string().optional(),
    featured: z.boolean().optional(),
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
  // Regenerate sitemap.xml from the posts on every build so it never drifts.
  onSuccess: async (documents) => {
    await writeFile('public/sitemap.xml', buildSitemap(documents), 'utf8')
  },
})

export default defineConfig({
  collections: [posts],
})
