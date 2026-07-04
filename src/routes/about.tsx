import { createFileRoute, Link } from '@tanstack/react-router'

import SiteFooter from '@/components/SiteFooter'
import { ORGANIZATION_SCHEMA, SITE_NAME, SITE_URL } from '@/lib/site'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: `About | ${SITE_NAME}` },
      {
        name: 'description',
        content:
          'PublicSafetyFactsHawaii is an independent community education project on Hawaii firefighter pay, overtime, and labor rights, built from public records and cited sources.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/about` },
      { property: 'og:title', content: `About | ${SITE_NAME}` },
      {
        property: 'og:description',
        content:
          'Why this site exists, who it serves, and how its facts are sourced.',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `About | ${SITE_NAME}` },
      {
        name: 'twitter:description',
        content:
          'Why this site exists, who it serves, and how its facts are sourced.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          url: `${SITE_URL}/about`,
          name: `About | ${SITE_NAME}`,
          mainEntity: ORGANIZATION_SCHEMA,
        },
      },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <>
      <div className="masthead">PublicSafetyFactsHawaii</div>

      <nav className="back-nav">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </nav>

      <header className="hero">
        <div className="kicker">About · PublicSafetyFactsHawaii</div>
        <h1>About This Site</h1>
        <p className="deck">
          An independent community education project on Hawaii firefighter pay,
          overtime, and labor rights, written for the public, built from public
          records.
        </p>
        <div className="byline">
          PublicSafetyFactsHawaii · publicsafetyfactshawaii.org
        </div>
      </header>

      <div className="article-wrap">
        <div className="article-body">
          <p>
            PublicSafetyFactsHawaii exists to help residents understand how
            Hawaii's firefighters are paid, scheduled, and staffed, and how
            those decisions compare to the standards set for other public safety
            workers. Public safety compensation is shaped by binding arbitration
            awards, county budgets, union contracts, and federal labor law. Most
            of that record is public, but it is scattered, technical, and rarely
            explained in plain language. This site gathers it in one place.
          </p>

          <h2>Who this is for</h2>
          <p>
            We write for Hawaii residents, Maui community members, journalists,
            policymakers, and anyone who wants to understand the facts behind
            firefighter pay and staffing. The goal is public understanding, not
            outrage. We are educators, not complainers, and we try to explain
            each topic the way you would to a neighbor.
          </p>

          <h2>How we source our facts</h2>
          <p>
            Every factual claim is drawn from official government records,
            federal statutes such as the FLSA Section 7(k) exemption, binding
            arbitration awards, professional compensation studies, national
            standards like NFPA 1710, and established Hawaii news organizations.
            Dollar figures for multi-year scenarios are clearly labeled as
            estimates. Each article identifies the sources behind its claims so
            readers can verify the information independently. For the full
            standard, see{' '}
            <Link to="/how-we-source" className="disclaimer-link">
              how we source this
            </Link>
            .
          </p>

          <h2>Independence</h2>
          <p>
            This is an independent project. It is not affiliated with, funded by,
            or speaking on behalf of HFFA, the IAFF, the State of Hawaii, any
            county government, any fire department, or any employer or political
            organization. For the full statement, see our{' '}
            <Link to="/disclaimer" className="disclaimer-link">
              disclaimer
            </Link>
            .
          </p>
        </div>
      </div>

      <SiteFooter>
        PublicSafetyFactsHawaii &nbsp;·&nbsp; Independent Community Education
        &nbsp;·&nbsp; publicsafetyfactshawaii.org
        <div className="footer-disclaimer">
          <Link to="/disclaimer" className="disclaimer-link">
            Disclaimer
          </Link>
        </div>
      </SiteFooter>
    </>
  )
}
