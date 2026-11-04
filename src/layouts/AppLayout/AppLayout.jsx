import { useLanguage } from '../../i18n/useLanguage.js'
import Footer from '../../components/Footer/Footer.jsx'
import Header from '../../components/Header/Header.jsx'
import './AppLayout.css'
import { useLocation } from '../../routing/useLocation.js'
import { RibbonNavigationProvider, RibbonPage } from '../../components/RibbonButton/RibbonNavigation.jsx'

export default function AppLayout({ children }) {
  const { isArabic } = useLanguage()
  const { pathname } = useLocation()
  const isAssistant = pathname === '/assistant'

  return (
    <RibbonNavigationProvider>
    <div className={`app-layout ${isAssistant ? 'app-layout--assistant' : ''}`}>
      <Header />
      <main
        id="main-content"
        className="app-main app-layout__main"
        tabIndex={-1}
        aria-label={isArabic ? 'محتوى المنصة' : 'Platform content'}
      >
        {pathname === '/workspace' ? children : <RibbonPage>{children}</RibbonPage>}
      </main>
      {!isAssistant && <Footer />}
    </div>
    </RibbonNavigationProvider>
  )
}
