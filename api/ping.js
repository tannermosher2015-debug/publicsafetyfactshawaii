// TEMPORARY diagnostic, delete once the Vercel adapter is proven.
// Self-contained on purpose: it imports nothing, least of all the build output.
// If /api/ping answers and /api/index 404s, the fault is the import in index.js.
// If both 404, Vercel is not building this project's /api directory at all, and
// the fix is the Build Output API rather than zero-config functions.
export default {
  fetch() {
    return new Response('pong', { headers: { 'content-type': 'text/plain' } })
  },
}
