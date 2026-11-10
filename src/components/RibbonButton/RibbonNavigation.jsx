import { useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { navigate } from '../../routing/navigation.js'
import { useLocation } from '../../routing/useLocation.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RibbonArtwork } from './RibbonButton.jsx'
import { RibbonNavigationContext } from './ribbonNavigationContext.js'
import { ribbonSelectionForRoute } from './ribbonRoutes.js'
import { easeInOut, ribbonGeometry, RIBBON_REEL_MS, RIBBON_PAPER_MS, ribbonNextPhase } from './ribbonMotion.js'
import './RibbonNavigation.css'

// Navigation happens only once, after the home button completes its own loop.
// There is no full-screen flight overlay or delayed destination lookup.
export function RibbonNavigationProvider({ children }) {
  const { pathname, search, hash } = useLocation()
  const { isArabic } = useLanguage()
  const route = `${pathname}${search}${hash}`
  const fallback = useMemo(() => ribbonSelectionForRoute(route, isArabic), [route, isArabic])
  const [activeSelection, setActiveSelection] = useState(null)
  const reserved = useRef(null)

  const related = Boolean(activeSelection && (
    route === activeSelection.to || activeSelection.relatedRoutes?.includes(route)
  ))
  const selection = related
    ? ribbonSelectionForRoute(activeSelection.to, isArabic) || activeSelection
    : fallback

  // The selection is derived from the route when there is no matching active
  // poster. This prevents redundant synchronous state updates in an effect.

  const reserve = useCallback((to) => {
    if (reserved.current) return false
    reserved.current = to
    return true
  }, [])
  const release = useCallback((to) => {
    if (reserved.current === to) reserved.current = null
  }, [])
  const open = useCallback((next) => {
    if (reserved.current && reserved.current !== next.to) return
    reserved.current = null
    setActiveSelection(next)
    navigate(next.to)
  }, [])

  const value = useMemo(() => ({ open, reserve, release, selection, busy: false }), [open, reserve, release, selection])
  return <RibbonNavigationContext.Provider value={value}>{children}</RibbonNavigationContext.Provider>
}

function RibbonDocument({ children, selection }) {
  const element = useRef(null)
  const content = useRef(null)
  const paperId = useId()
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [phase, setPhase] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'ready' : 'ribbon-opening')
  const [progress, setProgress] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0)

  useLayoutEffect(() => {
    const root = element.current
    if (!root) return
    const update = () => {
      const g = ribbonGeometry(1, root.getBoundingClientRect().width, 1)
      root.style.setProperty('--paper-start', `${g.width - g.end}px`)
      root.style.setProperty('--paper-end', `${g.start}px`)
      root.style.setProperty('--paper-overlap', `${40 * g.scale}px`)
      root.style.setProperty('--ribbon-circle-x', `${selection.isArabic ? g.cx : g.width - g.cx}px`)
      root.style.setProperty('--ribbon-circle-y', `${g.cy}px`)
      root.style.setProperty('--ribbon-circle-hit', `${(g.radius + 7 * g.scale) * 2}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(root)
    return () => observer.disconnect()
  }, [selection.isArabic])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setReducedMotion(media.matches)
      // An external accessibility preference change may finish an animation.
      if (!media.matches) return
      if (phase === 'ribbon-opening' || phase === 'unrolling') {
        setProgress(1)
        setPhase('ready')
      } else if (phase === 'closing' || phase === 'ribbon-closing') {
        setProgress(0)
        setPhase('closed')
      }
    }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [phase])

  useEffect(() => {
    if (reducedMotion) return undefined

    if (phase === 'ribbon-opening' || phase === 'ribbon-closing') {
      const isOpening = phase === 'ribbon-opening'
      let frame
      let started
      const tick = (time) => {
        if (started === undefined) started = time
        const elapsed = Math.min(1, (time - started) / RIBBON_REEL_MS)
        setProgress(isOpening ? easeInOut(elapsed) : 1 - easeInOut(elapsed))
        if (elapsed >= 1) setPhase(ribbonNextPhase(phase))
        else frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(frame)
    }

    if (phase === 'unrolling' || phase === 'closing') {
      const timeout = window.setTimeout(() => setPhase(ribbonNextPhase(phase)), RIBBON_PAPER_MS)
      return () => window.clearTimeout(timeout)
    }
  }, [phase, reducedMotion])

  useEffect(() => {
    if (phase !== 'ready') return
    const heading = content.current?.querySelector('h1')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }, [phase])

  const toggle = () => {
    if (phase !== 'ready' && phase !== 'closed') return
    if (reducedMotion) {
      const opening = phase === 'closed'
      setProgress(opening ? 1 : 0)
      setPhase(opening ? 'ready' : 'closed')
    } else {
      setPhase(ribbonNextPhase(phase))
    }
  }

  const paperVisible = phase === 'ready' || phase === 'unrolling' || phase === 'closing'
  const busy = phase !== 'ready' && phase !== 'closed'
  const closed = phase === 'closed' || phase === 'ribbon-opening'
  const actionLabel = closed
    ? selection.isArabic ? `فتح ${selection.label}` : `Open ${selection.label}`
    : selection.isArabic ? `لف ${selection.label}` : `Roll up ${selection.label}`

  return <div ref={element} className="ribbon-document" data-phase={phase} aria-busy={busy || undefined}>
    <div className="ribbon-document__header" data-ribbon-destination>
      <RibbonArtwork {...selection} progress={progress} extension={1} />
      <button
        className="ribbon-document__close"
        type="button"
        onClick={toggle}
        aria-controls={paperId}
        aria-expanded={paperVisible}
        aria-disabled={busy}
        aria-label={actionLabel}
        title={actionLabel}
      />
    </div>
    <p className="visually-hidden" role="status">
      {phase === 'closing' || phase === 'ribbon-closing'
        ? selection.isArabic ? `جارٍ لف ${selection.label}…` : `Rolling up ${selection.label}…`
        : phase === 'unrolling' || phase === 'ribbon-opening'
          ? selection.isArabic ? `جارٍ فتح ${selection.label}…` : `Opening ${selection.label}…`
          : ''}
    </p>
    <div id={paperId} className="ribbon-document__paper" aria-hidden={!paperVisible}>
      <div ref={content} className="ribbon-document__content" inert={phase !== 'ready'}>{children}</div>
      <div className="ribbon-document__roller" aria-hidden="true" />
    </div>
  </div>
}

export function RibbonPage({ children }) {
  const selection = useContext(RibbonNavigationContext)?.selection
  if (!selection) return children
  // Keep the same document mounted on child routes; another root section starts
  // a new opening sequence. Closing/reopening never navigates or remounts forms.
  return <RibbonDocument key={selection.to} selection={selection}>{children}</RibbonDocument>
}
