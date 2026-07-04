import { createFileRoute, Link } from '@tanstack/react-router'

import { allPosts } from 'content-collections'
import ViewCounter from '@/components/ViewCounter'
import ShareBar from '@/components/ShareBar'
import ArticleToc, { type TocItem } from '@/components/ArticleToc'
import ActionCta from '@/components/ActionCta'
import NewsletterSignup from '@/components/NewsletterSignup'
import SiteFooter from '@/components/SiteFooter'
import { getPostMeta } from '@/lib/post-meta'
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site'

// Give each <h2> a stable id and collect the section list for the sidebar TOC.
function buildArticle(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  const out = html.replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/g,
    (match, attrs: string, inner: string) => {
      const text = inner
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
      const id =
        text
          .toLowerCase()
          .replace(/&[a-z]+;/g, '')
          .replace(/[^\w]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60) || `section-${toc.length + 1}`
      toc.push({ id, text })
      return /\bid=/.test(attrs) ? match : `<h2${attrs} id="${id}">${inner}</h2>`
    },
  )
  return { html: out, toc }
}

// Slugs are generated from titles by content-collections.ts.
const SLUG = {
  twoTier: 'hawaii_s_two-tier_public_safety_system',
  recognition: 'recognition_without_compensation_is_just_words',
  flsa: 'the_federal_exemption_that_costs_hawaii_firefighters_millions',
  mgt: 'maui_county_paid_for_a_study_that_made_the_case_for_firefighter_raises_then_gave_the_raises_only_to_management',
  fireCommission: 'maui_fire_commission_was_told_firefighters_do_fairly_well',
  vacancies: 'maui_firefighter_vacancies_county_roster',
  costOfLiving: 'cost_of_living_gap_hawaii_firefighter_pay',
  recruitment: 'hawaii_firefighter_recruitment_collapse',
  family: 'the_family_behind_the_firefighter_badge',
  staffing: 'why_5_person_fire_crews_are_the_standard',
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
    { to: `/posts/${SLUG.recruitment}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.family}`, post: true, title: '', summary: '' },
  ],
  [SLUG.recruitment]: [
    { to: `/posts/${SLUG.costOfLiving}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.vacancies}`, post: true, title: '', summary: '' },
  ],
  [SLUG.family]: [
    { to: `/posts/${SLUG.recognition}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.costOfLiving}`, post: true, title: '', summary: '' },
  ],
  [SLUG.fireCommission]: [
    { to: `/posts/${SLUG.mgt}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.twoTier}`, post: true, title: '', summary: '' },
  ],
  [SLUG.vacancies]: [
    { to: `/posts/${SLUG.costOfLiving}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.staffing}`, post: true, title: '', summary: '' },
  ],
  [SLUG.costOfLiving]: [
    { to: `/posts/${SLUG.twoTier}`, post: true, title: '', summary: '' },
    { to: `/posts/${SLUG.fireCommission}`, post: true, title: '', summary: '' },
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
              logo: {
                '@type': 'ImageObject',
                url: OG_IMAGE,
                width: 1000,
                height: 1000,
              },
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
                name: 'The Facts',
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
  const meta = getPostMeta(post.slug)
  const category = post.categories[0] ?? 'Public Safety'
  const { html, toc } = buildArticle(post.html)

  return (
    <>
      <div className="masthead">
        {post.masthead ?? 'PublicSafetyFactsHawaii'}
      </div>

      <header className="post-header">
        <nav className="post-crumbs" aria-label="Breadcrumb">
          <Link to="/">The Facts</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{post.kicker ?? category}</span>
        </nav>

        <div
          className={`post-header-grid${meta ? '' : ' post-header-grid--solo'}`}
        >
          <div className="post-header-main">
            {post.kicker && <div className="kicker">{post.kicker}</div>}
            {post.titleHtml ? (
              <h1 dangerouslySetInnerHTML={{ __html: post.titleHtml }} />
            ) : (
              <h1>{post.title}</h1>
            )}
            {post.subtitle && <p className="deck">{post.subtitle}</p>}
            <div className="post-byline-row">
              {post.byline && <span className="post-byline">{post.byline}</span>}
              <ViewCounter
                pagePath={`/posts/${post.slug}`}
                label="reads"
                trackView
              />
            </div>
          </div>

          {meta && (
            <div className="post-header-media" aria-hidden="true">
              {meta.photo ? (
                <img
                  src={`/photos/${meta.photo}`}
                  alt=""
                  className="post-hero-img"
                />
              ) : (
                <div className="post-hero-stat">
                  <span className="post-hero-stat-topic">{meta.topic}</span>
                  <span className="post-hero-stat-num">{meta.stat}</span>
                  <span className="post-hero-stat-label">{meta.statLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="post-layout">
        <aside className="post-aside">
          <div className="post-aside-sticky">
            <div className="post-aside-block">
              <div className="post-aside-label">Share this Article</div>
              <ShareBar url={shareUrl} title={post.title} />
            </div>
            <ArticleToc items={toc} />
          </div>
        </aside>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <ActionCta />

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
