import { Link } from '@tanstack/react-router'

import { type Post } from 'content-collections'
import ViewCounter from '@/components/ViewCounter'
import NewsletterSignup from '@/components/NewsletterSignup'
import SocialFeed from '@/components/SocialFeed'
import SiteFooter from '@/components/SiteFooter'

export type FaqItem = { q: string; a: string }

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
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const featured = showFeatured
    ? sortedPosts.find((post) => post.featured)
    : undefined
  const listedPosts = featured
    ? sortedPosts.filter((post) => post !== featured)
    : sortedPosts

  return (
    <>
      <div className="home-masthead">
        PublicSafetyFactsHawaii &nbsp;·&nbsp; Community Education Series
      </div>

      <nav className="home-nav" aria-label="Primary">
        <Link to="/" className="home-nav-link" activeOptions={{ exact: true }}>
          Hawaii Firefighter Facts
        </Link>
        <a href="/crew-data" className="home-nav-link">
          Staffing Data
        </a>
        <Link to="/about" className="home-nav-link">
          About
        </Link>
      </nav>

      <div className="home-header">
        <h1>{title}</h1>
        <p className="site-tagline">
          Public Safety · Labor · Hawaii
        </p>
        <div className="site-views">
          <ViewCounter pagePath="/" label="site views" trackView />
        </div>
      </div>

      <div className="home-body">
        {featured && (
          <Link
            to="/posts/$slug"
            params={{ slug: featured.slug }}
            className="featured-hero"
          >
            <div className="featured-hero-badge">★ Featured Story</div>
            {featured.kicker && (
              <div className="featured-hero-kicker">{featured.kicker}</div>
            )}
            <h2 className="featured-hero-title">{featured.title}</h2>
            <p className="featured-hero-summary">{featured.summary}</p>
            <div className="featured-hero-meta">
              <span>{featured.date}</span>
              {featured.categories.map((cat) => (
                <span key={cat}>{cat}</span>
              ))}
              <ViewCounter
                pagePath={`/posts/${featured.slug}`}
                label="reads"
              />
              <span className="featured-hero-cta">Read the full story →</span>
            </div>
          </Link>
        )}

        {showFeatured && (
          <a
            href="/hawaii_firefighter_disciplines.html"
            className="post-card"
          >
            <div className="post-card-kicker">
              Community Education / Public Safety
            </div>
            <h2 className="post-card-title">
              What Hawaii Firefighters Face for Us
            </h2>
            <p className="post-card-summary">
              One job title. A range of disciplines that most people have never
              seen laid out in one place. This article is about recognition —
              for the hazards these men and women face, and the communities they
              dedicate their lives to.
            </p>
            <div className="post-card-meta">
              <span>June 2026</span>
              <span>Community Education</span>
              <span>Public Safety</span>
              <ViewCounter
                pagePath="/hawaii_firefighter_disciplines.html"
                label="reads"
              />
              <span className="read-more">Read →</span>
            </div>
          </a>
        )}

        {listedPosts.map((post) => (
          <Link
            to="/posts/$slug"
            params={{ slug: post.slug }}
            key={post._meta.path}
            className="post-card"
          >
            {post.kicker && (
              <div className="post-card-kicker">{post.kicker}</div>
            )}
            <h2 className="post-card-title">{post.title}</h2>
            <p className="post-card-summary">{post.summary}</p>
            <div className="post-card-meta">
              <span>{post.date}</span>
              {post.categories.map((cat) => (
                <span key={cat}>{cat}</span>
              ))}
              <ViewCounter pagePath={`/posts/${post.slug}`} label="reads" />
              <span className="read-more">Read →</span>
            </div>
          </Link>
        ))}
      </div>

      {showFeatured && <SocialFeed />}

      <NewsletterSignup
        heading="Get the updates"
        blurb="People who read this site want to know what happens next. Leave your email and get a short note directly when there is real news to share — no spam, unsubscribe anytime."
      />

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
      </SiteFooter>
    </>
  )
}
