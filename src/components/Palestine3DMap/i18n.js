/**
 * All UI strings for the map — read from a single object keyed by language.
 * This is a local map-only dictionary. Page-level text still uses
 * PARP's existing platformPages.js / platformPages.en.js.
 */
export const MAP_STRINGS = {
  en: {
    title: 'Palestine Education GIS',
    subtitle: 'Directorates · Schools · Research',
    demoBadge: 'DEMO DATA — replace with official GeoJSON',
    legend: 'Legend',
    low: 'Low', medium: 'Medium', high: 'High',
    heightHint: 'Height = selected metric',
    viewSchools: 'View Schools',
    directorate: 'Directorate',
    school: 'School',
    teachers: 'Teachers',
    research: 'Research',
    interactions: 'Interactions',
    problems: 'Problems',
    schools: 'Schools',
    resetView: 'Reset view',
    fullscreen: 'Fullscreen',
    toggle3d: 'Toggle 2D / 3D',
    close: 'Close',
    noGeoData: 'No geographic data available for this school.',
    loading: 'Loading map…',
    error: 'Could not load the map. Please reload the page.',
  },
  ar: {
    title: 'نظام المعلومات الجغرافية التعليمي الفلسطيني',
    subtitle: 'المديريات · المدارس · الأبحاث',
    demoBadge: 'بيانات تجريبية — استبدلها ببيانات رسمية',
    legend: 'المفتاح',
    low: 'منخفض', medium: 'متوسط', high: 'مرتفع',
    heightHint: 'الارتفاع = المؤشر المحدد',
    viewSchools: 'عرض المدارس',
    directorate: 'المديرية',
    school: 'المدرسة',
    teachers: 'المعلمون',
    research: 'الأبحاث',
    interactions: 'التفاعلات',
    problems: 'المشاكل',
    schools: 'المدارس',
    resetView: 'إعادة العرض',
    fullscreen: 'ملء الشاشة',
    toggle3d: 'تبديل 2D / 3D',
    close: 'إغلاق',
    noGeoData: 'لا توجد بيانات جغرافية متاحة لهذه المدرسة.',
    loading: 'جارٍ تحميل الخريطة…',
    error: 'تعذّر تحميل الخريطة. يرجى إعادة تحميل الصفحة.',
  },
}

export function t(lang) {
  return MAP_STRINGS[lang] || MAP_STRINGS.en
}