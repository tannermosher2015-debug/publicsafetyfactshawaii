import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { type Post } from 'content-collections'
import { SITE_NAME } from '@/lib/site'
import { POST_META as META } from '@/lib/post-meta'
import ViewCounter from '@/components/ViewCounter'
import NewsletterSignup from '@/components/NewsletterSignup'
import SocialFeed from '@/components/SocialFeed'
import SiteFooter from '@/components/SiteFooter'

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
        <img
          src={`/photos/${item.photo}`}
          alt=""
          className="psf-card-img"
          loading="lazy"
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
  const featuredPost = showFeatured
    ? sorted.find((p) => p.featured)
    : undefined

  const gridItems: Item[] = [
    ...sorted.filter((p) => p !== featuredPost).map(postToItem),
    ...(showFeatured ? EXTRA_ITEMS : []),
  ]

  const topics = ['All', ...new Set(gridItems.map((i) => i.topic))]
  const [activeTopic, setActiveTopic] = useState('All')
  const visible =
    activeTopic === 'All'
      ? gridItems
      : gridItems.filter((i) => i.topic === activeTopic)

  const featured = featuredPost ? postToItem(featuredPost) : undefined

  return (
    <>
      <a href="#main" className="psf-skip">
        Skip to content
      </a>

      <header className="psf-topbar">
        <Link to="/" className="psf-brand" activeOptions={{ exact: true }}>
          <span className="psf-brand-name">{SITE_NAME}</span>
          <span className="psf-brand-tag">Community Education Series</span>
        </Link>
        <nav className="psf-topnav" aria-label="Primary">
          <Link
            to="/"
            className="psf-topnav-link"
            activeOptions={{ exact: true }}
          >
            The Facts
          </Link>
          <Link
            to="/posts/$slug"
            params={{ slug: 'why_5_person_fire_crews_are_the_standard' }}
            className="psf-topnav-link"
          >
            Staffing Data
          </Link>
          <Link to="/about" className="psf-topnav-link">
            About
          </Link>
        </nav>
        <a href="#newsletter" className="psf-subscribe">
          Get updates
        </a>
      </header>

      <main id="main">
        {featured && (
          <section className="psf-hero-wrap" aria-label="Featured story">
            <Link
              to="/posts/$slug"
              params={{ slug: featured.slug! }}
              className="psf-hero"
            >
              <img
                src="/photos/hero.jpg"
                alt=""
                className="psf-hero-img"
                loading="eager"
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

        {showFeatured && <SocialFeed />}

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

      <SiteFooter social>
        PublicSafetyFactsHawaii &nbsp;·&nbsp; Community Education
        <div className="footer-disclaimer">
          <Link to="/about" className="disclaimer-link">
            About
          </Link>
          &nbsp;·&nbsp;
          <Link to="/disclaimer" className="disclaimer-link">
            Disclaimer
          </Link>
        </div>
        <div className="footer-credits">
          Photos: U.S. Navy, U.S. Coast Guard &amp; National Park Service
          (public domain)
        </div>
      </SiteFooter>
    </>
  )
}
