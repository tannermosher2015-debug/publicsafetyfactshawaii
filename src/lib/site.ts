export const SITE_URL = 'https://publicsafetyfactshawaii.org'
export const SITE_NAME = 'PublicSafetyFactsHawaii'
export const OG_IMAGE = `${SITE_URL}/logo.jpg`

export const ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.jpg`,
    width: 1000,
    height: 1000,
  },
  description:
    'Independent community education on Hawaii firefighter pay, labor rights, and public safety facts.',
  sameAs: [
    'https://www.facebook.com/profile.php?id=61589182031011',
    'https://www.instagram.com/publicsafetyfactshawaii/',
  ],
  areaServed: {
    '@type': 'State',
    name: 'Hawaii',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'HI',
      addressCountry: 'US',
    },
  },
}
