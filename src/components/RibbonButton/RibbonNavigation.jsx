import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { appHref, navigate } from '../../routing/navigation.js'
import { useLocation } from '../../routing/useLocation.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RibbonArtwork } from './RibbonButton.jsx'
import { RibbonNavigationContext } from './ribbonNavigationContext.js'
import { ribbonSelectionForRoute } from './ribbonRoutes.js'
import { easeInOut, ribbonFlightProgress, ribbonGeometry, RIBBON_FLIGHT_MS, RIBBON_PAPER_MS } from './ribbonMotion.js'
import './RibbonNavigation.css'

function originButton(to) {
  const href = appHref(to)
  return [...document.querySelectorAll('a.ribbon-button[href]')]
    .find((element) => element.getAttribute('href') === href)
}

function RibbonFlight({ selection, returning = false, returnFrom, onLanded, onCancel }) {
  const source = returning ? returnFrom : selection.source
  const [position, setPosition] = useState(() => ({ ...source, extension: returning ? 1 : 0, progress: 1 }))
  useLayoutEffect(() => {
    let frame
    let started
    let destination
    let attempts = 0
    const tick = (now) => {
      if (!destination) {
        const target = returning ? originButton(selection.to) : document.querySelector('[data-ribbon-destination]')
        // Wait for the real destination and the route's scroll reset.
        attempts++
        if (!target || attempts < 4) {
          if (attempts > 180) { onCancel(); return }
          frame = requestAnimationFrame(tick)
          return
        }
        if (returning) target.scrollIntoView({ behavior: 'instant', block: 'center' })
        destination = target.getBoundingClientRect()
        started = now
      }
      const raw = Math.min(1, (now - started) / RIBBON_FLIGHT_MS)
      const p = easeInOut(raw)
      const motion = ribbonFlightProgress(raw, returning)
      setPosition({
        left: source.left + (destination.left - source.left) * p,
        top: source.top + (destination.top - source.top) * p - Math.sin(raw * Math.PI) * 28,
        width: source.width + (destination.width - source.width) * p,
        extension: motion.extension,
        progress: motion.progress,
      })
      if (raw < 1) frame = requestAnimationFrame(tick)
      else onLanded()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onCancel, onLanded, returning, selection, source])

  return createPortal(<div className="ribbon-flight" aria-hidden="true">
    <div className="ribbon-flight__veil" />
    <div className="ribbon-flight__button" style={{ left: position.left, top: position.top, width: position.width }}>
      <RibbonArtwork {...selection} progress={position.progress} width={position.width} extension={position.extension} />
    </div>
  </div>, document.body)
}

export function RibbonNavigationProvider({ children }) {
  const { pathname, search, hash } = useLocation()
  const { isArabic } = useLanguage()
  const route = `${pathname}${search}${hash}`
  const fallback = useMemo(() => ribbonSelectionForRoute(route, isArabic), [route, isArabic])
  const [selection, setSelection] = useState(null)
  // When loading a deep link or using an older shortcut, no RibbonButton has
  // reserved a flight. Show the real section inside a ribbon nonetheless.
  const [fallbackOpeningRoute, setFallbackOpeningRoute] = useState(() =>
    ribbonSelectionForRoute(route, isArabic) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? route : null
  )
  const [returnFrom, setReturnFrom] = useState(null)
  const [phase, setPhase] = useState('ready')
  const locked = useRef(false)
  const reserve = useCallback((to) => {
    if (locked.current) return false
    locked.current = to
    return true
  }, [])
  const release = useCallback((to) => {
    if (locked.current === to) locked.current = false
  }, [])
  const open = useCallback((next, reducedMotion) => {
    if (locked.current && locked.current !== next.to) return
    locked.current = reducedMotion ? false : next.to
    setSelection(next)
    setPhase(reducedMotion ? 'ready' : 'flying')
    navigate(next.to)
  }, [])
  const land = useCallback(() => setPhase('unrolling'), [])
  const finish = useCallback(() => { locked.current = false; setPhase('ready') }, [])
  const reset = useCallback(() => {
    locked.current = false
    setSelection(null)
    setReturnFrom(null)
    setPhase('ready')
  }, [])
  const matches = selection?.to === route || Boolean(selection?.relatedRoutes?.includes(route))
  const inferred = !selection ? fallback : null
  const shownSelection = matches ? selection : inferred
  const isFallbackOpening = Boolean(inferred && fallbackOpeningRoute === route)
  const shownPhase = matches ? phase : isFallbackOpening ? 'unrolling' : 'ready'

  // A direct URL or any of the original workspace shortcuts should unfold
  // the actual page, not bypass the ribbon because no selection was stored.
  useLayoutEffect(() => {
    if (selection || !fallback || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFallbackOpeningRoute(null)
    } else {
      setFallbackOpeningRoute(route)
    }
  }, [fallback, route, selection])

  useEffect(() => {
    if (!fallbackOpeningRoute) return
    const timeout = window.setTimeout(() => setFallbackOpeningRoute(null), RIBBON_PAPER_MS)
    return () => window.clearTimeout(timeout)
  }, [fallbackOpeningRoute])

  const close = useCallback(() => {
    const active = shownSelection
    if (!active || shownPhase !== 'ready' || locked.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const to = active.to
      reset()
      navigate('/workspace')
      requestAnimationFrame(() => requestAnimationFrame(() => originButton(to)?.focus({ preventScroll: true })))
      return
    }
    locked.current = active.to
    // Promote an inferred/direct-link selection to a real selection so that
    // the closing and return-flight phases keep their source information.
    setSelection(active)
    setPhase('closing')
  }, [reset, shownPhase, shownSelection])

  const beginReturn = useCallback(() => {
    const header = document.querySelector('[data-ribbon-destination]')
    if (!header) {
      reset()
      navigate('/workspace')
      return
    }
    const rect = header.getBoundingClientRect()
    setReturnFrom({ left: rect.left, top: rect.top, width: rect.width })
    setPhase('returning')
    navigate('/workspace')
  }, [reset])

  const completeReturn = useCallback(() => {
    const button = originButton(selection?.to)
    reset()
    button?.focus({ preventScroll: true })
  }, [reset, selection])

  useEffect(() => {
    if (phase === 'ready') {
      if (!selection || matches) return
      // Leaving the ribbon routes normally must not leave a stale selection.
      const frame = requestAnimationFrame(reset)
      return () => cancelAnimationFrame(frame)
    }
    if (phase === 'returning') {
      if (route !== '/workspace') {
        const frame = requestAnimationFrame(reset)
        return () => cancelAnimationFrame(frame)
      }
      const timeout = window.setTimeout(reset, 6000)
      return () => window.clearTimeout(timeout)
    }
    // Browser navigation or an unrelated route cancels the animation.
    if (!matches || (phase === 'flying' && selection?.to !== route)) {
      const frame = requestAnimationFrame(reset)
      return () => cancelAnimationFrame(frame)
    }
    const callback = phase === 'unrolling' ? finish : phase === 'closing' ? beginReturn : reset
    const timeout = window.setTimeout(callback, phase === 'unrolling' || phase === 'closing' ? RIBBON_PAPER_MS : 3500)
    return () => window.clearTimeout(timeout)
  }, [beginReturn, finish, matches, phase, reset, route, selection])

  const value = useMemo(() => ({
    open, reserve, release, close,
    selection: shownSelection,
    phase: shownPhase,
    busy: phase !== 'ready' || isFallbackOpening,
  }), [close, isFallbackOpening, open, phase, release, reserve, shownPhase, shownSelection])

  return <RibbonNavigationContext.Provider value={value}>
    {children}
    {matches && phase === 'flying' && <RibbonFlight selection={selection} onLanded={land} onCancel={reset} />}
    {phase === 'returning' && returnFrom && <RibbonFlight selection={selection} returning returnFrom={returnFrom} onLanded={completeReturn} onCancel={reset} />}
  </RibbonNavigationContext.Provider>
}

export function RibbonPage({ children }) {
  const navigation = useContext(RibbonNavigationContext)
  const element = useRef(null)
  const content = useRef(null)
  const selection = navigation?.selection
  const phase = navigation?.phase || 'ready'

  useLayoutEffect(() => {
    if (!selection) return
    const root = element.current
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
  }, [selection])

  useEffect(() => {
    if (!selection || phase !== 'ready') return
    const heading = content.current?.querySelector('h1')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }, [phase, selection])

  if (!selection) return children
  return <div ref={element} className="ribbon-document" data-phase={phase} aria-busy={phase !== 'ready' || undefined}>
    <div className="ribbon-document__header" data-ribbon-destination>
      <RibbonArtwork {...selection} progress={1} extension={1} />
      <button className="ribbon-document__close" type="button" onClick={navigation.close} disabled={phase !== 'ready'} aria-label={selection.isArabic ? `إغلاق ${selection.label} والعودة لمساحة العمل` : `Close ${selection.label} and return to workspace`} title={selection.isArabic ? 'لف البوستر والعودة' : 'Roll up and return'} />
    </div>
    <p className="visually-hidden" role="status">{phase === 'closing' ? selection.isArabic ? `جارٍ إغلاق ${selection.label}…` : `Closing ${selection.label}…` : phase !== 'ready' ? selection.isArabic ? `جارٍ فتح ${selection.label}…` : `Opening ${selection.label}…` : ''}</p>
    <div className="ribbon-document__paper">
      <div ref={content} className="ribbon-document__content" inert={phase !== 'ready'}>{children}</div>
      <div className="ribbon-document__roller" aria-hidden="true" />
    </div>
  </div>
}
