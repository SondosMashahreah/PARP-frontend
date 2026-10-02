import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './ObservatoryPage.content.js'
import './ObservatoryPage.css'
import { lazy, Suspense } from 'react'
const ObservatoryMap = lazy(() => import('../../features/observatory/ObservatoryMap.jsx'))

export default function ObservatoryPage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}><Suspense fallback={<p role="status">{isArabic ? 'جارٍ تحميل الخريطة…' : 'Loading map…'}</p>}><ObservatoryMap /></Suspense></PlatformPageFrame>
}
