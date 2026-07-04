import { createFileRoute, Link } from '@tanstack/react-router'

import SiteFooter from '@/components/SiteFooter'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export const Route = createFileRoute('/how-we-source')({
  head: () => ({
    meta: [
      { title: `How We Source This | ${SITE_NAME}` },
      {
        name: 'description',
        content:
          'How PublicSafetyFactsHawaii sources its facts: every claim traces to a public record, dollar scenarios are labeled estimates, and each article cites where to verify it.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/how-we-source` },
      { property: 'og:title', content: `How We Source This | ${SITE_NAME}` },
      {
        property: 'og:description',
        content:
          'The sourcing standard behind every article: public records, cited claims, labeled estimates.',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `How We Source This | ${SITE_NAME}` },
      {
        name: 'twitter:description',
        content:
          'The sourcing standard behind every article: public records, cited claims, labeled estimates.',
      },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/how-we-source` }],
  }),
  component: HowWeSourcePage,
})

function HowWeSourcePage() {
  return (
    <>
      <div className="masthead">PublicSafetyFactsHawaii</div>

      <nav className="back-nav">
        <Link to="/" className="back-link">
          &larr; Back to Home
        </Link>
      </nav>

      <header className="hero">
        <div className="kicker">Methodology · PublicSafetyFactsHawaii</div>
        <h1>How We Source This</h1>
        <p className="deck">
          The whole point of this site is that you should not have to take our
          word for it. Every claim traces to a public record you can check.
        </p>
        <div className="byline">
          PublicSafetyFactsHawaii · publicsafetyfactshawaii.org
        </div>
      </header>

      <div className="article-wrap">
        <div className="article-body">
          <p>
            Public safety compensation in Hawaii is decided in the open: in
            binding arbitration awards, county budgets, union contracts,
            commission meetings, and federal law. The record exists. It is just
            scattered across agencies, written in technical language, and rarely
            explained. This site gathers it and explains it, and this page lays
            out the rules we hold ourselves to while doing it.
          </p>

          <h2>The records we rely on</h2>
          <p>Our claims come from primary, public sources, including:</p>
          <ul>
            <li>
              <strong>Federal law and regulation</strong> for the overtime rules:
              the Fair Labor Standards Act, including the Section 7(k) exemption,
              and the Department of Labor regulations that govern it.
            </li>
            <li>
              <strong>Binding arbitration awards</strong> for firefighter and
              police contract outcomes, and the county council resolutions that
              adopt their cost items.
            </li>
            <li>
              <strong>County budgets and commissioned studies</strong>, including
              the Maui County program budget and the MGT classification and
              compensation study the county paid for.
            </li>
            <li>
              <strong>Department records</strong>, such as the Maui Fire
              Department operational roster and Fire and Public Safety Commission
              meeting minutes.
            </li>
            <li>
              <strong>Official wage and income data</strong>, including state
              salary schedules, the Hawaii Housing Finance and Development
              Corporation income guidelines, and Bureau of Labor Statistics cost
              of living figures.
            </li>
            <li>
              <strong>National safety standards and research</strong> for
              staffing, such as NFPA 1710 and federal crew-size studies.
            </li>
          </ul>

          <h2>How we handle numbers</h2>
          <p>
            Where a figure is a single verifiable fact, we cite the record it
            comes from. Where a figure is a projection, such as overtime lost
            over a career, we label it an estimate, show the assumptions behind
            it, and note that individual outcomes vary. We prefer the primary
            document over a summary of it, and we say so when a number is drawn
            from someone with direct knowledge rather than a published table.
          </p>

          <h2>What we do not do</h2>
          <p>
            We do not state speculation as fact, and we do not present opinion as
            data. The goal is public understanding, not outrage. When the record
            is incomplete or a figure is contested, we say that plainly instead
            of filling the gap.
          </p>

          <h2>Check it yourself</h2>
          <p>
            Every article ends with a Sources and References list identifying the
            documents behind its claims. Most of those records are public: county
            budgets and studies through the{' '}
            <a href="https://www.mauicounty.gov" rel="noopener noreferrer">
              County of Maui
            </a>
            , state salary schedules through the{' '}
            <a href="https://dhrd.hawaii.gov" rel="noopener noreferrer">
              Hawaii Department of Human Resources Development
            </a>
            , legislation and testimony through the{' '}
            <a href="https://www.capitol.hawaii.gov" rel="noopener noreferrer">
              Hawaii State Legislature
            </a>
            , and federal wage law through the U.S. Department of Labor. If you
            find something you believe we got wrong, we want to know. New to the
            terminology? See the{' '}
            <Link to="/glossary" className="disclaimer-link">
              plain-language glossary
            </Link>
            .
          </p>

          <h2>Independence</h2>
          <p>
            This is an independent community education project. It is not
            affiliated with, funded by, or speaking on behalf of HFFA, the IAFF,
            the State of Hawaii, any county government, any fire department, or
            any employer or political organization. For the full statement, see
            our{' '}
            <Link to="/disclaimer" className="disclaimer-link">
              disclaimer
            </Link>
            , or read more{' '}
            <Link to="/about" className="disclaimer-link">
              about this site
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
