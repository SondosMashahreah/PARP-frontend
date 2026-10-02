import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './SupportPage.content.js'
import './SupportPage.css'
import ExperienceAr from './components/SupportExperience.jsx'
import ExperienceEn from './components/SupportExperience.en.jsx'

export default function SupportPage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}>{isArabic ? <ExperienceAr /> : <ExperienceEn />}</PlatformPageFrame>
}
