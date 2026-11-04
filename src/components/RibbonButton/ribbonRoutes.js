import { workspaceSections } from '../../features/researcher/workspaceSections.js'

// Keep deep links and the old six workspace shortcuts compatible with the
// four experimental ribbons. Do not change the actual destination routes.
const sectionOwners = {
  research: 'research',
  new: 'research',
  drafts: 'research',
  decisions: 'research',
  tracking: 'tracking',
  practices: 'practices',
  'new-practice': 'practices',
  training: 'training',
}

const captions = {
  research: ['من الفكرة إلى النشر', 'From idea to publication'],
  practices: ['تجربة تستحق أن تُروى', 'A practice worth sharing'],
  tracking: ['كل قرار، خطوة للأمام', 'Every decision, a step ahead'],
  training: ['خطوة جديدة في تعلّمك', 'Your next learning step'],
}

const relatedRoutes = {
  research: ['new', 'drafts', 'decisions', 'tracking'].map((id) => `/workspace#${id}`),
  practices: ['/workspace#new-practice'],
}

export function ribbonSelectionForRoute(route, isArabic) {
  if (!route.startsWith('/workspace#')) return null
  const sectionId = route.slice('/workspace#'.length)
  const ownerId = sectionOwners[sectionId]
  if (!ownerId) return null
  const section = workspaceSections.find((item) => item.id === ownerId)
  if (!section) return null
  return {
    to: `/workspace#${ownerId}`,
    relatedRoutes: relatedRoutes[ownerId],
    label: isArabic ? section.ar : section.en,
    caption: captions[ownerId][isArabic ? 0 : 1],
    symbol: section.symbol,
    icon: ownerId,
    isArabic,
  }
}
