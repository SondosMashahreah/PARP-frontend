import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './GuidePage.content.js'
import './GuidePage.css'
import ExperienceAr from './components/GuideExperience.jsx'
import ExperienceEn from './components/GuideExperience.en.jsx'

export default function GuidePage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}>{isArabic ? <ExperienceAr /> : <ExperienceEn />}</PlatformPageFrame>
}
