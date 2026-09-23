import logo from '../Header/img/logo.png'
import { footerLinks, footerPartners, footerSocialLinks } from './footerData.js'
import './Footer.css'

function SocialIcon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'facebook') {
    return (
      <svg {...common}>
        <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z" />
      </svg>
    )
  }

  if (name === 'youtube') {
    return (
      <svg {...common}>
        <path d="M21 12s0-4-1-5-4-1-8-1-7 0-8 1-1 5-1 5 0 4 1 5 4 1 8 1 7 0 8-1 1-5 1-5Z" />
        <path d="m10 9 5 3-5 3Z" />
      </svg>
    )
  }

  if (name === 'linkedin') {
    return (
      <svg {...common}>
        <path d="M6 9v9M6 6.5v.01M10 18v-5a4 4 0 0 1 8 0v5M10 10v8" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M5 5 19 19M19 5 5 19" />
    </svg>
  )
}

function PartnerItem({ partner }) {
  const content = (
    <>
      <span className="site-footer__partner-mark" aria-hidden="true">
        {partner.name.charAt(0)}
      </span>
      <span>
        <strong>{partner.name}</strong>
        <small>{partner.shortName}</small>
      </span>
    </>
  )

  return partner.href ? (
    <a className="site-footer__partner" href={partner.href}>
      {content}
    </a>
  ) : (
    <div className="site-footer__partner">{content}</div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer" dir="rtl">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a href={import.meta.env.BASE_URL} className="site-footer__logo-link" aria-label="PARP — الصفحة الرئيسية">
              <span className="site-footer__logo-frame">
                <img src={logo} alt="" width="54" height="54" />
              </span>
              <span>
                <strong lang="en">PARP.</strong>
                <small>المنصة الفلسطينية للبحوث الإجرائية</small>
              </span>
            </a>
            <p>
              مساحة تجمع البحث الإجرائي والخبرة الميدانية والمعرفة المشتركة في تجربة واحدة قابلة للاستكشاف والتطوير.
            </p>
          </div>

          <nav className="site-footer__nav" aria-label="روابط التذييل">
            <h2>روابط مهمة</h2>
            <ul>
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__social">
            <h2>تابع المنصة</h2>
            <p>تابع آخر الأخبار والتحديثات والفعاليات المرتبطة بالمنصة.</p>
            <div className="site-footer__social-links">
              {footerSocialLinks.map((item) => (
                <a key={item.label} href={item.href} aria-label={item.label}>
                  <SocialIcon name={item.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="site-footer__partners" aria-label="الشركاء والداعمون">
          <span className="site-footer__partners-title">شركاؤنا</span>
          <div className="site-footer__partners-grid">
            {footerPartners.map((partner) => (
              <PartnerItem key={partner.name} partner={partner} />
            ))}
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {year} PARP. جميع الحقوق محفوظة.</p>
          <p>المنصة الفلسطينية للبحوث الإجرائية</p>
        </div>
      </div>
    </footer>
  )
}
