import { useMemo, useState } from 'react'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import 'swiper/css/pagination'
import './LatestNewsSlider.css'

function formatArabicDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ar-PS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export default function LatestNewsSlider({ items = [] }) {
  const slides = useMemo(() => items.filter(Boolean), [items])
  const [failedImages, setFailedImages] = useState({})

  if (!slides.length) return null

  return (
    <section className="latest-news" dir="rtl" aria-label="آخر الأخبار">
      <h2 className="visually-hidden">آخر الأخبار</h2>

      <div className="latest-news__section-label" aria-hidden="true">
        <span className="latest-news__live-dot" />
        <span>آخر الأخبار</span>
        <small lang="en">PARP NEWS</small>
      </div>

      <Swiper
        dir="rtl"
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={950}
        loop={slides.length > 1}
        grabCursor={slides.length > 1}
        modules={[Pagination, Autoplay]}
        className="latest-news__swiper"
      >
        {slides.map((item) => {
          const hasImage = item.image && !failedImages[item.id]

          return (
            <SwiperSlide key={item.id}>
              <article className="latest-news__slide">
                <div className={`latest-news__background${hasImage ? '' : ' is-fallback'}`}>
                  {hasImage ? (
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      draggable="false"
                      onError={() => {
                        setFailedImages((current) => ({
                          ...current,
                          [item.id]: true,
                        }))
                      }}
                    />
                  ) : (
                    <div className="latest-news__image-fallback" aria-hidden="true">
                      <span>PARP</span>
                      <i />
                      <small>Action Research</small>
                    </div>
                  )}
                </div>

                <div className="latest-news__overlay" aria-hidden="true" />

                <div className="latest-news__content">
                  <div className="latest-news__meta">
                    <span className="latest-news__category">{item.category}</span>

                    {item.publishedAt && (
                      <>
                        <span className="latest-news__meta-line" aria-hidden="true" />
                        <time dateTime={item.publishedAt}>
                          {formatArabicDate(item.publishedAt)}
                        </time>
                      </>
                    )}
                  </div>

                  <h3 dir="auto">{item.title}</h3>

                  {item.excerpt && (
                    <p dir="auto">{item.excerpt}</p>
                  )}

                  <div className="latest-news__actions">
                    {item.href ? (
                      <a className="latest-news__button" href={item.href}>
                        <span>اقرأ الخبر</span>
                        <span className="latest-news__button-arrow" aria-hidden="true">←</span>
                      </a>
                    ) : (
                      <span className="latest-news__button latest-news__button--preview">
                        <span>اقرأ الخبر</span>
                        <span className="latest-news__button-arrow" aria-hidden="true">←</span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </section>
  )
}
