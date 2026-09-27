import './App.css'
import AppLayout from './layouts/AppLayout/AppLayout.jsx'
import Home from './pages/Home/Home.jsx'
import NotFound from './pages/Platform/NotFound.jsx'
import PlatformPage from './pages/Platform/PlatformPage.jsx'
import { platformPages as platformPagesAr } from './pages/Platform/platformPages.js'
import { platformPagesEn } from './pages/Platform/platformPages.en.js'
import { useLanguage } from './i18n/LanguageContext.jsx'
import { usePathname } from './routing/clientRouter.jsx'

function App() {
  const pathname = usePathname()
  const { language, isArabic } = useLanguage()
  const pages = language === 'ar' ? platformPagesAr : platformPagesEn
  const page = pages[pathname]

  let content = <NotFound />
  if (pathname === '/') content = <Home />
  else if (page) content = <PlatformPage page={page} />

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {isArabic ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <AppLayout>
        {content}
      </AppLayout>
    </div>
  )
}

export default App
