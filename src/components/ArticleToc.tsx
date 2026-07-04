import { useEffect, useState } from 'react'

export type TocItem = { id: string; text: string }

// "In this Article" sidebar. Highlights the section currently in view via an
// IntersectionObserver after hydration; before JS it is a plain anchor list.
export default function ArticleToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const atBottom = () =>
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 80

    const observer = new IntersectionObserver(
      (entries) => {
        // At the very bottom, the last section may never clear the top band, so
        // pin it active there; otherwise use the topmost in-view heading.
        if (atBottom()) {
          setActive(items[items.length - 1].id)
          return
        }
        const inView = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (inView[0]) setActive(inView[0].target.id)
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))

    const onScroll = () => {
      if (atBottom()) setActive(items[items.length - 1].id)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className="post-toc" aria-label="In this article">
      <div className="post-toc-title">In this Article</div>
      <ol className="post-toc-list">
        {items.map((it, i) => (
          <li key={it.id} className={active === it.id ? 'is-active' : ''}>
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? 'true' : undefined}
            >
              <span className="post-toc-num">{i + 1}.</span>
              <span className="post-toc-text">{it.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
