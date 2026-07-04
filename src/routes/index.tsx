import { createFileRoute } from '@tanstack/react-router'

import { allPosts } from 'content-collections'

import BlogPosts, { type FaqItem } from '@/components/blog-posts'
import { ORGANIZATION_SCHEMA, SITE_NAME, SITE_URL } from '@/lib/site'

const FAQ: FaqItem[] = [
  {
    q: 'How much do Hawaii firefighters make?',
    a: "Hawaii firefighters are paid under the BU-11 bargaining unit on a step schedule that is one of the longest in the country, taking far more years to reach top pay than most mainland departments. Recent contract outcomes added smaller across-the-board raises than other public safety units received, and a multi-year stretch with no step movement. The articles on this site break down the specific figures from official records.",
  },
  {
    q: 'Why are Maui firefighters considered underpaid?',
    a: "In 2025 Maui County commissioned a professional compensation study that recommended substantial raises for management, citing the high cost of living and the need to stay competitive. The same arguments apply to firefighters, who negotiate under the BU-11 contract, yet those raises were not extended to them. The result is a widening gap between what the county pays its directors and its front-line public safety workers.",
  },
  {
    q: 'What is the FLSA Section 7(k) exemption for firefighters?',
    a: 'Section 7(k) of the federal Fair Labor Standards Act lets public employers use a work period of up to 28 days when calculating firefighter overtime. In practice a county can require up to 212 hours in a 28-day cycle, about 53 hours per week, before any overtime is owed. The exemption is optional: the county chooses to apply it. For Hawaii firefighters this means many hours of work that would be overtime in almost any other job are paid at straight time.',
  },
  {
    q: 'How does Hawaii firefighter pay compare to police?',
    a: "Both firefighters and police are sworn public safety employees of the same Hawaii county and state governments, working under the same state labor law. In recent bargaining, police secured the largest pay increase in nearly two decades, including annual raises and step increases. Firefighters received less than half that, paired with a four-year stretch with no step raises. Both outcomes are final, and the gap is now built into the pay schedules.",
  },
  {
    q: 'What is HFFA Local 1463?',
    a: 'HFFA Local 1463 is the Maui Division of the Hawaii Fire Fighters Association, the union that represents Hawaii firefighters and is affiliated with the International Association of Fire Fighters (IAFF). This site is an independent community education project and is not operated by, funded by, or speaking on behalf of HFFA, IAFF, or any government employer.',
  },
  {
    q: 'How many firefighters are on a fire crew, and why does it matter?',
    a: 'National safety standards such as NFPA 1710 recommend that fire companies arrive with enough firefighters to perform search, rescue, fire attack, and ventilation at the same time. Research shows five-person crews complete critical fireground tasks faster and more safely than smaller crews, which directly affects how quickly residents can be rescued. Our staffing-data page lays out the federal benchmarks and the numbers behind them.',
  },
]

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title:
          'Hawaii Firefighter Pay Facts | Independent Community Education',
      },
      {
        name: 'description',
        content:
          "Independent fact-based reporting on Hawaii firefighter pay, overtime, and labor rights. Plain-language data on wages your county isn't publicizing.",
      },
      {
        name: 'keywords',
        content:
          'Hawaii firefighters, Hawaii firefighter pay, public safety Hawaii, firefighter overtime Hawaii, HFFA, Maui firefighters, Hawaii labor',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/` },
      {
        property: 'og:title',
        content: `${SITE_NAME} | Firefighter Pay & Labor Facts`,
      },
      {
        property: 'og:description',
        content:
          "Independent community education on Hawaii firefighter pay, overtime, and labor rights. Plain-language facts on what your county isn't saying.",
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: `${SITE_NAME} | Firefighter Pay & Labor Facts`,
      },
      {
        name: 'twitter:description',
        content:
          "Independent community education on Hawaii firefighter pay, overtime, and labor rights. Plain-language facts on what your county isn't saying.",
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              url: `${SITE_URL}/`,
              name: SITE_NAME,
              description:
                'Independent community education on Hawaii firefighter pay, labor rights, and public safety.',
              publisher: { '@id': `${SITE_URL}/#organization` },
            },
            ORGANIZATION_SCHEMA,
          ],
        },
      },
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
      },
    ],
    links: [{ rel: 'canonical', href: `${SITE_URL}/` }],
  }),
  component: App,
})

function App() {
  return (
    <BlogPosts
      title="PublicSafetyFactsHawaii"
      posts={allPosts}
      showFeatured
      faq={FAQ}
    />
  )
}
