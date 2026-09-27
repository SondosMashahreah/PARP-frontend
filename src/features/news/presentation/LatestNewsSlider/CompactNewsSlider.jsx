import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../../../../components/ui/Icon.jsx'
import './CompactNewsSlider.css'

function formatArabicDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('ar-PS', {
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

export default function CompactNewsSlider({
  items = [],
  autoplay = true,
  autoplayDelay = 4200,
  exploreHref = '#',
  journeyHref = '#space-journey',
}) {
  const slides = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items])
  const [failedImages, setFailedImages] = useState(() => new Set())
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const pointerStartRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (activeIndex < slides.length) return
    setActiveIndex(0)
  }, [activeIndex, slides.length])

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

  const stats = [
    { value: `${slides.length}+`, label: 'أخبار وفعاليات', icon: 'document' },
    { value: '126+', label: 'باحث/ة وممارس/ة', icon: 'users' },
    { value: '30+', label: 'بحثًا ودليلًا', icon: 'globe' },
  ]

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
    <section className="parp-news" dir="rtl" aria-labelledby="news-title">
      <div className="parp-news__shell">
        <div className="parp-news__content">
          <div className="parp-news__badges" aria-hidden="true">
            <span className="parp-news__preview" lang="en">PARP NEWS</span>
            <span className="parp-news__total">{slides.length} أخبار</span>
          </div>

          <p className="parp-news__eyebrow">من المنصة</p>
          <h2 id="news-title">آخر الأخبار</h2>
          <p className="parp-news__lead">
            حوّل رحلتك البحثية إلى تجربة معرفية ملهمة.
          </p>
          <p className="parp-news__description">
            اكتشف أحدث الأخبار والبحوث والفعاليات داخل منصة PARP عبر تجربة بصرية
            حديثة تجمع الإلهام، المعرفة، والمجتمع البحثي في مكان واحد.
          </p>

          <div className="parp-news__actions">
            <a className="parp-news__button parp-news__button--primary" href={exploreHref}>
              <span>استكشف المنصة</span>
              <span aria-hidden="true">↗</span>
            </a>
            <a className="parp-news__button parp-news__button--ghost" href={journeyHref}>
              <span>ابدأ رحلتك البحثية</span>
              <span aria-hidden="true">←</span>
            </a>
          </div>

          <div className="parp-news__stats" aria-label="إحصاءات أولية للمنصة">
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
            aria-label="سلايدر آخر الأخبار"
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
                      {item.publishedAt && <time dateTime={item.publishedAt}>{formatArabicDate(item.publishedAt)}</time>}
                    </div>
                    <h3 dir="auto">{item.title}</h3>
                    {role === 'active' && (
                      item.href ? (
                        <a className="parp-news__story-link" href={item.href}>
                          <span>عرض التفاصيل</span>
                          <span aria-hidden="true">←</span>
                        </a>
                      ) : (
                        <span className="parp-news__story-link parp-news__story-link--disabled">
                          <span>عرض التفاصيل</span>
                          <span aria-hidden="true">←</span>
                        </span>
                      )
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {slides.length > 1 && (
            <div className="parp-news__pagination" role="tablist" aria-label="التنقل بين الأخبار">
              {slides.map((item, index) => {
                const label = item.title ? `الانتقال إلى الخبر: ${item.title}` : `الانتقال إلى الخبر ${index + 1}`
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
