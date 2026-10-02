import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './InstitutionsPage.content.js'
import './InstitutionsPage.css'

export default function InstitutionsPage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}></PlatformPageFrame>
}
