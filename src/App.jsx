import './App.css'
import AppLayout from './layouts/AppLayout/AppLayout.jsx'
import Home from './pages/Home/Home.jsx'
import NotFound from './pages/Platform/NotFound.jsx'
import PlatformPage from './pages/Platform/PlatformPage.jsx'
import { platformPages } from './pages/Platform/platformPages.js'
import { usePathname } from './routing/clientRouter.jsx'

function App() {
  const pathname = usePathname()
  const page = platformPages[pathname]

  let content = <NotFound />
  if (pathname === '/') content = <Home />
  else if (page) content = <PlatformPage page={page} />

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
      <AppLayout>
        {content}
      </AppLayout>
    </div>
  )
}

export default App
