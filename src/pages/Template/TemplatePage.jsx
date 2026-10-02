import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './TemplatePage.content.js'
import './TemplatePage.css'
import ExperienceAr from './components/TemplateExperience.jsx'
import ExperienceEn from './components/TemplateExperience.en.jsx'

export default function TemplatePage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}>{isArabic ? <ExperienceAr /> : <ExperienceEn />}</PlatformPageFrame>
}
