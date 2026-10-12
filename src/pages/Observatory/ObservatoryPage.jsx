import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './ObservatoryPage.content.js'
import './ObservatoryPage.css'
import { RouteLink } from '../../routing/clientRouter.jsx'
export default function ObservatoryPage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}><RouteLink to="/map">{isArabic ? 'افتح الخريطة الإحصائية الموحدة' : 'Open the unified statistics map'} ↗</RouteLink></PlatformPageFrame>
}
