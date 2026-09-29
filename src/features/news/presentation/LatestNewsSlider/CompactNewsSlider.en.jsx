import { RouteLink } from '../../../../routing/clientRouter.jsx'
import { getPlatformStats } from '../../../platform/data/platformStats.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon.jsx'
import './CompactNewsSlider.css'

function formatEnglishDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function ImageFallback({ title }) {
  return (
    <div className="parp-news__fallback" aria-hidden="true">
      <span>PARP</span>
      <i />
      <small>{title || 'Action Research'}</small>
    </div>
  )
}

export default function CompactNewsSliderEn({
  items = [],
  autoplay = true,
  autoplayDelay = 4200,
  exploreHref = '/repository',
  journeyHref = '/#space-journey',
}) {
  const slides = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items])
  const [failedImages, setFailedImages] = useState(() => new Set())
  const [requestedIndex, setActiveIndex] = useState(0)
  const activeIndex = slides.length ? requestedIndex % slides.length : 0
  const [paused, setPaused] = useState(false)
  const pointerStartRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!autoplay || paused || slides.length < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, autoplayDelay)

    return () => window.clearInterval(timer)
  }, [autoplay, autoplayDelay, paused, slides.length])

  if (!slides.length) return null

  const move = (direction) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length)
  }

  const goTo = (index) => {
    setActiveIndex(index)
  }

  const slotOffsets = slides.length === 1 ? [0] : slides.length === 2 ? [-1, 0] : [-1, 0, 1]
  const visibleCards = slotOffsets.map((offset) => {
    const itemIndex = (activeIndex + offset + slides.length) % slides.length
    return {
      item: slides[itemIndex],
      itemIndex,
      role: offset === 0 ? 'active' : offset < 0 ? 'prev' : 'next',
    }
  })

  const stats = getPlatformStats('en')

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointerStartRef.current = event.clientX
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    if (pointerStartRef.current === null) return
    const distance = event.clientX - pointerStartRef.current
    pointerStartRef.current = null
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (Math.abs(distance) < 45) return
    move(distance > 0 ? -1 : 1)
  }

  const handlePointerCancel = (event) => {
    pointerStartRef.current = null
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  return (
    <section className="parp-news" dir="ltr" aria-labelledby="news-title-en">
      <div className="parp-news__shell">
        <div className="parp-news__content">
          <div className="parp-news__badges" aria-hidden="true">
            <span className="parp-news__preview" lang="en">PARP NEWS</span>
            <span className="parp-news__total">{slides.length} stories</span>
          </div>

          <p className="parp-news__eyebrow">From the platform</p>
          <h2 id="news-title-en">Latest News</h2>
          <p className="parp-news__lead">
            Turn your research journey into an inspiring knowledge experience.
          </p>
          <p className="parp-news__description">
            Discover the latest news, research, and events across PARP through a modern visual
            experience that brings inspiration, knowledge, and the research community together.
          </p>

          <div className="parp-news__actions">
            <RouteLink className="parp-news__button parp-news__button--primary" to={exploreHref}>
              <span>Explore the platform</span>
              <span aria-hidden="true">↗</span>
            </RouteLink>
            <RouteLink className="parp-news__button parp-news__button--ghost" to={journeyHref}>
              <span>Start your research journey</span>
              <span aria-hidden="true">→</span>
            </RouteLink>
          </div>

          <div className="parp-news__stats" aria-label="Initial platform statistics">
            {stats.map((stat) => (
              <div className="parp-news__stat" key={stat.label}>
                <div className="parp-news__stat-copy">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
                <Icon name={stat.icon} className="parp-news__stat-icon" />
              </div>
            ))}
          </div>
        </div>

        <div
          className="parp-news__visual"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div
            className={`parp-news__cards-stage${isDragging ? ' is-dragging' : ''}`}
            aria-label="Latest news slider"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {visibleCards.map(({ item, itemIndex, role }) => {
              const hasImage = item.image && !failedImages.has(item.image)
              const cardKey = item.id || item.image || `${item.title}-${itemIndex}`

              return (
                <article
                  className={`parp-news__story-card is-${role}`}
                  key={cardKey}
                  aria-hidden={role !== 'active'}
                >
                  <div className="parp-news__story-media">
                    {hasImage ? (
                      <img
                        src={item.image}
                        alt={role === 'active' ? (item.imageAlt || item.title || '') : ''}
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                        onError={() => {
                          setFailedImages((current) => new Set(current).add(item.image))
                        }}
                      />
                    ) : (
                      <ImageFallback title={item.title} />
                    )}
                  </div>

                  <div className="parp-news__story-copy">
                    <div className="parp-news__story-meta">
                      {item.category && <span>{item.category}</span>}
                      {item.publishedAt && <time dateTime={item.publishedAt}>{formatEnglishDate(item.publishedAt)}</time>}
                    </div>
                    <h3 dir="auto">{item.title}</h3>
                    {role === 'active' && (
                      item.href ? (
                        <a className="parp-news__story-link" href={item.href}>
                          <span>View details</span>
                          <span aria-hidden="true">→</span>
                        </a>
                      ) : (
                        <span className="parp-news__story-link parp-news__story-link--disabled">
                          <span>View details</span>
                          <span aria-hidden="true">→</span>
                        </span>
                      )
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {slides.length > 1 && (
            <div className="parp-news__pagination" role="tablist" aria-label="Navigate news stories">
              {slides.map((item, index) => {
                const label = item.title ? `Go to story: ${item.title}` : `Go to story ${index + 1}`
                return (
                  <button
                    key={item.id || `${item.title}-${index}`}
                    type="button"
                    className={`parp-news__dot${index === activeIndex ? ' is-active' : ''}`}
                    aria-label={label}
                    aria-current={index === activeIndex ? 'true' : 'false'}
                    onClick={() => goTo(index)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
