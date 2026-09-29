import { newsRepository } from '../../news/data/newsRepository.js'
import { RESEARCH_ITEMS } from './platformContent.js'
import { journeySteps } from '../../../components/SpaceJourney/journeySteps.js'

export function getPlatformStats(language = 'ar') {
  const ar = language === 'ar'
  return [
    { id: 'news', value: newsRepository.getLatest().length, label: ar ? 'أخبار وفعاليات' : 'News and events', description: ar ? 'مستجدات متاحة للقراءة' : 'Updates available to read', icon: 'document', to: '/news' },
    { id: 'research', value: RESEARCH_ITEMS.length, label: ar ? 'نماذج بحثية' : 'Research examples', description: ar ? 'للاستكشاف في المستودع' : 'To explore in the repository', icon: 'users', to: '/repository' },
    { id: 'journey', value: journeySteps.length, label: ar ? 'خطوات في رحلتك' : 'Steps in your journey', description: ar ? 'من البداية إلى مشاركة الأثر' : 'From getting started to sharing impact', icon: 'route', to: '/#space-journey' },
  ]
}
