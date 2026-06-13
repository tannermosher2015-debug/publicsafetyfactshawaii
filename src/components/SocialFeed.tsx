import { useEffect, useState } from 'react'

type SocialPost = {
  platform: 'facebook' | 'instagram'
  id: string
  text: string
  createdTime: string
  image: string | null
  url: string | null
  mediaType?: string
}

type Status = 'loading' | 'ready' | 'error'

const FALLBACK_MESSAGE =
  'Latest social updates are temporarily unavailable. Visit our Facebook and Instagram pages for the newest posts.'

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function preview(text: string, max = 180): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

export default function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let active = true
    fetch('/social-feed')
      .then((res) => {
        if (!res.ok) throw new Error(`Unexpected response: ${res.status}`)
        return res.json()
      })
      .then((data: { posts?: SocialPost[] }) => {
        if (!active) return
        const list = Array.isArray(data.posts) ? data.posts : []
        setPosts(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!active) return
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="social-feed" aria-labelledby="social-feed-heading">
      <div className="social-feed-kicker">From our pages</div>
      <h2 id="social-feed-heading" className="social-feed-heading">
        Latest Updates
      </h2>
      <p className="social-feed-intro">
        Follow the latest public safety updates and shareable facts from our
        Facebook and Instagram pages.
      </p>

      {status === 'loading' && (
        <p className="social-feed-status" role="status">
          Loading the latest posts…
        </p>
      )}

      {(status === 'error' || (status === 'ready' && posts.length === 0)) && (
        <p className="social-feed-status" role="status">
          {FALLBACK_MESSAGE}
        </p>
      )}

      {status === 'ready' && posts.length > 0 && (
        <div className="social-feed-grid">
          {posts.map((post) => {
            const label =
              post.platform === 'facebook' ? 'Facebook' : 'Instagram'
            const date = formatDate(post.createdTime)
            const text = preview(post.text)
            return (
              <article key={`${post.platform}-${post.id}`} className="social-card">
                {post.image && (
                  <div className="social-card-media">
                    <img
                      src={post.image}
                      alt={
                        text
                          ? `${label} post: ${preview(post.text, 90)}`
                          : `Latest ${label} post from PublicSafetyFactsHawaii`
                      }
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="social-card-body">
                  <div
                    className={`social-card-platform social-card-platform--${post.platform}`}
                  >
                    {label}
                  </div>
                  {text && <p className="social-card-text">{text}</p>}
                  <div className="social-card-footer">
                    {date && <span className="social-card-date">{date}</span>}
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-card-link"
                      >
                        View on {label} →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
