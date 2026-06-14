import { createFileRoute, Link } from '@tanstack/react-router'

import { allPosts } from 'content-collections'
import ViewCounter from '@/components/ViewCounter'
import ShareBar from '@/components/ShareBar'
import NewsletterSignup from '@/components/NewsletterSignup'
import SiteFooter from '@/components/SiteFooter'
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
          dangerouslySetInnerHTML={{ __html: post.html }}
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

      <SiteFooter social>
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
      </SiteFooter>
    </>
  )
}
