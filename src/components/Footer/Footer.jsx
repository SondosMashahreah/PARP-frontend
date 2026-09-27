import logo from '../Header/img/logo.png'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
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
      <span
        className={`site-footer__partner-mark${partner.mark ? ' site-footer__partner-mark--text' : ''}`}
        aria-hidden="true"
      >
        {partner.logo
          ? <img src={partner.logo} alt="" loading="lazy" decoding="async" />
          : partner.mark}
      </span>
      <span>
        <strong>{partner.name}</strong>
        <small>{partner.shortName}</small>
      </span>
    </>
  )

  return partner.href ? (
    <a className="site-footer__partner" href={partner.href} target="_blank" rel="noreferrer" aria-label={partner.logoAlt}>
      {content}
    </a>
  ) : (
    <div className="site-footer__partner">{content}</div>
  )
}

function localHref(href) {
  if (href === '#contact') return `${import.meta.env.BASE_URL || '/'}#contact`
  if (href.startsWith('/')) {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    return `${base}${href}`
  }
  return href
}

export default function Footer() {
  const year = new Date().getFullYear()
  const { language, isArabic, dir } = useLanguage()
  const partners = footerPartners[language]
  const links = footerLinks[language]

  const copy = isArabic
    ? {
        home: 'PARP — الصفحة الرئيسية',
        subtitle: 'المنصة الفلسطينية للبحوث الإجرائية',
        description: 'مساحة تجمع البحث الإجرائي والخبرة الميدانية والمعرفة المشتركة في تجربة واحدة قابلة للاستكشاف والتطوير.',
        linksTitle: 'روابط مهمة',
        linksLabel: 'روابط التذييل',
        socialTitle: 'تابع المنصة',
        socialText: 'تابع آخر الأخبار والتحديثات والفعاليات المرتبطة بالمنصة.',
        partnersLabel: 'الشركاء والداعمون',
        partnersTitle: 'شركاؤنا',
        rights: 'جميع الحقوق محفوظة.',
      }
    : {
        home: 'PARP — Home',
        subtitle: 'Palestinian Action Research Platform',
        description: 'A shared space for action research, field experience, and collective knowledge in one platform designed for discovery and growth.',
        linksTitle: 'Important Links',
        linksLabel: 'Footer links',
        socialTitle: 'Follow PARP',
        socialText: 'Follow the latest platform news, updates, and events.',
        partnersLabel: 'Partners and supporters',
        partnersTitle: 'Our Partners',
        rights: 'All rights reserved.',
      }

  return (
    <footer className="site-footer" dir={dir}>
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a href={import.meta.env.BASE_URL} className="site-footer__logo-link" aria-label={copy.home}>
              <span className="site-footer__logo-frame">
                <img src={logo} alt="" width="54" height="54" />
              </span>
              <span>
                <strong lang="en">PARP.</strong>
                <small>{copy.subtitle}</small>
              </span>
            </a>
            <p>{copy.description}</p>
          </div>

          <nav className="site-footer__nav" aria-label={copy.linksLabel}>
            <h2>{copy.linksTitle}</h2>
            <ul>
              {links.map((link) => (
                <li key={link.label}>
                  <a href={localHref(link.href)}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer__social">
            <h2>{copy.socialTitle}</h2>
            <p>{copy.socialText}</p>
            <div className="site-footer__social-links">
              {footerSocialLinks.map((item) => (
                <a key={item.label} href={item.href} aria-label={item.label}>
                  <SocialIcon name={item.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="site-footer__partners" aria-label={copy.partnersLabel}>
          <span className="site-footer__partners-title">{copy.partnersTitle}</span>
          <div className="site-footer__partners-grid">
            {partners.map((partner) => (
              <PartnerItem key={partner.name} partner={partner} />
            ))}
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {year} PARP. {copy.rights}</p>
          <p>{copy.subtitle}</p>
        </div>
      </div>
    </footer>
  )
}
