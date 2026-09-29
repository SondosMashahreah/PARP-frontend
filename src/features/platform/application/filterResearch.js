import { RESEARCH_ITEMS as ar } from '../data/platformContent.js'
import { RESEARCH_ITEMS as en } from '../data/platformContent.en.js'
import { normalizeSearch } from '../../search/application/searchPlatform.js'

export function filterResearch(query, { language = 'ar', field = '' } = {}) {
  const terms = normalizeSearch(query).split(' ').filter(Boolean)
  const items = language === 'en' ? en : ar
  return items.filter((item, index) => {
    const text = normalizeSearch([ar[index], en[index]].map((entry) => `${entry.title} ${entry.author} ${entry.field} ${entry.summary}`).join(' '))
    return (!field || item.field === field) && terms.every((term) => text.includes(term))
  })
}
