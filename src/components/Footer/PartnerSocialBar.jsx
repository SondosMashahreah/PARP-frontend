import { useLanguage } from '../../i18n/useLanguage.js'
import { footerPartners } from './footerData.js'
import './PartnerSocialBar.css'

// Temporary destinations: replace these with PARP's official social profiles later.
const socialLinks = [
  { id: 'facebook', href: 'https://www.facebook.com/', ar: 'فيسبوك', en: 'Facebook' },
  { id: 'youtube', href: 'https://www.youtube.com/', ar: 'يوتيوب', en: 'YouTube' },
  { id: 'instagram', href: 'https://www.instagram.com/', ar: 'إنستغرام', en: 'Instagram' },
]

function SocialIcon({ name }) {
  if (name === 'facebook') {
    return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M14 21v-8h3l.5-4H14V7.4c0-1.1.34-1.9 1.9-1.9H18V2.2A24 24 0 0 0 14.9 2c-3 0-4.8 1.8-4.8 5.1V9H7v4h3.1v8Z" />
    </svg>
  }
  if (name === 'youtube') {
    return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor" />
      <path d="m10 8.8 5.6 3.2-5.6 3.2Z" fill="#ff0033" />
    </svg>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
}

export default function PartnerSocialBar() {
  const { language, isArabic, dir } = useLanguage()
  return <>
    <div className="partner-social-bar__spacer" aria-hidden="true" />
    <aside className="partner-social-bar" dir={dir} aria-label={isArabic ? 'شركاء المنصة ووسائل التواصل' : 'Partners and social media'}>
      <div className="partner-social-bar__inner">
        <nav className="partner-social-bar__partners" aria-label={isArabic ? 'شركاؤنا' : 'Our partners'}>
          {footerPartners[language].map((partner) => <a
            key={partner.id}
            className={`partner-social-bar__partner partner-social-bar__partner--${partner.id}`}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${partner.name} — ${isArabic ? 'رابط خارجي' : 'External link'}`}
            title={partner.name}
          >
            <span className="partner-social-bar__partner-mark">
              <img src={partner.logo} alt="" decoding="async" />
            </span>
            <span className="partner-social-bar__partner-copy">
              <strong>{partner.name}</strong>
              <small>{partner.shortName}</small>
            </span>
          </a>)}
        </nav>
        <nav className="partner-social-bar__socials" aria-label={isArabic ? 'شبكات التواصل الاجتماعي' : 'Social media'}>
          {socialLinks.map((link) => <a
            key={link.id}
            className={`partner-social-bar__social partner-social-bar__social--${link.id}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${isArabic ? link.ar : link.en} — ${isArabic ? 'رابط خارجي' : 'External link'}`}
            title={isArabic ? link.ar : link.en}
          ><SocialIcon name={link.id} /></a>)}
        </nav>
      </div>
    </aside>
  </>
}
