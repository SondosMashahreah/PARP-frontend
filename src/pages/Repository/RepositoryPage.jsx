import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformPageFrame from '../../components/platform/PlatformPageFrame.jsx'
import { content } from './RepositoryPage.content.js'
import './RepositoryPage.css'
import ExperienceAr from './components/RepositoryExperience.jsx'
import ExperienceEn from './components/RepositoryExperience.en.jsx'

export default function RepositoryPage() {
  const { isArabic } = useLanguage()
  return <PlatformPageFrame page={content[isArabic ? 'ar' : 'en']}>{isArabic ? <ExperienceAr /> : <ExperienceEn />}</PlatformPageFrame>
}
