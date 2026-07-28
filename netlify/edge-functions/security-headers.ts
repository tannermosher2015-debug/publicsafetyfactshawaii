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
 * script-src NEEDS 'unsafe-inline', and finding that out cost a deploy.
 * A DOM scan of the finished page shows only application/ld+json scripts,
 * which browsers never execute, so a strict "script-src 'self'" looked safe.
 * It is not: React and TanStack Start emit executable inline scripts during
 * hydration which run and are then cleaned out of the DOM, so scanning the
 * END STATE cannot see them. Deploy preview 2 produced 10 "Executing inline
 * script violates ... 'script-src 'self''" violations across five pages, and
 * blocked hydration. Hashes are not an option: the violations reported a
 * different sha256 per page, and they change on every build.
 *
 * 'unsafe-inline' does weaken the XSS protection this header exists for. The
 * rest of the policy still earns its place: no external script origin can
 * load, object-src is none, and base-uri, form-action and frame-ancestors are
 * all locked to self.
 *
 * style-src needs 'unsafe-inline' too: article bar charts set width and
 * background through style="" attributes, which CSP counts as inline styles.
 *
 * frame-src stays 'none'. Deploy previews log one violation for the
 * app.netlify.com preview banner iframe; that banner does not exist in
 * production, and no page on this site embeds an iframe.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
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
