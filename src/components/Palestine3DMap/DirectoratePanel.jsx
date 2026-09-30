import { t } from './i18n.js'

export function DirectoratePanel({ language, directorate, onClose, onViewSchools }) {
  const s = t(language)
  const name = language === 'ar' ? directorate.nameAr : directorate.nameEn
  return (
    <aside className="parp-map__panel" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={s.directorate}>
      <header className="parp-map__panel-header">
        <h3>{name}</h3>
        <button type="button" onClick={onClose} aria-label={s.close}>×</button>
      </header>
      <dl className="parp-map__panel-stats">
        <div><dt>{s.schools}</dt><dd>{directorate.schoolCount}</dd></div>
        <div><dt>{s.teachers}</dt><dd>{directorate.teacherCount}</dd></div>
        <div><dt>{s.research}</dt><dd>{directorate.researchCount}</dd></div>
        <div><dt>{s.interactions}</dt><dd>{directorate.interactionCount}</dd></div>
        <div><dt>{s.problems}</dt><dd>{directorate.problemCount}</dd></div>
      </dl>
      <button type="button" className="parp-map__panel-primary" onClick={onViewSchools}>
        {s.viewSchools}
      </button>
    </aside>
  )
}