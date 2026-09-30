import { t } from './i18n.js'

export function SchoolPanel({ language, school, onClose }) {
  const s = t(language)
  const name = language === 'ar' ? school.nameAr : school.nameEn
  const hasCoords =
    Number.isFinite(school.latitude) && Number.isFinite(school.longitude)

  return (
    <aside className="parp-map__panel" dir={language === 'ar' ? 'rtl' : 'ltr'} aria-label={s.school}>
      <header className="parp-map__panel-header">
        <h3>{name}</h3>
        <button type="button" onClick={onClose} aria-label={s.close}>×</button>
      </header>
      <dl className="parp-map__panel-stats">
        <div><dt>{s.directorate}</dt><dd>{school.directorateId}</dd></div>
        <div><dt>{s.teachers}</dt><dd>{school.teacherCount}</dd></div>
        <div><dt>{s.research}</dt><dd>{school.researchCount}</dd></div>
        <div><dt>{s.interactions}</dt><dd>{school.interactionCount}</dd></div>
        <div><dt>{s.problems}</dt><dd>{school.problemCount}</dd></div>
      </dl>
      {hasCoords ? (
        <div className="parp-map__panel-coords">
          {school.latitude.toFixed(4)}, {school.longitude.toFixed(4)}
        </div>
      ) : (
        <div className="parp-map__panel-empty">{s.noGeoData}</div>
      )}
    </aside>
  )
}