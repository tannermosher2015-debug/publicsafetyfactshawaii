import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { type Post } from 'content-collections'
import SiteHeader from '@/components/SiteHeader'
import { POST_META as META } from '@/lib/post-meta'
import ViewCounter from '@/components/ViewCounter'
import NewsletterSignup from '@/components/NewsletterSignup'
import SiteFooter from '@/components/SiteFooter'
import Photo from '@/components/Photo'

export type FaqItem = { q: string; a: string }

// Presentation metadata (topic + headline stat per slug) lives in @/lib/post-meta
// so the home listing and the article header read from one source (imported above).

// Rough reading time from the rendered HTML (strip tags, ~200 wpm).
function readTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

type Item = {
  key: string
  href: string
  internal: boolean
  slug?: string
  topic: string
  title: string
  summary: string
  date: string
  byline?: string
  readTime: string
  stat?: string
  statLabel?: string
  photo?: string
}

function postToItem(post: Post): Item {
  const m = META[post.slug]
  return {
    key: post._meta.path,
    href: `/posts/${post.slug}`,
    internal: true,
    slug: post.slug,
    topic: m?.topic ?? post.categories[0] ?? 'Public Safety',
    title: post.title,
    summary: post.summary,
    date: post.date,
    byline: post.byline,
    readTime: readTime(post.html),
    stat: m?.stat,
    statLabel: m?.statLabel,
    photo: m?.photo,
  }
}

// Two evergreen pages that aren't markdown posts but belong in the grid so it
// reads full and useful (the "supporting cards" alongside the articles).
const EXTRA_ITEMS: Item[] = [
  {
    key: 'disciplines',
    href: '/hawaii_firefighter_disciplines.html',
    internal: false,
    topic: 'Recognition',
    title: 'What Hawaii Firefighters Face for Us',
    summary:
      'One job title. A range of disciplines most people have never seen laid out in one place: the hazards these men and women face for the communities they serve.',
    date: '2026-06-01',
    byline: 'Community Education · Public Safety',
    readTime: '6 min read',
    stat: '1 job',
    statLabel: 'many disciplines most never see',
    photo: 'recognition.jpg',
  },
]

function CardMedia({ item }: { item: Item }) {
  return (
    <div className="psf-card-media" aria-hidden="true">
      {item.photo && (
        <Photo
          photo={item.photo}
          className="psf-card-img"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
        />
      )}
      <span className="psf-chip">{item.topic}</span>
      {item.stat && (
        <div className="psf-media-stat">
          <span className="psf-media-num">{item.stat}</span>
          <span className="psf-media-cap">{item.statLabel}</span>
        </div>
      )}
    </div>
  )
}

function Card({ item }: { item: Item }) {
  const inner = (
    <>
      <CardMedia item={item} />
      <div className="psf-card-body">
        <div className="psf-card-meta">
          <span>{item.date}</span>
          <span aria-hidden="true">·</span>
          <span>{item.readTime}</span>
        </div>
        <h3 className="psf-card-title">{item.title}</h3>
        <p className="psf-card-summary">{item.summary}</p>
        <div className="psf-card-foot">
          <span className="psf-source">
            <span className="psf-source-dot" aria-hidden="true" />
            {item.byline ?? 'PublicSafetyFactsHawaii'}
          </span>
          <span className="psf-read-more">Read →</span>
        </div>
      </div>
    </>
  )

  return item.internal && item.slug ? (
    <Link
      to="/posts/$slug"
      params={{ slug: item.slug }}
      className="psf-card"
    >
      {inner}
    </Link>
  ) : (
    <a href={item.href} className="psf-card">
      {inner}
    </a>
  )
}

// A guided reading order for first-time visitors: the three articles that, in
// sequence, explain the whole thesis. Slug -> one-line reason to read it.
const START_HERE: { slug: string; why: string }[] = [
  {
    slug: 'the_federal_exemption_that_costs_hawaii_firefighters_millions',
    why: 'The optional federal rule behind the paychecks.',
  },
  {
    slug: 'hawaii_s_two-tier_public_safety_system',
    why: 'How firefighter pay stacks up against police.',
  },
  {
    slug: 'maui_county_paid_for_a_study_that_made_the_case_for_firefighter_raises_then_gave_the_raises_only_to_management',
    why: "The county's own study, and how its logic applies to firefighters.",
  },
]

