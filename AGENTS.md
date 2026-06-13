# AGENTS.md

This document describes the project architecture for developers and AI agents working on this codebase.

## Project Overview

A personal blog site where users can publish and share articles. The home page lists all articles; each article has its own detail page. Built with TanStack Start and deployed on Netlify.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Content | Content Collections (type-safe markdown) |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
content/posts/        # Markdown blog articles (frontmatter + body)
public/               # Static assets (images, favicon)
src/
  components/         # Reusable React components
    ui/               # Primitive UI components (Card, etc.)
    blog-posts.tsx    # Article listing component
    Header.tsx        # Site header with navigation
  lib/
    utils.ts          # cn() Tailwind class helper
  routes/
    __root.tsx        # Root layout (Header, global styles)
    index.tsx         # Home page — lists all articles
    posts.$slug.tsx   # Article detail page
    category.$category.tsx  # Articles filtered by category
  styles.css          # Global Tailwind styles
content-collections.ts  # Zod schema for post frontmatter
vite.config.ts        # Vite + TanStack Start + Netlify plugin config
netlify.toml          # Netlify build and dev server config
```

## Content Model

Articles live in `content/posts/` as markdown files. Frontmatter is validated by the Zod schema in `content-collections.ts`:

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article title |
| `summary` | string | Short description shown in listings |
| `categories` | string[] | Category tags |
| `image` | string | Filename from `public/` |
| `date` | date | Publication date |
| `slug` | string (auto) | URL slug derived from filename |

Import articles via: `import { allPosts } from 'content-collections'`

## Routing

File-based routing via TanStack Router:

- `index.tsx` → `/` — article listing
- `posts.$slug.tsx` → `/posts/:slug` — single article
- `category.$category.tsx` → `/category/:category` — filtered listing

## Coding Conventions

- Components: PascalCase filenames
- Utilities/hooks: camelCase
- Routes: kebab-case files
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging
- Import paths use `@/` alias for `src/`
- Type-only imports with `import type`
- No comments unless the "why" is non-obvious

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins: TanStack Start, Netlify, Tailwind, Content Collections |
| `tsconfig.json` | TypeScript config with `@/*` path alias for `src/*` |
| `netlify.toml` | Build command, output directory, dev server settings |
| `content-collections.ts` | Zod schema for post frontmatter |
| `styles.css` | Tailwind imports + CSS custom properties |

## Development Commands

```bash
npm install
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
```

## Non-Obvious Decisions

- `content-collections` generates types at build time from markdown frontmatter — add new fields to the schema in `content-collections.ts` before using them in components.
- The `marked` library renders markdown body content as HTML in the post detail route.
- Adding a new `.md` file to `content/posts/` automatically makes it appear on the home page — no code changes needed.
