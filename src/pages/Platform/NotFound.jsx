import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { RouteLink } from '../../routing/clientRouter.jsx'
import './PlatformPage.css'

export default function NotFound() {
  const { isArabic, dir } = useLanguage()

  return (
    <section className="platform-page" dir={dir}>
      <header className="platform-page__hero">
        <div className="platform-page__hero-copy">
          <span className="platform-page__eyebrow">404</span>
          <h1>{isArabic ? 'الصفحة غير موجودة' : 'Page not found'}</h1>
          <p>
            {isArabic
              ? 'الرابط الذي طلبته غير متاح حاليًا داخل المنصة.'
              : 'The page you requested is not currently available on the platform.'}
          </p>
          <RouteLink className="platform-page__back" to="/">
            {isArabic ? 'العودة إلى الرئيسية' : 'Back to Home'}
          </RouteLink>
        </div>
      </header>
    </section>
  )
}
