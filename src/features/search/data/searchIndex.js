import { platformPages } from '../../../pages/Platform/platformPages.js'
import { platformPagesEn } from '../../../pages/Platform/platformPages.en.js'
import { newsRepository } from '../../news/data/newsRepository.js'
import { newsRepositoryEn } from '../../news/data/newsRepository.en.js'
import { journeySteps } from '../../../components/SpaceJourney/journeySteps.js'
import { journeyStepsEn } from '../../../components/SpaceJourney/journeySteps.en.js'
import * as contentAr from '../../platform/data/platformContent.js'
import * as contentEn from '../../platform/data/platformContent.en.js'

function textOf(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(textOf).join(' ')
  if (value && typeof value === 'object') return Object.values(value).map(textOf).join(' ')
  return ''
}

const extras = {
  '/repository': 'RESEARCH_ITEMS', '/conference': 'CONFERENCE_STEPS',
  '/guide': 'GUIDE_CHAPTERS', '/template': 'TEMPLATE_STEPS', '/support': 'FAQS',
}
const pages = Object.entries(platformPages).map(([route, ar]) => {
  const en = platformPagesEn[route]
  return {
    id: `page:${route}`, type: 'page', to: route === '/account' ? '/login' : route,
    title: { ar: ar.eyebrow, en: en.eyebrow },
    description: { ar: ar.description, en: en.description },
    text: `${textOf(ar)} ${textOf(en)} ${textOf(contentAr[extras[route]])} ${textOf(contentEn[extras[route]])}`,
  }
})
const newsEn = newsRepositoryEn.getLatest()
const news = newsRepository.getLatest().map((ar) => {
  const en = newsEn.find((item) => item.id === ar.id) || ar
  return { id: ar.id, type: 'news', to: `/news#${ar.id}`, title: { ar: ar.title, en: en.title }, description: { ar: ar.excerpt, en: en.excerpt }, text: `${textOf(ar)} ${textOf(en)}` }
})
const research = contentAr.RESEARCH_ITEMS.map((ar, index) => {
  const en = contentEn.RESEARCH_ITEMS[index]
  return { id: ar.id, type: 'research', to: `/repository#${ar.id}`, title: { ar: ar.title, en: en.title }, description: { ar: ar.summary, en: en.summary }, text: `${textOf(ar)} ${textOf(en)}` }
})
const journey = journeySteps.map((ar, index) => {
  const en = journeyStepsEn[index]
  return { id: `step:${ar.id}`, type: 'journey', to: `/#journey-step-${ar.id}`, title: { ar: ar.title, en: en.title }, description: { ar: ar.description, en: en.description }, text: `${textOf(ar)} ${textOf(en)}`, step: ar.id }
})
export const searchIndex = [
  ...pages, ...news, ...research, ...journey,
  { id: 'contact', type: 'page', to: '/#contact', title: { ar: 'تواصل معنا', en: 'Contact us' }, description: { ar: 'أرسل استفسارك أو اقتراحك لفريق المنصة.', en: 'Send a question or suggestion to the platform team.' }, text: 'رسالة بريد مساعدة تواصل اتصل contact message email support help' },
  { id: 'stats', type: 'page', to: '/#stats', title: { ar: 'أرقام من المنصة', en: 'Platform stats' }, description: { ar: 'المحتوى المتاح على المنصة.', en: 'Explore the content available on the platform.' }, text: 'إحصاءات احصائيات أرقام بيانات stats statistics data' },
]
