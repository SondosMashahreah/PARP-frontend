import { useEffect } from 'react'
import './App.css'
import AppLayout from './layouts/AppLayout/AppLayout.jsx'
import Home from './pages/Home/Home.jsx'
import NotFound from './pages/Platform/NotFound.jsx'
import PlatformPage from './pages/Platform/PlatformPage.jsx'
import { platformPages as platformPagesAr } from './pages/Platform/platformPages.js'
import { platformPagesEn } from './pages/Platform/platformPages.en.js'
import { useLanguage } from './i18n/useLanguage.js'
import { useLocation } from './routing/useLocation.js'
import RouteEffects from './routing/RouteEffects.jsx'
import SearchPage from './pages/Search/SearchPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
import AssistantPage from './pages/Assistant/AssistantPage.jsx'
import { useAuth } from './features/auth/useAuth.js'

const PUBLIC_PATHS = new Set(['/', '/search', '/login', '/account'])

function App() {
  const { pathname, search, hash } = useLocation()
  const query = new URLSearchParams(search).get('q')?.slice(0, 160) || ''
  const { language, isArabic } = useLanguage()
  const { isAuthenticated, loading } = useAuth()
  const pages = language === 'ar' ? platformPagesAr : platformPagesEn
  const page = pages[pathname]
  const isProtectedPath = !PUBLIC_PATHS.has(pathname)

  useEffect(() => {
    if (loading || isAuthenticated || !isProtectedPath) return
    const next = encodeURIComponent(`${pathname}${search}${hash}`)
    window.history.replaceState(null, '', `/login?next=${next}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [hash, isAuthenticated, isProtectedPath, loading, pathname, search])

  let content = <NotFound />
  if (loading && isProtectedPath) content = null
  else if (pathname === '/') content = <Home />
  else if (pathname === '/search') content = <SearchPage query={query} key={query} />
  else if (pathname === '/assistant') content = <AssistantPage />
  else if (pathname === '/login' || pathname === '/account') content = <LoginPage />
  else if (pathname === '/profile') content = <ProfilePage />
  else if (page) content = <PlatformPage page={page} key={`${pathname}${hash}`} />

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {isArabic ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <AppLayout>
        {content}
        <RouteEffects />
      </AppLayout>
    </div>
  )
}

export default App
