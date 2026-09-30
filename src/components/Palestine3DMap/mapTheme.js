/**
 * Palestine3DMap theme — reads CSS custom properties from PARP's theme.css.
 * Falls back to hard-coded values only if variables are missing.
 * No color is hard-coded inside the map components themselves.
 */

export function getMapTheme() {
  const css = getComputedStyle(document.documentElement)
  const v = (name, fallback) => (css.getPropertyValue(name).trim() || fallback)

  return {
    background: v('--color-background', '#0d0914'),
    surface: v('--color-surface', '#1c1528'),
    surfaceRaised: v('--color-surface-raised', '#281d39'),
    textPrimary: v('--color-text', '#eeedf2'),
    textMuted: v('--color-text-muted', '#cbc7d2'),
    textSubtle: v('--color-text-subtle', '#b6afc1'),
    accent: v('--color-accent', '#b97ef0'),
    primary: v('--color-primary', '#7621c8'),
    highlight: v('--color-highlight', '#8b35cc'),
    border: v('--color-border', 'rgba(185,126,240,0.24)'),
    borderStrong: v('--color-border-strong', 'rgba(185,126,240,0.58)'),
    panelBg: 'rgba(15, 9, 20, 0.94)',
    palette: {
      low: v('--color-primary-strong', '#491478'),
      mid: v('--color-primary', '#7621c8'),
      high: v('--color-accent', '#b97ef0'),
    },
    metrics: {
      schools:      { labelAr: 'المدارس',    labelEn: 'Schools',      unitAr: 'مدرسة', unitEn: 'schools' },
      teachers:     { labelAr: 'المعلمون',   labelEn: 'Teachers',     unitAr: 'معلم',  unitEn: 'teachers' },
      research:     { labelAr: 'الأبحاث',    labelEn: 'Research',     unitAr: 'بحث',   unitEn: 'papers' },
      interactions: { labelAr: 'التفاعلات', labelEn: 'Interactions', unitAr: 'تفاعل', unitEn: 'events' },
      problems:     { labelAr: 'المشاكل',    labelEn: 'Problems',     unitAr: 'مشكلة', unitEn: 'issues' },
    },
  }
}

export function valueForMetric(d, metric) {
  switch (metric) {
    case 'schools':      return d.schoolCount
    case 'teachers':     return d.teacherCount
    case 'research':     return d.researchCount
    case 'interactions': return d.interactionCount
    case 'problems':     return d.problemCount
    default:             return 0
  }
}

export function colorForValue(t, theme) {
  const { low, mid, high } = theme.palette
  if (t < 0.5) return mix(low, mid, t / 0.5)
  return mix(mid, high, (t - 0.5) / 0.5)
}

function mix(a, b, t) {
  const ah = parseInt(a.slice(1), 16)
  const bh = parseInt(b.slice(1), 16)
  const ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255
  const br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`
}