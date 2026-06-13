import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function NewsletterSignup({
  heading = 'Get the updates',
  blurb = 'One short email when there is real news to share — no spam, unsubscribe anytime.',
}: {
  heading?: string
  blurb?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return

    const form = e.currentTarget
    const data = new FormData(form)

    setStatus('submitting')
    try {
      // POST to the static skeleton, not '/', so the request reaches Netlify's
      // form handler instead of the TanStack Start SSR catch-all.
      const res = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as string[][]).toString(),
      })
      if (!res.ok) throw new Error(`Unexpected response: ${res.status}`)
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section className="newsletter" aria-labelledby="newsletter-heading">
        <div className="newsletter-kicker">Stay in the loop</div>
        <h2 id="newsletter-heading" className="newsletter-heading">
          You&rsquo;re on the list.
        </h2>
        <p className="newsletter-blurb">
          Thank you. When there&rsquo;s news worth sharing, it will land in your
          inbox.
        </p>
      </section>
    )
  }

  return (
    <section className="newsletter" aria-labelledby="newsletter-heading">
      <div className="newsletter-kicker">Stay in the loop</div>
      <h2 id="newsletter-heading" className="newsletter-heading">
        {heading}
      </h2>
      <p className="newsletter-blurb">{blurb}</p>

      <form
        name="newsletter"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="newsletter-form"
      >
        <input type="hidden" name="form-name" value="newsletter" />
        <p className="newsletter-hp" aria-hidden="true">
          <label>
            Don&rsquo;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <label htmlFor="newsletter-email" className="newsletter-label">
          Email address
        </label>
        <div className="newsletter-row">
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="newsletter-input"
            autoComplete="email"
          />
          <button
            type="submit"
            className="newsletter-button"
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Signing up…' : 'Get updates'}
          </button>
        </div>

        {status === 'error' && (
          <p className="newsletter-error" role="alert">
            Something went wrong. Please try again in a moment.
          </p>
        )}
      </form>
    </section>
  )
}
