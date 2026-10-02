import { lazy, Suspense, useEffect } from 'react'
import './App.css'
import AppLayout from './layouts/AppLayout/AppLayout.jsx'
import Home from './pages/Home/Home.jsx'
import NotFound from './pages/NotFound/NotFoundPage.jsx'
import { useLanguage } from './i18n/useLanguage.js'
import { useLocation } from './routing/useLocation.js'
import RouteEffects from './routing/RouteEffects.jsx'
import SearchPage from './pages/Search/SearchPage.jsx'
import LoginPage from './pages/Login/LoginPage.jsx'
import AccountPage from './pages/Account/AccountPage.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
import AssistantPage from './pages/Assistant/AssistantPage.jsx'
import { pageRoutes } from './routing/pageRoutes.jsx'
import { useAuth } from './features/auth/useAuth.js'

const PracticesPage = lazy(() => import('./pages/Practices/PracticesPage.jsx'))

const EducationMapPage = lazy(() => import('./pages/Map/MapPage.jsx'))

const PUBLIC_PATHS = new Set(['/', '/search', '/login', '/account'])

function App() {
  const { pathname, search, hash } = useLocation()
  const query = new URLSearchParams(search).get('q')?.slice(0, 160) || ''
  const { isArabic } = useLanguage()
  const { isAuthenticated, loading } = useAuth()
  const Page = pageRoutes[pathname]
  const isProtectedPath = !PUBLIC_PATHS.has(pathname)

  useEffect(() => {
    if (loading || isAuthenticated || !isProtectedPath) return
    const next = encodeURIComponent(`${pathname}${search}${hash}`)
    window.history.replaceState(null, '', `/login?next=${next}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [hash, isAuthenticated, isProtectedPath, loading, pathname, search])

  let content = <NotFound />
  if ((loading || !isAuthenticated) && isProtectedPath) content = null
  else if (pathname === '/') content = <Home />
  else if (pathname === '/practices') content = <Suspense fallback={<p role="status">{isArabic ? 'جارٍ التحميل…' : 'Loading…'}</p>}><PracticesPage /></Suspense>
  else if (pathname === '/map') content = <Suspense fallback={<p role="status">{isArabic ? 'جارٍ تحميل الخريطة…' : 'Loading map…'}</p>}><EducationMapPage /></Suspense>
  else if (pathname === '/search') content = <SearchPage query={query} key={query} />
  else if (pathname === '/assistant') content = <AssistantPage />
  else if (pathname === '/login') content = <LoginPage />
  else if (pathname === '/account') content = <AccountPage />
  else if (pathname === '/profile') content = <ProfilePage />
  else if (Page) content = <Suspense fallback={<p role="status">{isArabic ? 'جارٍ التحميل…' : 'Loading…'}</p>}><Page key={`${pathname}${hash}`} /></Suspense>

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
