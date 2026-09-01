// TEMPORARY probe, delete once the routing question is settled.
// Question: with nitro now owning the build output, does Vercel still build a
// plain /api function alongside it? When framework was null this 404'd, but that
// deployment had no functions at all. Nitro's server/routes/ is not scanned in
// this setup (proven locally: the probe never reached .output while a control
// string did), so if this answers, the three ported handlers live here.
export default {
  fetch() {
    return new Response(JSON.stringify({ ok: true, from: 'vercel api function' }), {
      headers: { 'content-type': 'application/json' },
    })
  },
}
