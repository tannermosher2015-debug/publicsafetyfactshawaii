import { Link } from '@tanstack/react-router'

// Shared newsroom masthead used on every route. The logotype links home from
// anywhere. A small "records ledger" mark (three gold/white rules) nods to the
// site's whole premise: facts pulled from public records.
export default function SiteHeader() {
  return (
    <header className="site-masthead">
      <Link to="/" className="brand" aria-label="Public Safety Facts Hawaii, home">
        <span className="brand-mark" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="var(--smoke)" />
            <rect x="10" y="11" width="16" height="2.7" rx="1.35" fill="var(--ember)" />
            <rect x="10" y="16.7" width="16" height="2.7" rx="1.35" fill="#ffffff" opacity="0.9" />
            <rect x="10" y="22.4" width="10" height="2.7" rx="1.35" fill="var(--ember)" />
          </svg>
        </span>
        <span className="brand-lockup">
          <span className="brand-name">Public Safety Facts</span>
          <span className="brand-sub">Hawai&#699;i &middot; Public Records</span>
        </span>
      </Link>

      <nav className="masthead-nav" aria-label="Primary">
        <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'active' }}>
          The Facts
        </Link>
        <Link to="/about" activeProps={{ className: 'active' }}>
          About
        </Link>
        <Link to="/how-we-source" activeProps={{ className: 'active' }}>
          Methodology
        </Link>
      </nav>

      <a href="/#newsletter" className="masthead-cta">
        Get updates
      </a>
    </header>
  )
}
