import { searchIndex } from '../data/searchIndex.js'

export function normalizeSearch(value = '') {
  return String(value).normalize('NFKD').replace(/\p{M}/gu, '').replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ')
}
const indexed = searchIndex.map((item) => ({ ...item, normalized: normalizeSearch(`${item.title.ar} ${item.title.en} ${item.text}`), titles: normalizeSearch(`${item.title.ar} ${item.title.en}`) }))

export function searchPlatform(query, { language = 'ar', limit = 100 } = {}) {
  const normalized = normalizeSearch(query)
  if (!normalized) return []
  const terms = [...new Set(normalized.split(' '))]
  return indexed.filter((item) => terms.every((term) => item.normalized.includes(term)))
    .map((item) => ({
      ...item,
      title: item.title[language] || item.title.ar,
      description: item.description[language] || item.description.ar,
      score: (item.titles.includes(normalized) ? 20 : 0) + terms.filter((term) => item.titles.includes(term)).length * 3 + (item.type === 'page' ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit)
}
