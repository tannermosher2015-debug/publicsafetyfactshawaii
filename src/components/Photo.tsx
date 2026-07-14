// Renders an editorial photo as a <picture> with AVIF + WebP srcsets (768w for
// cards, 1280w for heroes) and a JPEG fallback. The variants are generated at
// build time by scripts/optimize-images.mjs. `display: contents` on .psf-pic
// (see styles.css) keeps the wrapper out of the layout so the <img>'s existing
// absolute-fill positioning is unchanged.
type PhotoProps = {
  /** base JPEG filename in /photos, e.g. "family.jpg" */
  photo: string
  /** class applied to the <img> (keeps the existing object-fit styling) */
  className?: string
  /** responsive sizes hint for the browser to pick the right srcset width */
  sizes: string
  /** LCP hero image: load eagerly at high fetch priority */
  priority?: boolean
}

export default function Photo({ photo, className, sizes, priority }: PhotoProps) {
  const base = `/photos/${photo.replace(/\.jpe?g$/i, '')}`
  const srcset = (ext: string) => `${base}-768.${ext} 768w, ${base}-1280.${ext} 1280w`
  return (
    <picture className="psf-pic">
      <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
      <img
        src={`/photos/${photo}`}
        alt=""
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  )
}
