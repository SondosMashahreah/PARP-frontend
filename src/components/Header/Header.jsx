import { useCallback, useState } from 'react'
import HeaderLogo from './HeaderLogo.jsx'
import HeaderSearch from './HeaderSearch.jsx'
import Notifications from './Notifications.jsx'
import Sidebar from './Sidebar.jsx'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import './Header.css'

function sectionHref(id) {
  return `${import.meta.env.BASE_URL || '/'}#${id}`
}

function Header() {
  const [activePanel, setActivePanel] = useState(null)
  const closePanel = useCallback(() => setActivePanel(null), [])
  const { isArabic, toggleLanguage } = useLanguage()

  const labels = isArabic
    ? {
        news: 'الأخبار',
        stats: 'الإحصائيات',
        contact: 'تواصل معنا',
        login: 'تسجيل الدخول',
        language: 'English',
        menu: 'فتح القائمة الجانبية',
      }
    : {
        news: 'News',
        stats: 'Stats',
        contact: 'Contact Us',
        login: 'Log in',
        language: 'العربية',
        menu: 'Open sidebar',
      }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <HeaderLogo />

        <nav className="site-header__nav" aria-label={isArabic ? 'أقسام الصفحة الرئيسية' : 'Homepage sections'}>
          <a href={sectionHref('news')}>{labels.news}</a>
          <a href={sectionHref('stats')}>{labels.stats}</a>
          <a href={sectionHref('contact')}>{labels.contact}</a>
        </nav>

        <HeaderSearch />

        <div className="site-header__actions">
          <button
            type="button"
            className="site-header__language"
            onClick={toggleLanguage}
            aria-label={isArabic ? 'Switch to English' : 'Switch to Arabic'}
          >
            {labels.language}
          </button>

          <RouteLink className="site-header__login" to="/account">
            {labels.login}
          </RouteLink>

          <Notifications
            isOpen={activePanel === 'notifications'}
            onToggle={() => setActivePanel((current) => current === 'notifications' ? null : 'notifications')}
            onClose={closePanel}
          />

          <span className="site-header__divider" aria-hidden="true" />

          <IconButton
            className="site-header__menu"
            aria-label={labels.menu}
            aria-expanded={activePanel === 'sidebar'}
            aria-controls="main-sidebar"
            aria-haspopup="dialog"
            onClick={() => setActivePanel('sidebar')}
          >
            <Icon name="menu" />
          </IconButton>
        </div>
      </div>
      <Sidebar isOpen={activePanel === 'sidebar'} onClose={closePanel} />
    </header>
  )
}

export default Header
