import Footer from '../../components/Footer/Footer.jsx'
import Header from '../../components/Header/Header.jsx'
import './AppLayout.css'

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main
        id="main-content"
        className="app-main app-layout__main"
        tabIndex={-1}
        aria-label="محتوى المنصة"
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
