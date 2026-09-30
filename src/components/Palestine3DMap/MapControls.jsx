import { t } from './i18n.js'

export function MapControls({ language, is3D, onToggle3D, onReset, onFullscreen }) {
  const s = t(language)
  return (
    <div className="parp-map__controls" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <button type="button" onClick={onToggle3D} title={s.toggle3d} aria-label={s.toggle3d}>
        {is3D ? '3D' : '2D'}
      </button>
      <button type="button" onClick={onReset} title={s.resetView} aria-label={s.resetView}>⌂</button>
      <button type="button" onClick={onFullscreen} title={s.fullscreen} aria-label={s.fullscreen}>⛶</button>
    </div>
  )
}