import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './NewsPage.content.js'
import './NewsPage.css'
import ExperienceAr from './components/NewsExperience.jsx'
import ExperienceEn from './components/NewsExperience.en.jsx'

export default function NewsPage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}>{isArabic ? <ExperienceAr /> : <ExperienceEn />}</PlatformPageFrame>
}
