import './App.css'
import Home from './pages/Home/Home.jsx'

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">انتقل إلى المحتوى</a>
      <Home />
      <main id="main-content" className="app-main" tabIndex={-1} aria-label="محتوى المنصة" />
    </div>
  )
}

export default App
