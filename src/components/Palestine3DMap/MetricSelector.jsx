import { t } from './i18n.js'

const METRICS = ['schools', 'teachers', 'research', 'interactions', 'problems']

export function MetricSelector({ language, value, onChange }) {
  const s = t(language)
  const meta = {
    schools: s.schools, teachers: s.teachers,
    research: s.research, interactions: s.interactions, problems: s.problems,
  }
  return (
    <div className="parp-map__metrics" dir={language === 'ar' ? 'rtl' : 'ltr'} role="tablist">
      {METRICS.map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={value === m}
          className={value === m ? 'is-active' : ''}
          onClick={() => onChange(m)}
        >
          {meta[m]}
        </button>
      ))}
    </div>
  )
}