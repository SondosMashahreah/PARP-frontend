export const workspaceSections = [
  { id: 'research', ar: 'أبحاثي', en: 'My research', symbol: '01', roles: ['researcher'], description: ['من الفكرة إلى النشر', 'From an idea to publication'] },
  { id: 'practices', ar: 'ممارساتي', en: 'My practices', symbol: '02', roles: ['researcher'], description: ['وثّق تجربتك وشاركها مجاناً', 'Document and share your practice'] },
  { id: 'tracking', ar: 'متابعة التقييم', en: 'Track evaluation', symbol: '03', roles: ['researcher'], description: ['قرارات وملاحظات لجنة التقييم', 'Evaluation decisions and feedback'] },
  { id: 'training', ar: 'تدريبي', en: 'My training', symbol: '04', roles: ['researcher'], description: ['خطوة جديدة في تعلّمك', 'Your next learning step'] },
  { id: 'certificates', ar: 'شهاداتي', en: 'My certificates', symbol: '05', roles: ['researcher'], description: ['إنجازات تستحق التوثيق', 'Achievements worth keeping'] },
  { id: 'conference', ar: 'مشاركاتي في المؤتمر', en: 'Conference participations', symbol: '06', roles: ['researcher'], description: ['شارك معرفتك', 'Share your knowledge'] },
]
export const researchSections = [
  { id: 'new', ar: 'بحث جديد', en: 'New research' },
  { id: 'drafts', ar: 'المسودات', en: 'Drafts' },
  { id: 'decisions', ar: 'القرارات والملاحظات', en: 'Decisions & feedback' },
  { id: 'tracking', ar: 'متابعة التحكيم', en: 'Track review' },
]
export const decisionStatuses = ['approved', 'rejected', 'revision_requested', 'practice_suggested', 'published']
export function visibleSections(role) { return workspaceSections.filter(section => section.roles.includes(role)) }
export function workspaceSection(hash) {
  const section = hash.replace(/^#/, '')
  return ['practices', 'new-practice', 'conference', 'research', 'training', 'certificates', ...researchSections.map(s => s.id)].includes(section) ? section : 'home'
}
