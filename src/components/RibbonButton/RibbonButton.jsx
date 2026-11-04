import { useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { appHref, navigate } from '../../routing/navigation.js'
import { RibbonNavigationContext } from './ribbonNavigationContext.js'
import { ribbonGeometry, ribbonLoopProgress, ribbonOpeningProgress } from './ribbonMotion.js'
import './RibbonButton.css'

const ICON_PATHS = {
  research: 'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16M6 8h3M6 12h3M15 8h3M15 12h3',
  practices: 'm5 19 1-5L17 3l4 4-11 11-5 1Zm1-5 4 4M14 6l4 4M4 22h16',
  tracking: 'M4 20V4m0 16h17M8 15l4-5 4 2 5-7M17 5h4v4',
  training: 'm2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v9',
}

function useArtworkWidth(ref, fixedWidth) {
  const [measured, setMeasured] = useState(500)
  useLayoutEffect(() => {
    if (fixedWidth !== undefined || !ref.current) return
    const element = ref.current
    const update = () => setMeasured(element.getBoundingClientRect().width || 500)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [fixedWidth, ref])
  return fixedWidth ?? measured
}

// Labels are siblings of the rotating rim, so their orientation never changes.
export function RibbonArtwork({ label, caption, symbol = '01', icon = 'research', isArabic = true, progress = 1, width, extension = 0 }) {
  const element = useRef(null)
  const actualWidth = useArtworkWidth(element, width)
  const id = useId().replaceAll(':', '')
  const g = ribbonGeometry(progress, actualWidth, extension)
  const x = isArabic ? g.cx : g.width - g.cx
  const tailX = isArabic ? g.start : g.width - g.cx
  const tailWidth = g.cx - g.start
  const revealX = tailX
  const lines = label.length > 12 && label.includes(' ')
    ? [label.slice(0, label.lastIndexOf(' ')), label.slice(label.lastIndexOf(' ') + 1)]
    : [label]

  return <div ref={element} className="ribbon-artwork" style={{ height: g.height }} aria-hidden="true">
    <svg viewBox={`0 0 ${g.width} ${g.height}`} focusable="false">
      <defs>
        <linearGradient id={`${id}-silk`} x1="0" y1="0" x2="0.8" y2="1">
          <stop stopColor="#d9b6ff" /><stop offset=".18" stopColor="#9856d2" />
          <stop offset=".48" stopColor="#522278" /><stop offset=".78" stopColor="#9a5dd0" />
          <stop offset="1" stopColor="#e1c3fa" />
        </linearGradient>
        <radialGradient id={`${id}-coin`} cx=".3" cy=".22" r=".9">
          <stop stopColor="#49305e" /><stop offset=".55" stopColor="#251733" /><stop offset="1" stopColor="#160e20" />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#efdbff" /><stop offset=".32" stopColor="#a76ee0" />
          <stop offset=".7" stopColor="#522b76" /><stop offset="1" stopColor="#cf9ff7" />
        </linearGradient>
        <clipPath id={`${id}-caption`}><rect x={revealX} y={g.cy + g.inner} width={Math.max(0, g.cx - g.start)} height={g.outer - g.inner} /></clipPath>
      </defs>
      <g transform={isArabic ? undefined : `translate(${g.width} 0) scale(-1 1)`}>
        <ellipse cx={g.cx} cy={g.cy + g.outer + 12 * g.scale} rx={g.outer * .8} ry={7 * g.scale} fill="#060309" opacity=".4" />
        <path className="ribbon-artwork__silk" d={g.path} fill={`url(#${id}-silk)`} stroke="#c59be9" strokeWidth={.8 * g.scale} />
        <path d={g.path} fill="none" stroke="#f2ddff" strokeWidth={.5 * g.scale} opacity=".5" />
      </g>
      <g clipPath={`url(#${id}-caption)`} opacity={g.reveal}>
        <text x={tailX + tailWidth / 2} y={g.cy + (g.inner + g.outer) / 2} className="ribbon-artwork__caption" style={{ fontSize: 12.5 * g.scale }} direction={isArabic ? 'rtl' : 'ltr'}>{caption}</text>
      </g>
      <g transform={`translate(${x} ${g.cy})`}>
        <circle r={g.radius + 2 * g.scale} fill="#120a1d" stroke="#603c7d" strokeWidth={g.scale} />
        <circle r={g.radius} fill={`url(#${id}-coin)`} stroke={`url(#${id}-edge)`} strokeWidth={2 * g.scale} />
        <g className="ribbon-artwork__rotor" transform={`rotate(${(isArabic ? 1 : -1) * g.rotation})`}>
          <circle r={g.radius - 6 * g.scale} fill="none" stroke="#b387d8" strokeWidth={.6 * g.scale} opacity=".38" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M 0 ${-g.radius + 4 * g.scale} v ${i % 4 === 0 ? 6 * g.scale : 3 * g.scale}`} transform={`rotate(${i * 22.5})`} stroke="#d8b8f6" strokeWidth={g.scale} opacity={i % 4 === 0 ? .8 : .3} />)}
          <path d={`M ${-g.radius * .73} ${-g.radius * .47} A ${g.radius * .87} ${g.radius * .87} 0 0 1 ${g.radius * .35} ${-g.radius * .8}`} fill="none" stroke="#f1dfff" strokeWidth={2.5 * g.scale} strokeLinecap="round" opacity=".6" />
        </g>
        <text y={-35 * g.scale} className="ribbon-artwork__number" style={{ fontSize: 9 * g.scale }}>{symbol}</text>
        <svg x={-11 * g.scale} y={-23 * g.scale} width={22 * g.scale} height={22 * g.scale} viewBox="0 0 24 24" fill="none" stroke="#cda5ee" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={ICON_PATHS[icon] || ICON_PATHS.research} /></svg>
        <text className="ribbon-artwork__label" style={{ fontSize: (isArabic ? 17 : 14.5) * g.scale }} direction={isArabic ? 'rtl' : 'ltr'}>
          {lines.map((line, index) => <tspan key={line} x="0" y={(lines.length === 1 ? 23 : 15 + index * 19) * g.scale}>{line}</tspan>)}
        </text>
        <path d={`m ${isArabic ? 4 * g.scale : -4 * g.scale} ${43 * g.scale} ${isArabic ? -6 * g.scale : 6 * g.scale} 0 m ${isArabic ? 0 : -6 * g.scale} ${-3 * g.scale} ${isArabic ? -3 * g.scale : 3 * g.scale} ${3 * g.scale} ${isArabic ? 3 * g.scale : -3 * g.scale} ${3 * g.scale}`} fill="none" stroke="#ba91dc" strokeWidth={g.scale} strokeLinecap="round" />
      </g>
    </svg>
  </div>
}

export default function RibbonButton({ to, relatedRoutes, label, caption, symbol, icon, isArabic = true, offset = 0, paused = false, onOpen }) {
  const element = useRef(null)
  const progressRef = useRef(ribbonLoopProgress(offset))
  const elapsedRef = useRef(offset)
  const activationRef = useRef(false)
  const committedRef = useRef(false)
  const navigation = useContext(RibbonNavigationContext)
  const release = navigation?.release
  const [progress, setProgress] = useState(() => ribbonLoopProgress(offset))
  const [opening, setOpening] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [inView, setInView] = useState(false)

  useEffect(() => () => {
    if (activationRef.current && !committedRef.current) release?.(to)
  }, [release, to])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '60px' })
    observer.observe(element.current)
    return () => { media.removeEventListener('change', update); observer.disconnect() }
  }, [])

  useEffect(() => {
    if (!opening && (paused || reducedMotion || !inView)) return
    let frame
    let previous
    let openingElapsed = 0
    const from = progressRef.current
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      committedRef.current = true
      const selection = { to, relatedRoutes, label, caption, symbol, icon, isArabic, source: element.current.getBoundingClientRect().toJSON() }
      if (onOpen) onOpen(selection)
      else if (navigation) navigation.open(selection, reducedMotion)
      else navigate(to)
    }
    const tick = (time) => {
      const delta = previous === undefined ? 0 : Math.min(50, time - previous)
      previous = time
      if (!document.hidden) {
        if (opening) openingElapsed += delta
        else elapsedRef.current += delta
        const next = opening
          ? reducedMotion ? 1 : ribbonOpeningProgress(from, openingElapsed)
          : ribbonLoopProgress(elapsedRef.current)
        progressRef.current = next
        setProgress(next)
        if (opening && next === 1) { finish(); return }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [caption, icon, inView, isArabic, label, navigation, onOpen, opening, paused, reducedMotion, relatedRoutes, symbol, to])

  function activate(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (activationRef.current || navigation?.busy) return
    if (!onOpen && navigation && !navigation.reserve(to)) return
    activationRef.current = true
    setOpening(true)
  }

  return <a ref={element} className="ribbon-button" href={appHref(to)} onClick={activate} aria-label={`${label} — ${caption}`} aria-busy={opening || undefined} data-opening={opening || undefined} data-progress={progress.toFixed(3)}>
    <RibbonArtwork label={label} caption={caption} symbol={symbol} icon={icon} isArabic={isArabic} progress={reducedMotion ? 1 : progress} />
    <span className="visually-hidden">{isArabic ? 'فتح القسم' : 'Open section'}</span>
  </a>
}
