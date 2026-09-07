# PublicSafetyFactsHawaii - site rules

Independent community-education blog on Hawaii firefighter pay, overtime, and labor rights
(**publicsafetyfactshawaii.org**). Canonical brand name = **"PublicSafetyFactsHawaii"**.

## Stack
**TanStack Start** (React 19, TanStack Router v1) · **Vite 8** · **Tailwind CSS 4** ·
**Content Collections** (markdown posts in `content/posts/`) · **Drizzle ORM** · deployed on
**Vercel** since 2026-09-01 (`a5e21a4` through `a363f8c`), confirmed 2026-09-07 by the live
response header `Server: Vercel`. Three endpoints, all `api/*.ts`: `views.ts` (DB view counter at
`/api/views`), `subscribe.ts`, and `send-newsletter.ts`. The old `social-feed` function did NOT
come across and exists only in the untracked `.netlify/` build cache; ignore every mention of it.

- **DNS is still at Netlify and that is not a leftover you can ignore.** Measured 2026-09-07: the
  apex nameservers are `dns1..4.p04.nsone.net`, which is Netlify DNS, while the A records point at
  Vercel. So the site spans two vendors, and any record change (a TXT for verification, the Resend
  SPF and DKIM) is made in the Netlify zone, not in Vercel and not in Hostinger. There are no MX
  records, so no email rides on this domain.
- `netlify/edge-functions/security-headers.ts` is still tracked and is now dead: headers moved into
  `vercel.json`. Left in place rather than deleted, but do not edit it expecting an effect.

- Markdown is rendered to HTML **at build** (content-collections `transform`; `marked` is a
  devDep, don't ship it to the client).
- `sitemap.xml` is **generated at build** (content-collections `onSuccess`). **Do not hand-edit it.**
- Fonts are **self-hosted** via `@fontsource` (Playfair Display, Source Serif 4, DM Mono),
  no Google Fonts `<link>`. Identity = editorial/newspaper, **fire/smoke/ember** palette.

## Deploy = `git push` to `main`
- Pushing `main` **auto-deploys to Vercel. A push is a publish**, so build and verify first.
  Measured 2026-09-07: a push went live in about 2.5 minutes, confirmed by polling the live file
  with a cache-buster rather than by trusting the deploy.
- **Push auth is per-machine, check before assuming.** Run `git remote -v` and match the protocol
  to the machine you are on:
  - **PC** (`C:\Users\Tanner Ray Mosher`): no GitHub SSH key, but `gh` is authed and
    `credential.helper=manager`, so the **HTTPS** remote pushes fine (verified 2026-07-16).
  - **Laptop** (`C:\Users\Tanne`): pushes over **SSH**
    (`git@github.com:tannermosher2015-debug/publicsafetyfactshawaii`, key `~/.ssh/id_ed25519_frontline`).
  - A push that 403s means this machine lacks that protocol's setup: switch protocol, don't force it.
- **A push also MAILS the list, and the timing is a race.** `api/send-newsletter.ts` is scheduled
  `0 15 * * *` by the `crons` block in **`vercel.json`**, which is **15:00 UTC / 05:00 HST**, and it reads the **deployed**
  `rss.xml`, not the repo. It sends any post under `RECENCY_DAYS` (21) not already in
  `newsletter_sends`, capped at `MAX_PER_RUN` (2) per run. So a post is mailed that morning only if
  it is **live before 15:00 UTC**, and the deploy takes a couple of minutes (2.5 min on Vercel,
  measured 2026-09-07). The race below was measured on NETLIFY, before the move, and is kept
  because the shape of the trap did not change with the host. Measured 2026-08-13: push
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
- **The `crew-data` page is gone.** There is no `src/routes/crew-data*` file as of 2026-09-07;
  `vercel.json` now 301s `/crew-data` and `/crew-data/*` to the five-person-crews post. The old
  advice about it needing a trailing slash in vite dev no longer applies to anything.
