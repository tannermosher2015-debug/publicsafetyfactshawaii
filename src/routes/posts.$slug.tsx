import { createFileRoute, Link } from '@tanstack/react-router'
import { marked } from 'marked'

import { allPosts } from 'content-collections'
import ViewCounter from '@/components/ViewCounter'
import ShareBar from '@/components/ShareBar'
import NewsletterSignup from '@/components/NewsletterSignup'
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site'

// Slugs are generated from titles by content-collections.ts.
const SLUG = {
  twoTier: 'hawaii_s_two-tier_public_safety_system',
  recognition: 'recognition_without_compensation_is_just_words',
  flsa: 'the_federal_exemption_that_costs_hawaii_firefighters_millions',
  mgt: 'maui_county_paid_for_a_study_that_made_the_case_for_firefighter_raises_then_gave_the_raises_only_to_management',
} as const

type RelatedLink = { to: string; title: string; summary: string; post?: boolean }

// Curated internal-link clusters keep readers on-site and help crawlers reach
// every page. Targets are either other posts or the static feature pages.
const RELATED: Record<string, RelatedLink[]> = {
  [SLUG.mgt]: [
    { to: `/posts/${SLUG.flsa}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.twoTier}`, post: true, title: '', summary: '' },
  ],
  [SLUG.flsa]: [
    { to: `/posts/${SLUG.mgt}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.twoTier}`, post: true, title: '', summary: '' },
  ],
  [SLUG.twoTier]: [
    { to: `/posts/${SLUG.recognition}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.mgt}`, post: true, title: '', summary: '' },
  ],
  [SLUG.recognition]: [
    {
      to: '/crew-data',
      title: 'Why 5-Person Crews Are the Standard',
      summary:
        'The federal staffing benchmarks behind safe fireground operations, laid out with the data.',
    },
    {
      to: '/hawaii_firefighter_disciplines.html',
      title: 'What Hawaii Firefighters Face for Us',
      summary:
        'The range of disciplines behind a single job title — and the hazards that come with each.',
    },
  ],
}

function resolveRelated(slug: string): RelatedLink[] {
  const links = RELATED[slug] ?? []
  return links.map((link) => {
    if (!link.post) return link
    const target = allPosts.find((p) => `/posts/${p.slug}` === link.to)
    return target
      ? { ...link, title: target.title, summary: target.summary }
      : link
  })
}

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    const post = allPosts.find((post) => post.slug === params.slug)
    if (!post) {
      throw new Error('Post not found')
    }
    return post
  },
  head: ({ loaderData }) => {
    const url = `${SITE_URL}/posts/${loaderData.slug}`
    return {
      meta: [
        {
          title: `${loaderData.title} | ${SITE_NAME}`,
        },
        {
          name: 'description',
          content: loaderData.summary,
        },
        {
          name: 'keywords',
          content: loaderData.categories.join(', '),
        },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: url },
        { property: 'og:title', content: loaderData.title },
        { property: 'og:description', content: loaderData.summary },
        {
          property: 'article:published_time',
          content: loaderData.date,
        },
        {
          property: 'article:section',
          content: loaderData.categories[0] ?? 'Public Safety',
        },
        ...loaderData.categories.map((cat) => ({
          property: 'article:tag',
          content: cat,
        })),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: loaderData.title },
        { name: 'twitter:description', content: loaderData.summary },
        {
          'script:ld+json': {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: loaderData.title,
            description: loaderData.summary,
            datePublished: loaderData.date,
            dateModified: loaderData.date,
            url,
            image: OG_IMAGE,
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            author: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: `${SITE_URL}/`,
            },
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: `${SITE_URL}/`,
            },
            articleSection: loaderData.categories[0] ?? 'Public Safety',
            keywords: loaderData.categories.join(', '),
            about: {
              '@type': 'Thing',
              name: 'Hawaii firefighter compensation and labor rights',
            },
          },
        },
        {
          'script:ld+json': {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${SITE_URL}/`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: loaderData.title,
                item: url,
              },
            ],
          },
        },
      ],
      links: [{ rel: 'canonical', href: url }],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const post = Route.useLoaderData()
  const related = resolveRelated(post.slug)
  const shareUrl = `${SITE_URL}/posts/${post.slug}`

  return (
    <>
      <div className="masthead">
        {post.masthead ?? 'PublicSafetyFactsHawaii'}
      </div>

      <nav className="back-nav">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </nav>

      <header className="hero">
        {post.kicker && <div className="kicker">{post.kicker}</div>}
        <h1
          dangerouslySetInnerHTML={{
            __html: post.title.replace('Two-Tier', '<em>Two-Tier</em>'),
          }}
        />
        {post.subtitle && <p className="deck">{post.subtitle}</p>}
        {post.byline && <div className="byline">{post.byline}</div>}
        <div className="byline" style={{ marginTop: '12px' }}>
          <ViewCounter pagePath={`/posts/${post.slug}`} label="reads" trackView />
        </div>
      </header>

      <div className="article-wrap">
        <ShareBar url={shareUrl} title={post.title} />
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: marked(post.content) as string }}
        />
        <ShareBar url={shareUrl} title={post.title} />
      </div>

      <NewsletterSignup />

      {related.length > 0 && (
        <section className="related-reading" aria-labelledby="related-heading">
          <h2 id="related-heading">Related Reading</h2>
          {related.map((link) =>
            link.post ? (
              <Link
                key={link.to}
                to="/posts/$slug"
                params={{ slug: link.to.replace('/posts/', '') }}
                className="related-link"
              >
                <div className="related-link-title">{link.title}</div>
                <div className="related-link-summary">{link.summary}</div>
              </Link>
            ) : (
              <a key={link.to} href={link.to} className="related-link">
                <div className="related-link-title">{link.title}</div>
                <div className="related-link-summary">{link.summary}</div>
              </a>
            ),
          )}
        </section>
      )}

      <footer className="site-footer">
        Prepared for community education purposes &nbsp;·&nbsp; All wage and
        contract data drawn from official government records, binding
        arbitration awards, and established Hawaii news organizations
        &nbsp;·&nbsp; Dollar figures for multi-year scenarios are estimates
        based on compounded ATB rates and a standard step value of ~4%;
        individual outcomes will vary
        <div className="footer-disclaimer">
          <Link to="/disclaimer" className="disclaimer-link">
            Disclaimer
          </Link>
        </div>
        <div className="footer-social">
          <a
            href="https://www.facebook.com/profile.php?id=61589182031011"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="social-link"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/publicsafetyfactshawaii/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="social-link"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  )
}
