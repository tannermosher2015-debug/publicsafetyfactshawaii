import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

import SocialLinks from '@/components/SocialLinks'

// Structured newsroom footer, identical on every route. `children` is optional
// fine print (e.g. an article's data-methodology note); `social` is accepted for
// backward compatibility but the social row is always shown in the brand column.
export default function SiteFooter({
  children,
}: {
  children?: ReactNode
  social?: boolean
}) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="footer-mark" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="var(--ember)" />
              <rect x="10" y="11" width="16" height="2.7" rx="1.35" fill="var(--smoke)" />
              <rect x="10" y="16.7" width="16" height="2.7" rx="1.35" fill="var(--smoke)" opacity="0.5" />
              <rect x="10" y="22.4" width="10" height="2.7" rx="1.35" fill="var(--smoke)" />
            </svg>
          </span>
          <p className="footer-name">Public Safety Facts Hawai&#699;i</p>
          <p className="footer-mission">
            Independent, public-records reporting on Hawai&#699;i firefighter pay,
            staffing, and labor rights.
          </p>
          <SocialLinks />
        </div>

        <nav className="footer-col" aria-label="Site">
          <h3 className="footer-h">Explore</h3>
          <Link to="/">The Facts</Link>
          <Link to="/about">About</Link>
          <Link to="/how-we-source">Methodology</Link>
          <Link to="/glossary">Glossary</Link>
          <Link to="/disclaimer">Disclaimer</Link>
        </nav>

        <div className="footer-col footer-col--wide">
          <h3 className="footer-h">Independence</h3>
          <p className="footer-note">
            This site is not affiliated with any government agency, department, or
            union. Every figure is drawn from a public record you can verify for
            yourself.
          </p>
        </div>
      </div>

      {children && <div className="footer-fine">{children}</div>}

      <div className="footer-base">
        <span>&copy; 2026 Public Safety Facts Hawai&#699;i</span>
        <span className="footer-credits">
          Photos: U.S. Navy, U.S. Marine Corps, U.S. Coast Guard, FEMA &amp;
          National Park Service (public domain)
        </span>
      </div>
    </footer>
  )
}
