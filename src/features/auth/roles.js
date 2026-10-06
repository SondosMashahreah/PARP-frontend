export const ROLE_OPTIONS = [
  { value: 'researcher', ar: 'المعلم / الباحث', en: 'Teacher / Researcher' },
  { value: 'supervisor', ar: 'المشرف التربوي', en: 'Educational Supervisor' },
  { value: 'reviewer', ar: 'المحكم', en: 'Reviewer' },
  { value: 'school_manager', ar: 'مدير المدرسة', en: 'School Manager' },
  { value: 'directorate_manager', ar: 'المديرية', en: 'Directorate' },
  { value: 'scientific_committee', ar: 'اللجنة العلمية', en: 'Scientific Committee' },
  { value: 'organizing_committee', ar: 'اللجنة المنظمة', en: 'Organizing Committee' },
  { value: 'decision_maker', ar: 'صانع القرار', en: 'Decision Maker' },
  { value: 'system_admin', ar: 'مدير النظام', en: 'System Administrator' },
]

export const ROLE_VALUES = ROLE_OPTIONS.map((role) => role.value)

// Pages that every authenticated account can use regardless of role.
const SHARED_AUTH_PATHS = ['/', '/about', '/search', '/profile', '/support', '/repository', '/excellence', '/map']

// Navigation access mirrors the responsibilities defined for each role in the PARP plan.
// Action-level authorization is still enforced by the backend; this map only controls UI navigation.
const ACCESS = {
  researcher: [
    '/workspace', '/conference', '/repository', '/guide', '/template', '/training',
    '/library', '/assistant', '/practices', '/news',
  ],
  supervisor: [
    '/workspace', '/institutions', '/map', '/dashboard', '/repository', '/guide',
    '/training', '/library', '/practices',
  ],
  reviewer: ['/workspace', '/repository', '/guide', '/library'],
  school_manager: ['/workspace', '/institutions', '/dashboard', '/map', '/repository', '/excellence', '/practices'],
  directorate_manager: ['/workspace', '/institutions', '/dashboard', '/map', '/repository', '/excellence', '/training', '/practices'],
  scientific_committee: ['/workspace', '/repository', '/guide', '/template', '/dashboard', '/conference', '/practices'],
  organizing_committee: ['/workspace', '/conference', '/news', '/excellence'],
  decision_maker: ['/workspace', '/dashboard', '/observatory', '/observatory/map', '/map', '/repository', '/institutions', '/practices'],
  system_admin: ['/workspace'],
}

export function roleLabel(role, isArabic = true) {
  const match = ROLE_OPTIONS.find((item) => item.value === role)
  return match ? match[isArabic ? 'ar' : 'en'] : role || ''
}

function matchesPath(pathname, path) {
  return pathname === path || (path !== '/' && pathname.startsWith(`${path}/`))
}

export function canAccessPath(role, pathname) {
  if (!role) return false
  if (SHARED_AUTH_PATHS.some((path) => matchesPath(pathname, path))) return true
  return (ACCESS[role] || []).some((path) => matchesPath(pathname, path))
}
