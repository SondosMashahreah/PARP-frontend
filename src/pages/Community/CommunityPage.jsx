import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './CommunityPage.content.js'
import './CommunityPage.css'

export default function CommunityPage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}></PlatformPageFrame>
}
