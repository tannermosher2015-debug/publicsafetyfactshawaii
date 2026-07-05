import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import '../styles.css'
import { OG_IMAGE, SITE_NAME } from '@/lib/site'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_NAME },
      { name: 'author', content: SITE_NAME },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '1000' },
      { property: 'og:image:height', content: '1000' },
      {
        property: 'og:image:alt',
        content: 'PublicSafetyFactsHawaii — firefighter pay and labor facts',
      },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/jpeg', href: '/logo.jpg' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
        <Scripts />
      </body>
    </html>
  )
}
