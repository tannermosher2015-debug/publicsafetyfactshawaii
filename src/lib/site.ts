export const SITE_URL = 'https://publicsafetyfactshawaii.org'
export const SITE_NAME = 'Hawaii Public Safety Watch'
export const OG_IMAGE = `${SITE_URL}/og-default.jpg`

export const ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
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
