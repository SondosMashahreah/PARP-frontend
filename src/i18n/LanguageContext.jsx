import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'parp-language'
const LanguageContext = createContext(null)

function getInitialLanguage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar'
  } catch {
    return 'ar'
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)
  const isArabic = language === 'ar'
  const dir = isArabic ? 'rtl' : 'ltr'

  useEffect(() => {
    const root = document.documentElement
    root.lang = language
    root.dir = dir

    const title = isArabic
      ? 'PARP | المنصة الفلسطينية للبحوث الإجرائية'
      : 'PARP | Palestinian Action Research Platform'
    const description = isArabic
      ? 'PARP — المنصة الفلسطينية للبحوث الإجرائية'
      : 'PARP — Palestinian Action Research Platform'

    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)

    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // The language still works even when storage is unavailable.
    }
  }, [dir, isArabic, language])

  const value = useMemo(() => ({
    language,
    isArabic,
    dir,
    setLanguage,
    toggleLanguage: () => setLanguage((current) => current === 'ar' ? 'en' : 'ar'),
  }), [dir, isArabic, language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
