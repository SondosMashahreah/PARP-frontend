import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n.css'
import App from './App.jsx'
import FileDropEnhancer from './components/uploads/FileDropEnhancer.jsx'
import './styles/edge-to-edge-typography.css'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { AuthProvider } from './features/auth/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <FileDropEnhancer />
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
