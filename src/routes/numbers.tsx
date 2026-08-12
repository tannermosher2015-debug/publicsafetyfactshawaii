import { createFileRoute, Link } from '@tanstack/react-router'

import { allPosts } from 'content-collections'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { POST_META } from '@/lib/post-meta'
import { fmtDate } from '@/lib/fmt-date'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// Every figure on this page is the headline stat of a published article, read
// straight from POST_META. Nothing is restated by hand, so the page cannot drift
// from the articles that source it, and each row links to its own sourcing.
type Row = {
  slug: string
  topic: string
  stat: string
  statLabel: string
  title: string
  asOf: string
}

function buildRows(): Row[] {
  return allPosts
    .filter((p) => p.kind !== 'note' && POST_META[p.slug])
    .map((p) => {
      const m = POST_META[p.slug]!
      return {
        slug: p.slug,
        topic: m.topic,
        stat: m.stat,
        statLabel: m.statLabel,
        title: p.title,
        asOf: p.updated ?? p.date,
      }
    })
    .sort((a, b) => a.topic.localeCompare(b.topic) || (a.asOf < b.asOf ? 1 : -1))
}

const DESCRIPTION =
  'Every headline figure on this site in one place: firefighter and ocean safety pay, vacancies, overtime hours and staffing benchmarks, each linked to the public record it came from.'

export const Route = createFileRoute('/numbers')({
  head: () => ({
    meta: [
      { title: `By the Numbers | ${SITE_NAME}` },
      { name: 'description', content: DESCRIPTION },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/numbers` },
      { property: 'og:title', content: `By the Numbers | ${SITE_NAME}` },
      { property: 'og:description', content: DESCRIPTION },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `By the Numbers | ${SITE_NAME}` },
      { name: 'twitter:description', content: DESCRIPTION },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/numbers` }],
  }),
  component: NumbersPage,
})

function NumbersPage() {
  const rows = buildRows()
  const currentAsOf = rows.map((r) => r.asOf).sort().at(-1)

  // Group into topic sections while keeping the sorted order above.
  const topics = [...new Set(rows.map((r) => r.topic))]

  return (
    <>
      <SiteHeader />

      <nav className="back-nav">
        <Link to="/" className="back-link">
          &larr; Back to Home
        </Link>
      </nav>

      <header className="hero">
        <div className="kicker">Reference · PublicSafetyFactsHawaii</div>
        <h1>By the Numbers</h1>
        <p className="deck">
          Every figure this site has published, in one place. Each one links to
          the article that shows the record it came from and how it was
          calculated. Nothing here is an estimate of ours.
        </p>
        <div className="byline">
          {currentAsOf
            ? `Figures current as of ${fmtDate(currentAsOf)}`
            : 'PublicSafetyFactsHawaii'}{' '}
          · publicsafetyfactshawaii.org
        </div>
      </header>

      {/* Plain div, not <main>: __root.tsx already renders the page's <main>
          landmark and skip-link target around every route. */}
      <div className="psf-numbers">
        {topics.map((topic) => (
          <section
            className="psf-numbers-group"
            key={topic}
            aria-labelledby={`topic-${topic.replace(/\W+/g, '-').toLowerCase()}`}
          >
            <h2
              id={`topic-${topic.replace(/\W+/g, '-').toLowerCase()}`}
              className="psf-numbers-topic"
            >
              {topic}
            </h2>
            <ul className="psf-numbers-list">
              {rows
                .filter((r) => r.topic === topic)
                .map((r) => (
                  <li className="psf-numbers-item" key={r.slug}>
                    <Link
                      to="/posts/$slug"
                      params={{ slug: r.slug }}
                      className="psf-numbers-link"
                    >
                      <span className="psf-numbers-stat">{r.stat}</span>
                      <span className="psf-numbers-body">
                        <span className="psf-numbers-label">{r.statLabel}</span>
                        <span className="psf-numbers-src">
                          {r.title} · {fmtDate(r.asOf)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        <p className="psf-numbers-foot">
          Figures are updated when a new public record changes them, and the date
          on each row is the last time that article was checked against its
          source. See{' '}
          <Link to="/how-we-source">how we source this material</Link>.
        </p>
      </div>

      <SiteFooter />
    </>
  )
}
