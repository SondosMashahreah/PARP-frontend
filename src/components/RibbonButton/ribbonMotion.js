export const RIBBON_CYCLE_MS = 10400
export const RIBBON_PAPER_MS = 960
export const RIBBON_REEL_MS = 720

// The reel and poster form a reversible cycle in a single page.
export const ribbonNextPhase = (phase) => ({
  'ribbon-opening': 'unrolling',
  unrolling: 'ready',
  ready: 'closing',
  closing: 'ribbon-closing',
  'ribbon-closing': 'closed',
  closed: 'ribbon-opening',
})[phase]

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
export const easeInOut = (value) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

// One clock drives both the rolling rim and the continuous strip of ribbon.
export function ribbonLoopProgress(elapsed) {
  const time = ((elapsed % RIBBON_CYCLE_MS) + RIBBON_CYCLE_MS) % RIBBON_CYCLE_MS
  if (time < 900) return 0
  if (time < 3500) return easeInOut((time - 900) / 2600)
  if (time < 5700) return 1
  if (time < 8500) return 1 - easeInOut((time - 5700) / 2800)
  return 0
}

export function ribbonOpeningProgress(from, elapsed) {
  const start = clamp(from)
  if (start === 1) return 1
  const duration = 240 + (1 - start) * 1000
  return start + (1 - start) * easeInOut(elapsed / duration)
}

export function ribbonGeometry(progress, containerWidth, extension = 0) {
  const p = clamp(progress)
  const width = Math.max(240, containerWidth)
  const scale = clamp(width / 460, 0.78, 1)
  const outer = 88 * scale
  const inner = 62 * scale
  const radius = 64 * scale
  const motionStart = outer + 14 * scale
  // The circle is anchored at the ribbon's right end for RTL artwork.
  // RibbonArtwork mirrors the same coordinates for English, anchoring it left.
  const end = width - motionStart
  const cx = end
  // Only the free end of the ribbon moves as the coil unwinds/rewinds.
  const fullyOpenStart = motionStart + (12 * scale - motionStart) * clamp(extension)
  const start = cx + (fullyOpenStart - cx) * p
  const cy = 108 * scale
  const sweep = (Math.PI * 2 - 0.14) * (1 - p) + 0.025
  const angle = Math.PI / 2 - sweep
  const point = (r) => `${cx + Math.cos(angle) * r} ${cy + Math.sin(angle) * r}`
  const large = sweep > Math.PI ? 1 : 0
  // The straight tail and the remaining wrap are ONE shape. Rewinding is the
  // exact inverse, rather than an independently scaled rectangular banner.
  const path = `M ${start} ${cy + inner} L ${cx} ${cy + inner} A ${inner} ${inner} 0 ${large} 0 ${point(inner)} L ${point(outer)} A ${outer} ${outer} 0 ${large} 1 ${cx} ${cy + outer} L ${start} ${cy + outer} Z`
  return { width, height: 228 * scale, scale, outer, inner, radius, start, end, cx, cy, path, rotation: p * 352, reveal: easeInOut((p - 0.5) * 2) }
}
