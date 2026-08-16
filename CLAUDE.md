# PublicSafetyFactsHawaii - site rules

Independent community-education blog on Hawaii firefighter pay, overtime, and labor rights
(**publicsafetyfactshawaii.org**). Canonical brand name = **"PublicSafetyFactsHawaii"**.

## Stack
**TanStack Start** (React 19, TanStack Router v1) · **Vite 8** · **Tailwind CSS 4** ·
**Content Collections** (markdown posts in `content/posts/`) · **Drizzle ORM** · deployed on
**Netlify**. Two Netlify functions: `views.mts` (DB view counter at `/api/views`) and
`social-feed.mts` (Meta Graph API at `/social-feed`).

- Markdown is rendered to HTML **at build** (content-collections `transform`; `marked` is a
  devDep, don't ship it to the client).
- `sitemap.xml` is **generated at build** (content-collections `onSuccess`). **Do not hand-edit it.**
- Fonts are **self-hosted** via `@fontsource` (Playfair Display, Source Serif 4, DM Mono),
  no Google Fonts `<link>`. Identity = editorial/newspaper, **fire/smoke/ember** palette.

## Deploy = `git push` to `main`
- Pushing `main` **auto-deploys to Netlify. A push is a publish**, so build and verify first.
- **Push auth is per-machine, check before assuming.** Run `git remote -v` and match the protocol
  to the machine you are on:
  - **PC** (`C:\Users\Tanner Ray Mosher`): no GitHub SSH key, but `gh` is authed and
    `credential.helper=manager`, so the **HTTPS** remote pushes fine (verified 2026-07-16).
  - **Laptop** (`C:\Users\Tanne`): pushes over **SSH**
    (`git@github.com:tannermosher2015-debug/publicsafetyfactshawaii`, key `~/.ssh/id_ed25519_frontline`).
  - A push that 403s means this machine lacks that protocol's setup: switch protocol, don't force it.
- **A push also MAILS the list, and the timing is a race.** `netlify/functions/send-newsletter.mts`
  is scheduled `0 15 * * *`, which is **15:00 UTC / 05:00 HST**, and it reads the **deployed**
  `rss.xml`, not the repo. It sends any post under `RECENCY_DAYS` (21) not already in
  `newsletter_sends`, capped at `MAX_PER_RUN` (2) per run. So a post is mailed that morning only if
  it is **live before 15:00 UTC**, and Netlify takes a couple of minutes. Measured 2026-08-13: push
  at 14:59:37, the run created its broadcasts at 15:00:58, the deploy went live around 15:02:30, and
  that day's new post **missed by about ninety seconds** and went out the next morning instead.
  Check the clock before pushing if the send date matters.

## ⚠️ Dependency landmines
- **Drizzle is pinned to `1.0.0-beta.22` deliberately. NEVER run `npm audit fix --force`**: it
  tries to downgrade drizzle-kit to 0.19.1, which is incompatible and **breaks the DB layer.**
  Remaining audit findings are build-time only.
- **The build is the real check**, not `tsc`: standalone `tsc` shows harmless
  content-collections virtual-module noise (`allPosts`/`Post`). `routeTree.gen.ts` has harmless
  LF↔CRLF churn on Windows, so **leave it unstaged.**

## Verifying
- **Before publishing a new post, run `node scripts/check-seo-lengths.mjs`.** It is not wired into
  the build, so it stays silent unless you call it. It flags titles over 62 and descriptions over
  160. Caught an 85-character `seoTitle`, the longest on the site, on 2026-08-13 after the post was
  already approved for push.
- Visual check is **`shot.ps1` against the deployed URL**, and review BOTH the desktop and mobile
  shot (see `~/.claude/rules/screenshots.md`). It worked cleanly here on 2026-08-13, decoding the
  hero and rendering every section. The older note that "the screenshot tool is flaky here" referred
  to the preview-server tools, which are never the path on either machine.
- `getComputedStyle` is still the right check for a CSS-only change where a shot proves nothing.
- The `crew-data` page only renders with internet (CDN React) so it's blank in the sandbox but fine
  on Netlify; `/crew-data` needs a **trailing slash** in vite dev.
