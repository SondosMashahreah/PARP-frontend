import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { navigate } from '../../routing/navigation.js'
import { useLocation } from '../../routing/useLocation.js'
import { RibbonArtwork } from './RibbonButton.jsx'
import { RibbonNavigationContext } from './ribbonNavigationContext.js'
import { easeInOut, ribbonGeometry, RIBBON_FLIGHT_MS, RIBBON_PAPER_MS } from './ribbonMotion.js'
import './RibbonNavigation.css'

function RibbonFlight({ selection, onLanded, onCancel }) {
  const [position, setPosition] = useState(selection.source)
  useLayoutEffect(() => {
    let frame
    let started
    let destination
    let attempts = 0
    const source = selection.source
    const tick = (now) => {
      if (!destination) {
        const header = document.querySelector('[data-ribbon-destination]')
        // Wait for the actual destination (including lazy route loading and
        // the router's scroll reset), never an approximation of its position.
        attempts++
        if (!header || attempts < 3) {
          if (attempts > 90) { onCancel(); return }
          frame = requestAnimationFrame(tick)
          return
        }
        destination = header.getBoundingClientRect()
        started = now
      }
      const raw = Math.min(1, (now - started) / RIBBON_FLIGHT_MS)
      const p = easeInOut(raw)
      setPosition({
        left: source.left + (destination.left - source.left) * p,
        top: source.top + (destination.top - source.top) * p - Math.sin(raw * Math.PI) * 28,
        width: source.width + (destination.width - source.width) * p,
        extension: p,
      })
      if (raw < 1) frame = requestAnimationFrame(tick)
      else onLanded()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onCancel, onLanded, selection])

  return createPortal(<div className="ribbon-flight" aria-hidden="true">
    <div className="ribbon-flight__veil" />
    <div className="ribbon-flight__button" style={{ left: position.left, top: position.top, width: position.width }}>
      <RibbonArtwork {...selection} progress={1} width={position.width} extension={position.extension || 0} />
    </div>
  </div>, document.body)
}

export function RibbonNavigationProvider({ children }) {
  const { pathname, search, hash } = useLocation()
  const route = `${pathname}${search}${hash}`
  const [selection, setSelection] = useState(null)
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
  const matches = selection?.to === route || Boolean(selection?.relatedRoutes?.includes(route))

  useEffect(() => {
    if (phase === 'ready') return
    // A back/forward action or a different route always cancels the overlay.
    if (!matches || selection?.to !== route) {
      locked.current = false
      const frame = requestAnimationFrame(finish)
      return () => cancelAnimationFrame(frame)
    }
    const timeout = window.setTimeout(finish, phase === 'unrolling' ? RIBBON_PAPER_MS : 3500)
    return () => window.clearTimeout(timeout)
  }, [finish, matches, phase, route, selection])

  const value = useMemo(() => ({ open, reserve, release, selection: matches ? selection : null, phase: matches ? phase : 'ready', busy: matches && phase !== 'ready' }), [matches, open, phase, release, reserve, selection])
  return <RibbonNavigationContext.Provider value={value}>
    {children}
    {matches && phase === 'flying' && <RibbonFlight selection={selection} onLanded={land} onCancel={finish} />}
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
    </div>
    <p className="visually-hidden" role="status">{phase !== 'ready' ? selection.isArabic ? `جارٍ فتح ${selection.label}…` : `Opening ${selection.label}…` : ''}</p>
    <div className="ribbon-document__paper">
      <div ref={content} className="ribbon-document__content" inert={phase !== 'ready'}>{children}</div>
      <div className="ribbon-document__roller" aria-hidden="true" />
    </div>
  </div>
}
