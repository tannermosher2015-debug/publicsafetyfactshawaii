import type { ReactNode } from 'react'

import SocialLinks from '@/components/SocialLinks'

// Shared page footer. Callers pass their own footer text/links as children;
// pass `social` to append the Facebook/Instagram icon row.
export default function SiteFooter({
  children,
  social = false,
}: {
  children: ReactNode
  social?: boolean
}) {
  return (
    <footer className="site-footer">
      {children}
      {social && <SocialLinks />}
    </footer>
  )
}
