import { RouteLink } from '../../routing/clientRouter.jsx'
import './PlatformPage.css'

export default function NotFound() {
  return (
    <section className="platform-page" dir="rtl">
      <header className="platform-page__hero">
        <div className="platform-page__hero-copy">
          <span className="platform-page__eyebrow">404</span>
          <h1>الصفحة غير موجودة</h1>
          <p>الرابط الذي طلبته غير متاح حاليًا داخل المنصة.</p>
          <RouteLink className="platform-page__back" to="/">العودة إلى الرئيسية</RouteLink>
        </div>
      </header>
    </section>
  )
}
