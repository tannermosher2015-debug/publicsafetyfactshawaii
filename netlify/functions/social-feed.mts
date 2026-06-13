import type { Config, Context } from '@netlify/functions'

// Latest Updates social feed.
//
// Combines the most recent public posts from the project's Facebook Page and
// Instagram account into a single normalized JSON response. All Meta Graph API
// calls happen here, server-side, so the access token is never sent to the
// browser.
//
// Required Netlify environment variables (set in Site settings → Environment):
//   META_ACCESS_TOKEN  long-lived Meta/Facebook Page access token
//   FB_PAGE_ID         Facebook Page ID
//   IG_USER_ID         Instagram Business or Creator account ID
//   META_GRAPH_VERSION Graph API version (optional; defaults to v25.0)

const DEFAULT_GRAPH_VERSION = 'v25.0'
const TOTAL_LIMIT = 6
// Ask each platform for the full limit so that, after merging and sorting by
// date, the newest 6 across both platforms are guaranteed to be present.
const PER_PLATFORM_LIMIT = TOTAL_LIMIT

type NormalizedPost = {
  platform: 'facebook' | 'instagram'
  id: string
  text: string
  createdTime: string
  image: string | null
  url: string | null
  mediaType?: string
}

const isProduction = () =>
  (process.env.CONTEXT ?? process.env.NODE_ENV) === 'production'

// In production we never leak upstream error detail to the browser; in dev /
// deploy-preview contexts the real reason is returned to make setup easier.
function errorResponse(devMessage: string, status = 502) {
  const body = isProduction()
    ? { error: 'Social feed temporarily unavailable.' }
    : { error: devMessage }
  return Response.json(body, { status })
}

async function fetchFacebookPosts(
  graphBase: string,
  pageId: string,
  token: string,
): Promise<NormalizedPost[]> {
  const fields = 'id,message,created_time,permalink_url,full_picture,attachments'
  const url =
    `${graphBase}/${pageId}/posts` +
    `?fields=${encodeURIComponent(fields)}` +
    `&limit=${PER_PLATFORM_LIMIT}` +
    `&access_token=${encodeURIComponent(token)}`

  const res = await fetch(url)
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Facebook API ${res.status}: ${detail}`)
  }
  const json = (await res.json()) as { data?: any[] }

  return (json.data ?? []).map((post) => {
    const attachmentImage =
      post?.attachments?.data?.[0]?.media?.image?.src ?? null
    return {
      platform: 'facebook' as const,
      id: String(post.id),
      text: post.message ?? '',
      createdTime: post.created_time ?? '',
      image: post.full_picture ?? attachmentImage,
      url: post.permalink_url ?? null,
    }
  })
}

async function fetchInstagramMedia(
  graphBase: string,
  userId: string,
  token: string,
): Promise<NormalizedPost[]> {
  const fields =
    'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
  const url =
    `${graphBase}/${userId}/media` +
    `?fields=${encodeURIComponent(fields)}` +
    `&limit=${PER_PLATFORM_LIMIT}` +
    `&access_token=${encodeURIComponent(token)}`

  const res = await fetch(url)
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Instagram API ${res.status}: ${detail}`)
  }
  const json = (await res.json()) as { data?: any[] }

  return (json.data ?? []).map((media) => ({
    platform: 'instagram' as const,
    id: String(media.id),
    text: media.caption ?? '',
    createdTime: media.timestamp ?? '',
    // Videos expose a poster frame via thumbnail_url; images use media_url.
    image:
      media.media_type === 'VIDEO'
        ? media.thumbnail_url ?? media.media_url ?? null
        : media.media_url ?? null,
    mediaType: media.media_type ?? undefined,
    url: media.permalink ?? null,
  }))
}

export default async (_req: Request, _context: Context) => {
  const token = process.env.META_ACCESS_TOKEN
  const fbPageId = process.env.FB_PAGE_ID
  const igUserId = process.env.IG_USER_ID
  const graphVersion = process.env.META_GRAPH_VERSION || DEFAULT_GRAPH_VERSION

  if (!token || (!fbPageId && !igUserId)) {
    return errorResponse(
      'Missing Meta configuration. Set META_ACCESS_TOKEN and at least one of FB_PAGE_ID / IG_USER_ID.',
      500,
    )
  }

  const graphBase = `https://graph.facebook.com/${graphVersion}`

  // Fetch both platforms concurrently. A failure on one platform must not take
  // down the other, so each result is handled independently.
  const [fbResult, igResult] = await Promise.allSettled([
    fbPageId
      ? fetchFacebookPosts(graphBase, fbPageId, token)
      : Promise.resolve([] as NormalizedPost[]),
    igUserId
      ? fetchInstagramMedia(graphBase, igUserId, token)
      : Promise.resolve([] as NormalizedPost[]),
  ])

  const posts: NormalizedPost[] = []
  const errors: string[] = []

  if (fbResult.status === 'fulfilled') posts.push(...fbResult.value)
  else errors.push(String(fbResult.reason))

  if (igResult.status === 'fulfilled') posts.push(...igResult.value)
  else errors.push(String(igResult.reason))

  // If both platforms failed there is nothing to show — surface an error so the
  // frontend renders its fallback message.
  if (posts.length === 0 && errors.length > 0) {
    return errorResponse(errors.join(' | '))
  }

  const sorted = posts
    .sort(
      (a, b) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime(),
    )
    .slice(0, TOTAL_LIMIT)

  return Response.json(
    { posts: sorted },
    {
      headers: {
        // Browsers may reuse the response briefly; the Netlify CDN holds it for
        // ~15 minutes and serves a stale copy while revalidating, so the Meta
        // API is hit at most a few times per hour regardless of traffic.
        'Cache-Control': 'public, max-age=300',
        'Netlify-CDN-Cache-Control':
          'public, max-age=900, stale-while-revalidate=900',
      },
    },
  )
}

export const config: Config = {
  path: '/social-feed',
}
