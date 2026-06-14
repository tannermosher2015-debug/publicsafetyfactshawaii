# Site Audit — publicsafetyfactshawaii.org

**Date:** 2026-06-13
**Scope:** Performance, code cleanliness, SEO & accessibility (dependencies: flag-only)
**Type:** Report only — no code was changed.
**Method:** Full source read + production build + local dev-server run (real bundle sizes, real network trace, accessibility snapshot). Backend functions (view counter DB, Meta feed) could not run locally without secrets, so their *behavior* was inferred from code + the live request pattern.

---

## Overall assessment

This is a **well-built site** — genuinely above average for a personal/independent blog. SEO and accessibility fundamentals are strong, the code is mostly clean and idiomatic, caching headers are thoughtfully configured, and the design system is coherent. The issues below are refinements, not rescues.

**Grade: B+.** The three things holding it back from an A: (1) a per-load serverless request waterfall, (2) the markdown parser shipping to the browser, and (3) a cluster of dead code / unused dependencies.

**Biggest wins, in order:**
1. Batch or SSR the view counters (kills 6 network calls + 6 DB hits per home load).
2. Render markdown to HTML at build time (removes ~40 KB from the article bundle).
3. Delete dead code + unused deps (smaller install, smaller supply-chain surface).

---

## What's already good (keep doing this)

- **Per-route SEO**: every route sets its own title, description, canonical, OG + Twitter tags.
- **Rich structured data**: JSON-LD for `WebSite`, `Organization`, `FAQPage`, `NewsArticle`, `BreadcrumbList`.
- **Semantics & a11y base**: one `<h1>` per page, `<nav aria-label>`, labelled `<section>` regions, `<details>/<summary>` FAQ, `:focus-visible` rings, honeypot on the form, `loading="lazy"` + alt text on social images, `rel="noopener noreferrer"` on every `target="_blank"`.
- **Caching strategy**: `netlify.toml` correctly splits immutable hashed assets (1y) from always-revalidate HTML, and forces a canonical apex host.
- **Route-level code splitting** already works — each route is its own small chunk (0.25–8 KB).
- **Graceful degradation**: when the view API and social feed fail, the page still renders cleanly with fallback copy (verified — no console errors).

---

## Performance

### P1 — View-counter request waterfall *(highest-impact)*
**Evidence (live network trace, home page):** 1 `POST /api/views` + **5** `GET /api/views?pagePath=…` + 1 `GET /social-feed` = **7 dynamic calls on a single page load.**

Each `<ViewCounter>` independently fetches its own count in a `useEffect` (`src/components/ViewCounter.tsx:6`). The home page renders ~6 of them (site views + featured + the static-page card + each listed post). And `netlify.toml:54` sets `/api/*` to `no-store`, so **the GET counts are never cached** — every visitor triggers 6 serverless invocations + 6 Postgres round-trips.

**Fix:** Separate "track a view" (1 POST per page) from "read counts" (1 batched GET).
- The function already supports returning *all* counts in one query (`netlify/functions/views.mts:39`). Add a batched read (e.g. `GET /api/views?paths=a,b,c` → `{path: count}` map) **or** fetch all counts once in the route `loader` (server-side) and pass them down as props.
- Let the read endpoint be CDN-cacheable for a short window (e.g. 60s `stale-while-revalidate`) instead of `no-store`; counts don't need to be real-time.

**Payoff:** ~7 requests → ~2, plus far less serverless/DB cost and faster, jump-free counts.

### P1 — `marked` is shipped to the browser
`src/routes/posts.$slug.tsx:195` calls `marked(post.content)` inside the component, so the markdown parser is bundled into the client. Result: the `posts._slug` chunk is **49.56 KB (15.3 KB gzip)** — most of it `marked`.

Post HTML is fully known at build time (Content Collections). **Render markdown → HTML once, ahead of the browser:**
- Best: use `@content-collections/markdown` and add an `html` field in the `transform` (`content-collections.ts`), then inject the precomputed HTML.
- Simpler: call `marked()` in the route `loader` (runs server-side) instead of the component.

**Payoff:** removes ~40 KB from the article bundle and stops re-parsing markdown in every reader's browser.

### P2 — Google Fonts: render-blocking + many variants
`src/routes/__root.tsx:34` loads a third-party Google Fonts stylesheet pulling **3 families across ~10 weight/italic variants** (Playfair Display, Source Serif 4 ×6, DM Mono ×2). The trace shows the CSS request + 4 woff2 downloads, all third-party and render-blocking.

