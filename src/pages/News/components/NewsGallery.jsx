import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Keyboard, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './NewsGallery.css'

export default function NewsGallery({ images = [], title = '', ar = true }) {
  const photos = images.filter(image => image?.url)
  if (!photos.length) return null
  const many = photos.length > 1
  return <div className="live-news__gallery" aria-label={ar ? 'صور الخبر' : 'Article photos'}>
    <Swiper
      modules={[A11y, Keyboard, Navigation, Pagination]}
      navigation={many}
      pagination={many ? { clickable: true } : false}
      keyboard={{ enabled: true, onlyInViewport: true }}
      grabCursor={many}
      slidesPerView={1}
      spaceBetween={12}
      loop={many && photos.length > 2}
      dir={ar ? 'rtl' : 'ltr'}
      className="live-news__gallery-swiper"
    >
      {photos.map((image, index) => <SwiperSlide key={image.id ?? index}>
        <img src={image.url} alt={image.alt || `${title} — ${index + 1}`} loading={index ? 'lazy' : 'eager'} decoding="async" />
      </SwiperSlide>)}
    </Swiper>
    {many && <p className="live-news__gallery-caption">{ar ? `${photos.length} صور — اسحب أو استخدم الأسهم` : `${photos.length} photos — swipe or use the arrows`}</p>}
  </div>
}
