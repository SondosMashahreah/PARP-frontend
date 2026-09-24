import { useState } from 'react'
import './CompactNewsSlider.css'

function formatArabicDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('ar-PS', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(date)
}

export default function CompactNewsSlider({ items = [] }) {
  const [index, setIndex] = useState(0)
  const [failedImages, setFailedImages] = useState(() => new Set())
  const slides = Array.isArray(items) ? items.filter(Boolean) : []
  if (!slides.length) return null

  const currentIndex = Math.min(index, slides.length - 1)
  const item = slides[currentIndex]
  const hasImage = item.image && !failedImages.has(item.image)
  const move = (direction) => {
    setIndex((currentIndex + direction + slides.length) % slides.length)
  }

  return (
    <section className="parp-news" dir="rtl" aria-labelledby="news-title">
      <header className="parp-news__heading">
        <div>
          <p className="parp-news__eyebrow">من المنصة</p>
          <h2 id="news-title">آخر الأخبار</h2>
        </div>
        <span className="parp-news__preview" lang="en">PARP NEWS</span>
      </header>

      <article className="parp-news__card">
        <div className="parp-news__media">
          {hasImage ? (
            <img
              key={item.image}
              src={item.image}
              alt={item.imageAlt || ''}
              decoding="async"
              onError={() => setFailedImages((current) => new Set(current).add(item.image))}
            />
          ) : (
            <div className="parp-news__art" aria-hidden="true">
              <div className="parp-news__ring" />
              <div className="parp-news__paper" key={item.id}>
                <span className="parp-news__paper-brand">PARP / RESEARCH</span>
                <strong>فكرة. تجربة. أثر.</strong>
                <div className="parp-news__paper-lines" />
                <span className="parp-news__paper-foot">البحث الإجرائي · معرفة من الميدان</span>
              </div>
              <span className="parp-news__seal">من الفكرة<br />إلى الأثر</span>
            </div>
          )}
        </div>

        <div className="parp-news__body" dir="rtl">
          <div id="news-content" aria-live="polite" aria-atomic="true">
            <div className="parp-news__copy" key={item.id}>
              <div className="parp-news__meta">
                {item.category && <span className="parp-news__category">{item.category}</span>}
                {item.publishedAt && (
                  <time dateTime={item.publishedAt}>{formatArabicDate(item.publishedAt)}</time>
                )}
              </div>
              <h3 dir="auto">{item.title}</h3>
              {item.excerpt && <p dir="auto">{item.excerpt}</p>}
              {item.href && (
                <a className="parp-news__link" href={item.href}>
                  اقرأ الخبر
                  <span aria-hidden="true">←</span>
                </a>
              )}
            </div>
          </div>

          {slides.length > 1 && (
            <div className="parp-news__controls" role="group" aria-label="التنقل بين الأخبار">
              <button type="button" onClick={() => move(-1)} aria-label="الخبر السابق" aria-controls="news-content">
                <span aria-hidden="true">→</span>
              </button>
              <span className="parp-news__count" dir="ltr">
                {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
              <button type="button" onClick={() => move(1)} aria-label="الخبر التالي" aria-controls="news-content">
                <span aria-hidden="true">←</span>
              </button>
            </div>
          )}
        </div>
      </article>
    </section>
  )
}
