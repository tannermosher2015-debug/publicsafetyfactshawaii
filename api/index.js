// Vercel entry point for the TanStack Start SSR server.
//
// The build emits dist/server/server.js whose default export is already
// `{ fetch(request) }`, the Web Standard handler shape Vercel documents for
// non-framework functions (and names H3 compatibility for explicitly, which is
// what @tanstack/start-server-core renders through). So there is nothing to
// adapt: re-export it and Vercel drives it directly, streaming included.
//
// Why this file exists at all rather than a plugin: TanStack Start 1.168 has no
// `target` option and does not use Nitro, so hosts wire themselves up with their
// own vite plugin (see @netlify/vite-plugin-tanstack-start, all of 10K). No
// Vercel equivalent is published, and this is the whole of what one would do.
export { default } from '../dist/server/server.js'
