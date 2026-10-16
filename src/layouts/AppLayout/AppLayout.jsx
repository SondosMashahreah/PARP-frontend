import { useLanguage } from '../../i18n/useLanguage.js'
import Footer from '../../components/Footer/Footer.jsx'
import Header from '../../components/Header/Header.jsx'
import './AppLayout.css'
import { useLocation } from '../../routing/useLocation.js'

export default function AppLayout({ children }) {
  const { isArabic } = useLanguage()
  const { pathname } = useLocation()
  const isAssistant = pathname === '/assistant'

  return (
    <div className={`app-layout ${isAssistant ? 'app-layout--assistant' : ''}`}>
      <Header />
      <main
        id="main-content"
        className="app-main app-layout__main"
        tabIndex={-1}
        aria-label={isArabic ? 'محتوى المنصة' : 'Platform content'}
      >
        {children}
      </main>
      {!isAssistant && <Footer />}
    </div>
  )
}
