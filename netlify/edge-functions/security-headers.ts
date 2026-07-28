import type { Context } from "@netlify/edge-functions";

/**
 * Security headers for every response, including SSR HTML.
 *
 * WHY THIS EXISTS instead of the [[headers]] block in netlify.toml:
 * netlify.toml [[headers]] only apply to STATIC files in the publish
 * directory. Every HTML page here is rendered by the TanStack Start SSR
 * function, and function responses bypass those rules entirely. Verified
 * 2026-07-28 against production: /robots.txt returned X-Frame-Options,
 * Referrer-Policy and Permissions-Policy, while every article page returned
 * none of them. The netlify.toml block was silently doing nothing for the
 * pages that actually matter. An edge function wraps the response after the
 * function produces it, so the headers land on both.
 *
 * The CSP is derived from a real request inventory, not guessed. Across the
 * home page, an article, /about and /glossary, all 63 requests were
 * same-origin: no CDN, no Google Fonts, no analytics, no third-party scripts.
 * Fonts are self-hosted via @fontsource.
 *
 * script-src is 'self' with NO 'unsafe-inline'. The only inline <script>
 * elements are application/ld+json (NewsArticle and BreadcrumbList schema),
 * which browsers never execute, so they need no script-src allowance.
 *
 * style-src DOES need 'unsafe-inline': article bar charts set width and
 * background through style="" attributes, which CSP counts as inline styles.
 * Removing that would mean moving every bar width into a stylesheet.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export default async (_request: Request, context: Context) => {
  const response = await context.next();

  // Only touch documents. Hashed assets, fonts and JSON keep their own
  // headers and their long-lived cache entries untouched.
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  return response;
};

export const config = { path: "/*" };
