import { createFileRoute, Link } from '@tanstack/react-router'

import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { SITE_NAME, SITE_URL } from '@/lib/site'

const TERMS: { term: string; def: string }[] = [
  {
    term: 'BU-11',
    def: 'The bargaining unit for firefighters in Hawaii, represented by the HFFA. When you see a "BU-11 contract," that is the firefighters’ union agreement.',
  },
  {
    term: 'BU-12',
    def: 'The bargaining unit for police officers in Hawaii, represented by SHOPO. It is negotiated separately from the firefighters’ contract.',
  },
  {
    term: 'HFFA',
    def: 'Hawaii Fire Fighters Association, the union representing Hawaii firefighters (the Maui Division is Local 1463), affiliated with the International Association of Fire Fighters (IAFF).',
  },
  {
    term: 'SHOPO',
    def: 'State of Hawaii Organization of Police Officers, the union that represents police officers (BU-12).',
  },
  {
    term: 'Section 7(k) exemption',
    def: 'A federal rule that lets a public employer wait until 212 hours in a 28-day cycle, about 53 hours a week, before owing a firefighter any overtime. It is optional; the county chooses whether to apply it.',
  },
  {
    term: 'ATB (across-the-board) raise',
    def: 'A raise that increases everyone’s base pay by the same percentage. It is separate from step raises.',
  },
  {
    term: 'Step / step advancement',
    def: 'An automatic raise tied to years of service, worth roughly 4 percent per step. A "step freeze" pauses these for a set number of years.',
  },
  {
    term: 'Interest arbitration',
    def: 'When a union and employer cannot agree on a contract, a neutral arbitrator decides the terms. The resulting award is final and binding.',
  },
  {
    term: 'Kelly schedule',
    def: 'A rotating schedule of 24-hour shifts. "Kelly days" are built-in relief days that lower annual hours; without them, firefighters work more hours per year.',
  },
  {
    term: 'Cost item',
    def: 'The parts of a contract that cost money, such as raises. The county council must approve them, usually by resolution, before they take effect.',
  },
  {
    term: 'Percentile',
    def: 'Where a salary ranks against comparable places. The 50th percentile is the middle of the market; the 75th means paid more than three-quarters of comparable employers.',
  },
  {
    term: 'MGT study',
    def: 'The classification and compensation study Maui County commissioned in 2025 for its directors and deputy directors, used to justify management raises.',
  },
  {
    term: 'NFPA 1710',
    def: 'A national fire-service standard for how quickly and with how many firefighters a company should arrive, used as the benchmark for safe crew size.',
  },
]

export const Route = createFileRoute('/glossary')({
  head: () => ({
    meta: [
      { title: `Plain-Language Glossary | ${SITE_NAME}` },
      {
        name: 'description',
        content:
          'Plain-language definitions of the terms behind Hawaii firefighter pay and staffing: BU-11, the 7(k) exemption, ATB raises, step advancement, arbitration, and more.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/glossary` },
      { property: 'og:title', content: `Plain-Language Glossary | ${SITE_NAME}` },
      {
        property: 'og:description',
        content:
          'The terms behind firefighter pay and staffing, explained the way you would to a neighbor.',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `Plain-Language Glossary | ${SITE_NAME}` },
      {
        name: 'twitter:description',
        content:
          'The terms behind firefighter pay and staffing, explained the way you would to a neighbor.',
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: 'Hawaii Firefighter Pay and Staffing Glossary',
          url: `${SITE_URL}/glossary`,
          hasDefinedTerm: TERMS.map((t) => ({
            '@type': 'DefinedTerm',
            name: t.term,
            description: t.def,
          })),
        },
      },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/glossary` }],
  }),
  component: GlossaryPage,
})

function GlossaryPage() {
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
        <h1>Plain-Language Glossary</h1>
        <p className="deck">
          The shorthand of public safety pay, explained the way you would explain
          it to a neighbor. No jargon required to follow along.
        </p>
        <div className="byline">
          PublicSafetyFactsHawaii · publicsafetyfactshawaii.org
        </div>
      </header>

      <div className="article-wrap">
        <div className="article-body">
          <dl className="glossary">
            {TERMS.map((t) => (
              <div className="glossary-item" key={t.term}>
                <dt>{t.term}</dt>
                <dd>{t.def}</dd>
              </div>
            ))}
          </dl>
          <p>
            Want to see these in context? Start with{' '}
            <Link to="/" className="disclaimer-link">
              the facts on the home page
            </Link>
            , or read{' '}
            <Link to="/how-we-source" className="disclaimer-link">
              how we source this
            </Link>
            .
          </p>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
