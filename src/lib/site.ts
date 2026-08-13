export const SITE_URL = 'https://publicsafetyfactshawaii.org'
export const SITE_NAME = 'PublicSafetyFactsHawaii'

// The square brand mark. Correct for schema.org Organization/publisher logo, and
// WRONG for og:image: twitter:card=summary_large_image crops to 1.91:1, so a 1:1
// logo gets cut. Use OG_CARD_* for social cards.
export const OG_IMAGE = `${SITE_URL}/logo.jpg`

// Social cards are cut to a fixed 1200x630 by scripts/optimize-images.mjs, so
// these declared dimensions are true for every photo.
export const OG_CARD_WIDTH = 1200
export const OG_CARD_HEIGHT = 630
/** 1200x630 social card for a photo in /photos; site default when none is given. */
export function ogCard(photo?: string): string {
  const base = photo ? photo.replace(/\.jpe?g$/i, '') : 'hero'
  return `${SITE_URL}/photos/${base}-og.jpg`
}

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
