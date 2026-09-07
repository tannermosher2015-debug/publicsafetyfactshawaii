# Moving publicsafetyfactshawaii.org from Vercel to Hostinger

Written 2026-09-07. Every fact below was measured this session against the live
machine, not read out of a config or a previous note. Nothing has been changed.

## STOP. The reason is "one bill", and moving this site does not deliver it

Answered by Tanner 2026-09-07: the reason for the move is consolidating onto one
bill. Measured the same day against the Vercel API, that reason does not survive
contact with the account:

- The Vercel team **Fireline Web Design** is on the **`pro`** plan. So there is a
  real bill, and the instinct was right.
- **That team carries 12 projects, and publicsafetyfactshawaii is one of them.**
  The others: real-estate-on-molokai, kiai-fire-next, waena-inn, ohana-pickleball,
  smith-team-site, hulalei-designs, hffa-unionvote, mauifiresurvey,
  frontline-outreach, frontline-site-check, frontline-next-starter.

**So migrating this one site saves nothing.** Vercel Pro keeps billing for the
other 11 the day after the cutover, and the work below buys a slower host and a
day of risk in exchange for zero dollars. The bill is per plan, not per project.

The lever that actually moves the bill is dropping Pro to Hobby, which is free.
That is blocked by what else lives there: several of those 12 are paid client
sites, and Vercel's Hobby tier is not licensed for commercial use. So the real
question is not "how do we move this site", it is **"which of those 12 still need
to exist, and can what remains live somewhere free or already paid for"**.

Note on the price: `pro` is measured from the API, the dollar figure is not.
Vercel's published Pro rate is per member per month, and the actual invoice can
carry extra seats and usage on top. Read the invoice before quoting a saving.

**Recommendation: do not run the plan below yet.** It is correct as a migration
plan and it stays here for when a migration is actually the answer. First decide
the fate of all 12 projects. If the answer turns out to be "move everything to
Hostinger", this document is step one of twelve, not one of one.

## The original concern, written before that answer, kept because it still holds

Vercel is currently doing four things for this site at no cost we are paying:
SSR, three serverless endpoints, a daily cron, and TLS. Hostinger Business is
shared hosting with a Node app runner bolted on. The move is possible, and the
plan below is real, but it trades a platform built for this shape of app for one
that is not. Worth naming a reason before spending the day on it: cost,
consolidation onto one bill, or something Vercel is doing wrong. If it is
consolidation, that is a fine reason and the plan stands as written.

## What actually runs today (measured 2026-09-07)

| Thing | Where it is now | How I know |
|---|---|---|
| The site | Vercel | live response header `Server: Vercel`, `X-Vercel-Id: sfo1::iad1` |
| DNS | **Netlify**, not Vercel | apex NS = `dns1..4.p04.nsone.net`, which is Netlify DNS |
| apex A record | `216.150.1.1`, `216.150.16.1` | nslookup |
| www | CNAME to `27f2e06675df2973.vercel-dns-016.com` | nslookup |
| Email (MX) | **none** | MX lookup returned no records |
| Database | Neon Postgres, external, store `publicsafetyfacts-db` | `db/index.ts` comment and `drizzle-orm/neon-http` |
| Newsletter sender | Resend | `api/send-newsletter.ts` |
| Cron | `/api/send-newsletter`, `0 15 * * *` | `vercel.json` `crons` |
| App type | TanStack Start + Nitro, server-rendered | `package.json` deps |
| Hostinger plan | `hostinger_business_v3`, active since 2026-06-07 | Hostinger orders API |
| This domain in Hostinger | **not present** | Hostinger websites API, 0 rows for `publicsafetyfacts` |

**The DNS line is the surprise and it changes the plan.** The 09-01 commit moved
the site to Vercel but left the zone at Netlify, so today there are two vendors
in the path. A move to Hostinger is therefore a move off *two* platforms, not
one, and Netlify is the one holding the records.

## What has to be rebuilt, not just copied