export default function BlogPosts({
  title,
  posts,
  showFeatured = false,
  faq,
}: {
  title: string
  posts: Post[]
  showFeatured?: boolean
  faq?: FaqItem[]
}) {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  // The hero is always the most recent article (sorted is newest-first).
  const featuredPost = showFeatured ? sorted[0] : undefined

  // Grid stays strictly newest-first by date, including the non-post
  // EXTRA_ITEMS cards. Topic filters below just filter this list, so they
  // inherit the same newest-first order.
  const gridItems: Item[] = [
    ...sorted.filter((p) => p !== featuredPost).map(postToItem),
    ...(showFeatured ? EXTRA_ITEMS : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const topics = ['All', ...new Set(gridItems.map((i) => i.topic))]
  const [activeTopic, setActiveTopic] = useState('All')
  const visible =
    activeTopic === 'All'
      ? gridItems
      : gridItems.filter((i) => i.topic === activeTopic)

  const featured = featuredPost ? postToItem(featuredPost) : undefined

  const startItems = showFeatured
    ? START_HERE.map((s) => {
        const post = sorted.find((p) => p.slug === s.slug)
        return post ? { slug: post.slug, title: post.title, why: s.why } : null
      }).filter((x): x is { slug: string; title: string; why: string } => x !== null)
    : []

  return (
    <>
      <a href="#main" className="psf-skip">
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        {showFeatured && (
          <section className="psf-hook-band" aria-label="What this site is about">
            <p className="psf-hook">
              In Hawaii, a firefighter can be required to work a 53-hour week
              before earning a single dollar of overtime.
              <span className="psf-hook-tag">
                That&rsquo;s one story in the public record. We tell the rest.
              </span>
            </p>
          </section>
        )}

        {featured && (
          <section className="psf-hero-wrap" aria-label="Featured story">
            <Link
              to="/posts/$slug"
              params={{ slug: featured.slug! }}
              className="psf-hero"
            >
              <Photo
                photo="hero.jpg"
                className="psf-hero-img"
                sizes="(max-width: 1120px) 100vw, 1120px"
                priority
              />
              <div className="psf-hero-top">
                <span className="psf-chip psf-chip-gold">Featured</span>
                <span className="psf-chip">{featured.topic}</span>
              </div>
              <div className="psf-hero-body">
                <h1 className="psf-hero-title">{featured.title}</h1>
                <p className="psf-hero-summary">{featured.summary}</p>
                <div className="psf-hero-meta">
                  <span className="psf-source psf-source-light">
                    <span className="psf-source-dot" aria-hidden="true" />
                    {featured.byline ?? 'PublicSafetyFactsHawaii'}
                  </span>
                  <span>{featured.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featured.readTime}</span>
                  <ViewCounter pagePath="/" label="site views" trackView />
                </div>
              </div>
            </Link>
          </section>
        )}

        {startItems.length === 3 && (
          <section className="psf-start" aria-labelledby="start-heading">
            <h2 id="start-heading" className="psf-start-head">
              New here? Start with these three.
            </h2>
            <ol className="psf-start-list">
              {startItems.map((s, i) => (
                <li key={s.slug}>
                  <Link
                    to="/posts/$slug"
                    params={{ slug: s.slug }}
                    className="psf-start-item"
                  >
                    <span className="psf-start-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="psf-start-body">
                      <span className="psf-start-title">{s.title}</span>
                      <span className="psf-start-why">{s.why}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="psf-listing" aria-labelledby="listing-heading">
          <div className="psf-section-head">
            <div>
              <h2 id="listing-heading" className="psf-section-title">
                {showFeatured ? 'The Facts' : title}
              </h2>
              <p className="psf-section-sub">
                Plain-language, fully sourced reporting on Hawaii firefighter
                pay, staffing, and labor rights.
              </p>
            </div>
            <span className="psf-sort">Newest first</span>
          </div>

          {topics.length > 2 && (
            <div className="psf-tabs" role="group" aria-label="Filter by topic">
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={activeTopic === t}
                  className={`psf-tab${activeTopic === t ? ' is-active' : ''}`}
                  onClick={() => setActiveTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="psf-grid">
            {visible.map((item) => (
              <Card key={item.key} item={item} />
            ))}
          </div>
        </section>

        <section className="psf-cta" aria-label="Go deeper">
          <Link
            to="/posts/$slug"
            params={{ slug: 'why_5_person_fire_crews_are_the_standard' }}
            className="psf-cta-card psf-cta-dark"
          >
            <span className="psf-cta-label">Go deeper</span>
            <h2 className="psf-cta-title">
              See the staffing data behind the headlines
            </h2>
            <span className="psf-cta-btn">Open the staffing data →</span>
            <div className="psf-cta-stat">
              <span className="psf-cta-num">5</span>
              <span className="psf-cta-cap">
                firefighters per crew, the federal NFPA&nbsp;1710 benchmark
              </span>
            </div>
          </Link>
          <div className="psf-cta-card psf-cta-quote">
            <blockquote>
              “All we ask is that our county acknowledges the sacrifices we are
              willing to make, because we love this community.”
            </blockquote>
            <cite>- A Hawaii firefighter, quoted in our reporting</cite>
          </div>
        </section>

        <div id="newsletter">
          <NewsletterSignup
            heading="Get the updates"
            blurb="People who read this site want to know what happens next. Leave your email and get a short note directly when there is real news to share, no spam, unsubscribe anytime."
          />
        </div>

        {faq && faq.length > 0 && (
          <section className="faq-section" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="faq-heading">
              Frequently Asked Questions
            </h2>
            <div className="faq-list">
              {faq.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary className="faq-question">{item.q}</summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