**Fix:** self-host the woff2 files (drops the cross-origin stylesheet round-trip and the two `preconnect`s), subset to the weights actually used, and `preload` the 1–2 above-the-fold faces. `&display=swap` is already set — good.

### P3 — Informational
- **Main client chunk = 404 KB (127 KB gzip)** — this is the TanStack Start + React + Router runtime, loaded on every route. Mostly inherent to the framework; not much to trim without an architecture change. For a 4-article content site, a static-first stack (Astro, 11ty, plain TanStack static) would ship a fraction of the JS — flagging as a strategic option, not a quick fix.
- **`defaultPreloadStaleTime: 0`** (`src/router.tsx:11`) means hovering a link always refetches loader data. For static content, a non-zero stale time avoids redundant loader calls.

---

## Code cleanliness

### P1 — Dead code: `src/components/ui/card.tsx`
Exported but **never imported anywhere** (verified by grep). It also depends on Tailwind tokens that don't exist in this project (`bg-card`, `text-card-foreground`, `text-muted-foreground`) — `styles.css` defines none of them, so it couldn't even render correctly. **Delete it.**

This cascades: its only consumer of `cn()` is this file, so `src/lib/utils.ts` (`cn`) and the deps `clsx` + `tailwind-merge` become dead once it's gone.

### P1 — Unused dependencies
Zero imports in `src/`:
- `lucide-react` — and it's **declared twice** (`package.json:18` in `dependencies` *and* `:39` in `devDependencies`).
- `class-variance-authority`
- `tailwindcss-animate`
- (`clsx`, `tailwind-merge` — dead once `card.tsx` is removed)

Removing these shrinks install time and supply-chain surface.

### P2 — Duplicated footer + social SVGs (DRY)
The same `<footer className="site-footer">` block — including the two big inline Facebook/Instagram SVG `path` strings — is copy-pasted across **4 files**: `blog-posts.tsx`, `posts.$slug.tsx`, `about.tsx`, `disclaimer.tsx`. The SVG paths also repeat inside `ShareBar.tsx`.

**Fix:** extract a `<SiteFooter>` component and a small `<SocialIcon>` (or an icons module). One source of truth; every page updates together.

### P2 — Brand name is inconsistent (also an SEO issue)
Three names are in play:
- `SITE_NAME = "Hawaii Public Safety Watch"` (`src/lib/site.ts:2`) — used in `<title>`, OG, JSON-LD.
- Visible brand **"PublicSafetyFactsHawaii"** — mastheads, the home `<h1>`.
- The domain `publicsafetyfactshawaii.org`.

So search results and social cards say "Hawaii Public Safety Watch" while visitors see "PublicSafetyFactsHawaii." Pick **one** canonical brand and use it everywhere (titles, OG, schema, masthead). Mixed naming dilutes recognition in SERPs and shares.

### P2 — Fragile slug coupling
`src/routes/posts.$slug.tsx:11` hardcodes the four post slugs as long underscore strings, and slugs are **auto-derived from each post's title** (`content-collections.ts:25`). Changing any title silently changes its slug, which breaks: the hardcoded `RELATED` map, every URL in `sitemap.xml`, and any inbound/external links.

**Fix:** add an explicit `slug` to each post's frontmatter (the schema already permits it — `content-collections.ts:11`) and stop deriving from the title. URLs become stable and decoupled from headline edits.

### P3 — Smaller items
- **`<em>` injection hack** (`posts.$slug.tsx:179`): `post.title.replace('Two-Tier', '<em>Two-Tier</em>')` via `dangerouslySetInnerHTML` only works for one specific title. Move emphasis into a frontmatter field or CSS.
- **Slug transform** (`content-collections.ts:25`): `.replace('.md','')` runs on the *title* (which has no `.md`) and `String.replace` only replaces the first match — harmless today, but misleading.
- **Two parallel styling systems**: the standalone static pages (`public/crew-data/index.html`, `public/hawaii_firefighter_disciplines.html`) each carry their own inline `<style>` and re-implement the design separately from `styles.css`. Fine as deliberate "static islands," but be aware they can drift (they already use the "Hawaii Public Safety Watch" branding).

---

## SEO & Accessibility

### P2 — Hand-maintained sitemap will drift
`public/sitemap.xml` lists posts with hardcoded slugs and static `lastmod` dates. Since posts are added as markdown and slugs come from titles, the sitemap must be hand-edited every time — easy to forget. It's also **missing `/disclaimer`**, and home/about share a stale `2026-06-01` date.

