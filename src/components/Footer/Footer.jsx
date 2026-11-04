import logo from '../Header/img/logo.png'
import Icon from '../ui/Icon.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { footerLinks } from './footerData.js'
import './Footer.css'

export default function Footer() {
  const { language, isArabic, dir } = useLanguage()
  const subtitle = isArabic ? 'المنصة الفلسطينية للبحوث الإجرائية' : 'Palestinian Action Research Platform'
  return (
    <footer className="site-footer" dir={dir}>
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <RouteLink to="/" className="site-footer__logo-link" aria-label={isArabic ? 'PARP — الصفحة الرئيسية' : 'PARP — Home'}>
              <span className="site-footer__logo-frame"><img src={logo} alt="" width="54" height="54" /></span>
              <span><strong lang="en" dir="ltr">PARP.</strong><small>{subtitle}</small></span>
            </RouteLink>
            <p>{isArabic ? 'مساحة تجمع البحث الإجرائي والخبرة الميدانية والمعرفة المشتركة، من الفكرة الأولى إلى أثرٍ نشاركه معًا.' : 'A shared space for action research, field experience, and collective knowledge—from a first idea to an impact we share.'}</p>
          </div>
          <nav className="site-footer__nav" aria-label={isArabic ? 'روابط التذييل' : 'Footer links'}>
            <h2>{isArabic ? 'اكتشف المنصة' : 'Explore PARP'}</h2>
            <ul>{footerLinks[language].map((link) => <li key={link.href}><RouteLink to={link.href}>{link.label}</RouteLink></li>)}</ul>
          </nav>
          <div className="site-footer__contact">
            <h2>{isArabic ? 'نسمع منك' : 'We’d love to hear from you'}</h2>
            <p>{isArabic ? 'سؤال أو فكرة جديدة؟ تواصل مع فريق المنصة.' : 'A question or a new idea? Get in touch with our team.'}</p>
            <RouteLink to="/#contact"><Icon name="mail" />{isArabic ? 'اكتب لنا رسالة' : 'Write us a message'}<span aria-hidden="true">{isArabic ? '←' : '→'}</span></RouteLink>
          </div>
        </div>
        <div className="site-footer__bottom"><p>© {new Date().getFullYear()} PARP. {isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p><p>{subtitle}</p></div>
      </div>
    </footer>
  )
}
