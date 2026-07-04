import { createFileRoute, Link } from '@tanstack/react-router'

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { SITE_URL } from '@/lib/site'

export const Route = createFileRoute('/disclaimer')({
  head: () => ({
    meta: [
      {
        title: 'Disclaimer | PublicSafetyFactsHawaii',
      },
      {
        name: 'description',
        content:
          'PublicSafetyFactsHawaii is an independent community education project. Content is for informational purposes only and is not affiliated with any government agency, county, union, or employer.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/disclaimer` },
      {
        property: 'og:title',
        content: 'Disclaimer | PublicSafetyFactsHawaii',
      },
      {
        property: 'og:description',
        content:
          'PublicSafetyFactsHawaii is an independent community education project. Content is for informational purposes only.',
      },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/disclaimer` }],
  }),
  component: DisclaimerPage,
})

function DisclaimerPage() {
  return (
    <>
      <SiteHeader />

      <nav className="back-nav">
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </nav>

      <header className="hero">
        <div className="kicker">Site Policy · PublicSafetyFactsHawaii</div>
        <h1>Disclaimer</h1>
        <p className="deck">
          This site is an independent community education project. Content is
          provided for informational purposes only and does not constitute legal,
          financial, or labor relations advice.
        </p>
        <div className="byline">
          PublicSafetyFactsHawaii · publicsafetyfactshawaii.org
        </div>
      </header>

      <div className="article-wrap">
        <div className="article-body">
          <div className="callout-dark">
            <span className="callout-label">Core Disclaimer</span>
            <p>
              This site is an independent community education project. Content is
              provided for informational purposes only and does not constitute
              legal, financial, or labor relations advice. This site is not
              affiliated with, endorsed by, or representative of any government
              agency, county, union, or employer. All data is drawn from publicly
              available government records and cited sources. Readers are
              encouraged to verify information independently.
            </p>
          </div>

          <div className="divider">— ◆ —</div>

          <h2>Independence</h2>

          <p>
            PublicSafetyFactsHawaii is operated independently by a private
            individual. It is not affiliated with, sponsored by, funded by, or
            acting on behalf of any of the following:
          </p>

          <ul className="article-list">
            <li>
              The Hawaii Firefighters Association (HFFA) or any local affiliate
            </li>
            <li>The International Association of Fire Fighters (IAFF)</li>
            <li>The State of Hawaii or any Hawaii county government</li>
            <li>The Maui Fire Department or any other fire department</li>
            <li>
              Any employer, bargaining unit, political party, or candidate
            </li>
          </ul>

          <p>
            Content published here reflects independent research and community
            education — not the official position of any organization.
          </p>

          <div className="divider">— ◆ —</div>

          <h2>Informational Purpose Only</h2>

          <p>
            Nothing on this site constitutes legal advice, labor relations
            advice, financial advice, or professional guidance of any kind.
            Articles, data, and analysis are published to inform public
            understanding — not to substitute for qualified professional counsel.
          </p>

          <p>
            Readers with specific legal, labor, or financial questions should
            consult a licensed attorney, labor relations professional, or
            financial advisor.
          </p>

          <div className="divider">— ◆ —</div>

          <h2>Data &amp; Accuracy</h2>

          <p>
            All factual claims on this site are drawn from publicly available
            government records, federal statutes, official agency publications,
            court decisions, and other cited primary sources. Each article
            includes a sources and references section identifying the basis for
            specific claims.
          </p>

          <p>
            Dollar impact figures, wage estimates, and career projections are
            mathematical estimates based on stated assumptions. Individual
            outcomes will vary based on actual hours worked, pay rate, schedule,
            and career length. These figures are illustrative — not guarantees or
            certifications of any specific amount owed or earned.
          </p>

          <div className="pull-quote">
            <p>
              Readers are always encouraged to verify information independently
              using the primary sources cited in each article.
            </p>
          </div>

          <div className="divider">— ◆ —</div>

          <h2>No Endorsement</h2>

          <p>
            Reference to any organization, agency, statute, court decision, or
            publication does not constitute endorsement by or of that entity.
            External links and citations are provided for reference and
            verification purposes only.
          </p>

          <div className="divider">— ◆ —</div>

          <h2>Contact</h2>

          <p>
            Questions or corrections regarding specific content can be directed
            through the site's Facebook or Instagram pages. Verified factual
            corrections will be reflected in article updates with a notation of
            the change.
          </p>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
