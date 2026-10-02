import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './ConferencePage.content.js'
import './ConferencePage.css'
import ExperienceAr from './components/ConferenceExperience.jsx'
import ExperienceEn from './components/ConferenceExperience.en.jsx'

export default function ConferencePage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}>{isArabic ? <ExperienceAr /> : <ExperienceEn />}</PlatformPageFrame>
}