**Fix:** generate `sitemap.xml` at build from `allPosts` (use each post's frontmatter date for `lastmod`). It then never drifts.

### P2 — View-counter layout shift (CLS)
`ViewCounter` returns `null` until its fetch resolves (`src/components/ViewCounter.tsx:38`), so meta rows reflow when the numbers pop in — a content jump for everyone and a re-announce for screen readers. Reserve the space (skeleton/placeholder width) so the row doesn't move.

### P3 — Contrast pass on small labels
Body greys are fine (`--ash #6B6560` on white ≈ 4.9:1). The risk areas are the **tiny 10–11px uppercase DM Mono labels** (`.post-card-meta`, `.byline`) and the **translucent white-on-dark** meta in the featured hero (`rgba(255,255,255,0.55)`). Small + letter-spaced + low-contrast compounds. Verify these against WCAG AA (4.5:1) and bump where needed.

### Notes (fine, just be aware)
- Staffing-data and disciplines links are raw `<a href>` (full page reloads) because they're static islands — expected, not a bug.
- `<html lang="en">` present; honeypot present; external links safe. Good.

---

## Dependencies *(flag only — nothing changed)*

| Concern | Detail | Suggested posture |
|---|---|---|
| **Drizzle on a pre-release** | `drizzle-orm` & `drizzle-kit` pinned `1.0.0-beta.22`; the v1 line is still beta/rc (`1.0.0-rc.4`), stable line is `0.45.2`. | Biggest dep risk — a beta ORM in production. Either keep the exact pin and watch the changelog deliberately, or move to stable `0.45.x`. |
| **npm audit** | **21 vulns (16 high, 5 moderate)**, concentrated in the build/dev toolchain (`tmp` path-traversal — fix available; `serialize-javascript` DoS — no fix). | Mostly not shipped to browsers. Run `npm audit fix` for the easy ones; re-check periodically. |
| **TanStack slightly behind** | react-router 1.168.22, react-start 1.167.41, router-plugin 1.167.22 vs latest 1.170/1.168. | Exact pins are fine; schedule periodic bumps together. |
| **Majors available** | vite 7→8, typescript 5→6, @vitejs/plugin-react 5→6, @types/node 22→25, marked 17→18. | Don't auto-take; upgrade deliberately with testing. |
| **Unused deps** | `lucide-react` (+ duplicate entry), `class-variance-authority`, `tailwindcss-animate` (+ `clsx`/`tailwind-merge` after `card.tsx` removal). | Remove. |

---

## Prioritized action list

**Quick wins (hours, low risk)**
1. Delete `src/components/ui/card.tsx` (+ `lib/utils.ts` if nothing else uses `cn`).
2. Remove unused deps and the duplicate `lucide-react` entry.
3. Extract `<SiteFooter>` + `<SocialIcon>`; replace the 4 copies.
4. Pick one canonical brand name; align titles/OG/schema/masthead.
5. Reserve space in `ViewCounter` to kill the CLS jump.

**High-impact (a day, medium effort)**
6. Batch/SSR the view counters; make reads CDN-cacheable. *(7 calls → ~2)*
7. Render markdown to HTML at build time; drop `marked` from the client. *(−~40 KB)*
8. Self-host + subset fonts.
9. Generate `sitemap.xml` at build; add `/disclaimer`.

**Deliberate decisions (not quick fixes)**
10. Add explicit `slug` frontmatter to decouple URLs from titles.
11. Decide Drizzle beta-vs-stable posture; run `npm audit fix`.
12. (Strategic) Consider whether a content site needs the full TanStack Start client runtime, or a static-first stack would serve readers with far less JS.

---

## Build & measurement reference

```
Client bundle (production, gzip in parens):
  index (app runtime)     404.37 KB  (126.75 KB)   ← every route
  posts._slug             49.56 KB   (15.30 KB)    ← includes marked
  index.css               30.12 KB   (6.54 KB)
  blog-posts              8.26 KB    (3.06 KB)
  disclaimer              6.57 KB    (2.51 KB)
  NewsletterSignup        3.22 KB    (1.39 KB)
  about                   2.95 KB    (1.28 KB)
  (route stubs)           ~0.25 KB each
Total dist/client: ~669 KB on disk.

Home-page dynamic calls observed live: 7
  POST /api/views ×1, GET /api/views ×5, GET /social-feed ×1
```
