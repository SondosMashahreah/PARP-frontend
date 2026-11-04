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
  certificates: 'certificates',
  conference: 'conference',
}

const captions = {
  research: ['من الفكرة إلى النشر', 'From idea to publication'],
  practices: ['تجربة تستحق أن تُروى', 'A practice worth sharing'],
  tracking: ['كل قرار، خطوة للأمام', 'Every decision, a step ahead'],
  training: ['خطوة جديدة في تعلّمك', 'Your next learning step'],
  certificates: ['إنجازات تستحق التوثيق', 'Achievements worth keeping'],
  conference: ['شارك معرفتك', 'Share your knowledge'],
}

const relatedRoutes = {
  research: ['new', 'drafts', 'decisions', 'tracking'].map((id) => `/workspace#${id}`),
  practices: ['/workspace#new-practice'],
}

// Content destinations that can safely live inside the reusable ribbon poster.
// Forms (login/account), admin tools, maps and the assistant keep their existing
// focused layouts and action controls. Only navigation surfaces use ribbons.
const platformSections = {
  '/about': ['عن المنصة', 'About PARP', 'رؤيتنا ورسالتنا', 'Our vision and mission', 'research'],
  '/conference': ['المؤتمر الوطني', 'National conference', 'شارك المعرفة والتجارب', 'Share research and ideas', 'practices'],
  '/repository': ['المستودع الوطني', 'National repository', 'أبحاث ومعرفة موثوقة', 'Explore the research', 'research'],
  '/guide': ['الدليل الفلسطيني', 'Palestinian guide', 'خطوات البحث الإجرائي', 'Action research guidance', 'research'],
  '/template': ['القالب الفلسطيني', 'Palestinian template', 'من الفكرة إلى البحث', 'From ideas to research', 'research'],
  '/training': ['التدريب', 'Training', 'تعلم خطوة بخطوة', 'Learn step by step', 'training'],
  '/library': ['المكتبة الرقمية', 'Digital library', 'معرفة بين يديك', 'Knowledge at hand', 'research'],
  '/observatory': ['المرصد الوطني', 'National observatory', 'بيانات تدعم القرار', 'Data for better decisions', 'tracking'],
  '/institutions': ['المؤسسات', 'Institutions', 'المدارس والمديريات', 'Schools and directorates', 'tracking'],
  '/excellence': ['قاعة التميز', 'Hall of excellence', 'إنجازات تستحق التقدير', 'Celebrate achievement', 'training'],
  '/news': ['الأخبار والفعاليات', 'News and events', 'ما يحدث في المنصة', 'Explore the latest', 'research'],
  '/support': ['الدعم والمساندة', 'Support', 'نحن هنا للمساعدة', 'We are here to help', 'practices'],
  '/practices': ['دفتر الممارسات', 'Practice notebook', 'خبرات وتجارب ميدانية', 'Shared field experience', 'practices'],
  '/problems': ['بنك المشكلات', 'Problem bank', 'من المشكلة إلى الحل', 'From problems to solutions', 'tracking'],
}


export function ribbonSelectionForRoute(route, isArabic) {
  // Exact section routes are required so a child editor stays in its poster.
  // Public pages use their pathname; query and hash fragments do not remount it.
  if (!route.startsWith('/workspace#')) {
    const pathname = route.split(/[?#]/, 1)[0]
    const page = platformSections[pathname]
    if (!page) return null
    const [ar, en, captionAr, captionEn, icon] = page
    return {
      to: pathname,
      relatedRoutes: [],
      label: isArabic ? ar : en,
      caption: isArabic ? captionAr : captionEn,
      symbol: String(Object.keys(platformSections).indexOf(pathname) + 1).padStart(2, '0'),
      icon,
      isArabic,
    }
  }
  const sectionId = route.slice('/workspace#'.length)
  const ownerId = sectionOwners[sectionId]
  if (!ownerId) return null
  const section = workspaceSections.find((item) => item.id === ownerId)
  if (!section) return null
  return {
    to: `/workspace#${ownerId}`,
    relatedRoutes: relatedRoutes[ownerId] || [],
    label: isArabic ? section.ar : section.en,
    caption: captions[ownerId][isArabic ? 0 : 1],
    symbol: section.symbol,
    icon: ownerId === 'certificates' ? 'training' : ownerId === 'conference' ? 'practices' : ownerId,
    isArabic,
  }
}
