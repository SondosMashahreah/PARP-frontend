export const ROLE_OPTIONS = [
  { value: 'researcher', ar: 'المعلم / الباحث', en: 'Teacher / Researcher' },
  { value: 'reviewer', ar: 'لجنة تقييم الأبحاث', en: 'Research Evaluation Committee' },
  { value: 'school_manager', ar: 'مدير المدرسة', en: 'School Manager' },
  { value: 'directorate_manager', ar: 'المديرية', en: 'Directorate' },
  { value: 'scientific_committee', ar: 'اللجنة العلمية', en: 'Scientific Committee' },
  { value: 'organizing_committee', ar: 'اللجنة المنظمة', en: 'Organizing Committee' },
  { value: 'decision_maker', ar: 'صانع القرار', en: 'Decision Maker' },
  { value: 'system_admin', ar: 'مدير النظام', en: 'System Administrator' },
]

export const ROLE_VALUES = ROLE_OPTIONS.map((role) => role.value)

// Pages that every authenticated account can use regardless of role.
const SHARED_AUTH_PATHS = ['/', '/about', '/news', '/search', '/profile', '/support', '/repository', '/excellence', '/practices', '/assistant']

// Navigation access mirrors the responsibilities defined for each role in the PARP plan.
// Action-level authorization is still enforced by the backend; this map only controls UI navigation.
const ACCESS = {
  researcher: [
    '/workspace', '/conference', '/repository', '/guide', '/template', '/training',
    '/library', '/assistant', '/practices', '/news', '/problems',
  ],
  reviewer: ['/workspace', '/repository', '/guide', '/library'],
  school_manager: ['/workspace', '/institutions', '/repository', '/excellence', '/practices', '/assistant'],
  directorate_manager: ['/workspace', '/institutions', '/map', '/repository', '/excellence', '/training', '/practices'],
  scientific_committee: ['/workspace', '/repository', '/guide', '/template', '/conference', '/practices'],
  organizing_committee: ['/workspace', '/conference', '/news', '/excellence'],
  decision_maker: ['/problems', '/workspace', '/observatory', '/map', '/repository', '/institutions', '/practices'],
  system_admin: ['/workspace', '/dashboard'],
}

export function roleLabel(role, isArabic = true) {
  const match = ROLE_OPTIONS.find((item) => item.value === role)
  return match ? match[isArabic ? 'ar' : 'en'] : role || ''
}

function matchesPath(pathname, path) {
  return pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
}

export function canAccessPath(role, pathname) {
  if (!role || !ROLE_VALUES.includes(role)) return false
  if (pathname === '/map') return ['decision_maker', 'directorate_manager'].includes(role)
  if (pathname.startsWith('/observatory/map')) return false
  if (SHARED_AUTH_PATHS.some((path) => matchesPath(pathname, path))) return true
  return (ACCESS[role] || []).some((path) => matchesPath(pathname, path))
}