`vercel.json` is not a deploy config. It is carrying real behavior, and none of
it travels with the code:

1. **The cron.** `0 15 * * *` hitting `/api/send-newsletter`.
2. **Five redirects**, including the www to apex canonical redirect and three
   legacy paths (`/posts`, `/crew-data`, `/category/*`). Two of those legacy
   paths still earn Google clicks, so losing them costs traffic.
3. **Every security header, including the full Content-Security-Policy.**
4. **Cache-Control for assets, fonts, sitemap, rss and robots.**

On Hostinger these become either Nitro `routeRules` in the app, or `.htaccess`
at the docroot. Pick one and keep it in the repo, so the next session can see it.

## Five environment variables, none of them optional

`DATABASE_URL`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `RESEND_FROM`,
`CRON_SECRET`. Measured by grepping `process.env` across `api`, `db`, `src` and
`scripts`. `db/index.ts` throws at import time when `DATABASE_URL` is missing, so
a forgotten variable takes the whole site down rather than one endpoint.

**None of these values may pass through chat.** They come out of the Vercel
project settings and go into Hostinger's Node env editor, or into
`C:\Users\Tanne\.secrets\` first if they need to be staged.

## The order of work

Steps 1 to 6 change nothing the public can see. Step 7 is the cutover.

1. **Decouple Neon from Vercel first.** The database was provisioned through the
   Vercel integration. Confirm in the Neon console that the project survives
   independently, and capture the direct connection string. If the Neon project
   is owned by the Vercel integration, deleting the Vercel project later can take
   the database with it. Verify this before anything else.
2. **Confirm Resend's DNS records.** The newsletter sends from this domain, so
   Resend has SPF and DKIM records in the Netlify zone, most likely at
   `send.publicsafetyfactshawaii.org` and `resend._domainkey...`. Export the full
   zone from Netlify and keep a copy. Lose these and the newsletter silently
   stops being delivered, which nothing on the site will show you.
3. **Port the headers and redirects** into the repo, as Nitro `routeRules` or
   `.htaccess`. Do this while the old site is still up, so it can be diffed.
4. **Build for a Node server target.** The app currently builds through the
   Netlify Nitro plugin. Confirm a plain node-server build boots locally and
   serves `/`, `/api/views` and `/rss.xml`.
5. **Create the Hostinger site on a temporary subdomain**, not on the real
   domain. `hosting_createWebsiteV1` rewrites the DNS zone in the same call, so
   pointing it at the live domain IS the cutover. A subdomain keeps step 7 a
   decision rather than a side effect.
6. **Deploy and test on the subdomain**: the three endpoints, a real subscribe,
   the view counter, and the newsletter script in dry form. Do not let the cron
   run against the live audience during testing.
7. **Cutover.** Move the nameservers, or repoint the apex A and www CNAME,
   recreating every record from step 2. Then watch TLS issue, watch the five
   redirects, and re-run the sitemap and indexing check.

## Timing rule for the cutover day

The newsletter cron reads the **deployed** `rss.xml` and fires at 15:00 UTC,
which is 05:00 Hawaii time. Do not cut over inside that hour. If both the old and
the new host are briefly live with the same cron, the send can double, and the
only thing preventing a repeat send is the `newsletter_sends` table, which both
hosts would be writing to.

## What I need from you before step 1

1. **Answered 2026-09-07: one bill.** See the section at the top. That answer
   redirects the whole job away from this site, so the remaining questions only
   matter once the 12-project decision is made.
2. Which of the 12 Vercel projects are live and paid for, and which are dead
   scratch that can simply be deleted. I have not verified that; several read
   like tools or one-off surveys, but reading a project name is not evidence.
3. Whether Netlify is charging anything. Netlify DNS is free, so it may be a
   vendor you carry without a bill, which makes it a tidiness problem and not a
   cost one.
4. Who holds the Neon account and the Resend account.
5. Whether the domain registrar is Hostinger. The nameservers are Netlify's,
   which tells us nothing about where the domain is registered.
