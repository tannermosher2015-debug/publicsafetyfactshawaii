# Blog

A personal blog site for publishing and sharing articles. Built with TanStack Start and deployed on Netlify.

## Tech Stack

- **Framework**: TanStack Start (React 19, TanStack Router v1)
- **Build**: Vite 7
- **Styling**: Tailwind CSS 4
- **Content**: Content Collections (type-safe markdown files)
- **Language**: TypeScript 5.7 (strict mode)
- **Deployment**: Netlify

## Running Locally

```bash
npm install
npm run dev
```

The dev server starts at http://localhost:3000 (or http://localhost:8888 via the Netlify CLI).

## Writing Articles

Add markdown files to `content/posts/`. Each file requires this frontmatter:

```markdown
---
date: 2025-01-01
title: "Your Article Title"
summary: "A short description of the article."
categories:
  - General
image: placeholder.png
---

Article content here...
```

New articles appear automatically on the home page listing.

## Latest Updates social feed

The home page includes a **Latest Updates** section that automatically pulls
recent public posts from the project's Facebook Page and Instagram account via
the Meta Graph API.

All Meta API calls are made server-side by the Netlify Function at
`netlify/functions/social-feed.mts` (served at `/social-feed`). Access tokens
are never exposed to the browser. The response is cached at the CDN for about
15 minutes to keep Meta API usage low.

Set these Netlify environment variables (Site settings → Environment variables)
for the feed to work:

| Variable | Description |
|----------|-------------|
| `META_ACCESS_TOKEN` | Long-lived Meta/Facebook Page access token |
| `FB_PAGE_ID` | Facebook Page ID |
| `IG_USER_ID` | Instagram Business or Creator account ID |
| `META_GRAPH_VERSION` | Graph API version (optional; defaults to `v25.0`) |

If the variables are missing or the Meta API fails, the site still loads and the
section shows a friendly fallback message linking visitors to the social pages.

