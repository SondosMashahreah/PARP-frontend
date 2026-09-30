import { t } from './i18n.js'

export function MapLegend({ language, theme, metricLabel }) {
  const s = t(language)
  return (
    <div className="parp-map__legend" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="parp-map__legend-title">{metricLabel}</div>
      <div className="parp-map__legend-bar">
        <span style={{ background: theme.palette.low }} />
        <span style={{ background: theme.palette.mid }} />
        <span style={{ background: theme.palette.high }} />
      </div>
      <div className="parp-map__legend-labels">
        <span>{s.low}</span><span>{s.medium}</span><span>{s.high}</span>
      </div>
      <div className="parp-map__legend-hint">{s.heightHint}</div>
    </div>
  )
}