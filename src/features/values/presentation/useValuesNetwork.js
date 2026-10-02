import { useEffect, useRef } from 'react'
import { confine, MOBILE_POSITIONS, NETWORK_EDGES, NETWORK_POSITIONS, spring } from '../domain/network.js'

export function useValuesNetwork(paused, language) {
  const stage = useRef(null)
  useEffect(() => {
    const host = stage.current
    const links = [...host.querySelectorAll('[data-value-node]')]
    const lines = [...host.querySelectorAll('line')]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0, height = 0, mobile = false, frame = 0, previous = 0, clock = 0, visible = false
    let drag = null, focused = -1, hovered = -1
    const suppress = new Map()
    const nodes = links.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0, tx: 0, ty: 0 }))
    const resting = () => paused || reduced.matches
    function paint() {
      nodes.forEach((n, i) => {
        links[i].style.left = '0px'; links[i].style.top = '0px'
        links[i].style.transform = `translate3d(${n.x}px, ${n.y}px, 0) translate(-50%, -50%)`
      })
      const center = [width / 2, height * (mobile ? 0.15 : 0.49)]
      const segments = nodes.map((n) => [center, [n.x, n.y]])
      NETWORK_EDGES.forEach(([a, b]) => segments.push([[nodes[a].x, nodes[a].y], [nodes[b].x, nodes[b].y]]))
      segments.forEach(([a, b], i) => {
        for (const [key, value] of [['x1', a[0]], ['y1', a[1]], ['x2', b[0]], ['y2', b[1]]]) lines[i].setAttribute(key, value)
      })
    }
    function resize() {
      width = host.clientWidth; height = host.clientHeight; mobile = window.matchMedia('(max-width: 720px)').matches
      const positions = mobile ? MOBILE_POSITIONS : NETWORK_POSITIONS
      nodes.forEach((n, i) => {
        n.w = links[i].offsetWidth; n.h = links[i].offsetHeight
        n.tx = confine(positions[i][0] * width, width, n.w)
        n.ty = confine(positions[i][1] * height, height, n.h)
        n.x = n.tx; n.y = n.ty; n.vx = 0; n.vy = 0
      })
      paint()
    }
    function tick(time) {
      const dt = Math.min((time - (previous || time)) / 1000, 0.032)
      previous = time; clock += dt
      nodes.forEach((n, i) => {
        if (drag?.index === i || focused === i || hovered === i) return
        const drift = mobile ? 3 : 9
        ;[n.x, n.vx] = spring(n.x, n.vx, n.tx + Math.sin(clock * 0.48 + i * 1.4) * drift, dt)
        ;[n.y, n.vy] = spring(n.y, n.vy, n.ty + Math.cos(clock * 0.4 + i * 1.8) * drift, dt)
        n.x = confine(n.x, width, n.w); n.y = confine(n.y, height, n.h)
      })
      paint(); frame = requestAnimationFrame(tick)
    }
    function sync() {
      cancelAnimationFrame(frame); previous = 0
      if (visible && !document.hidden && !resting()) frame = requestAnimationFrame(tick)
      else if (resting() && !drag) { nodes.forEach((n) => { n.x = n.tx; n.y = n.ty; n.vx = n.vy = 0 }); paint() }
    }
    const disposers = []
    function listen(element, name, fn, options) {
      element.addEventListener(name, fn, options)
      disposers.push(() => element.removeEventListener(name, fn, options))
    }
    links.forEach((link, index) => {
      listen(link, 'pointerdown', (event) => {
        if (event.button !== 0 || !event.isPrimary || drag) return
        const n = nodes[index]
        suppress.delete(index)
        focused = -1
        drag = { index, pointer: event.pointerId, sx: event.clientX, sy: event.clientY, x: n.x, y: n.y, moved: false }
        link.setPointerCapture(event.pointerId)
      })
      listen(link, 'pointermove', (event) => {
        if (!drag || drag.index !== index || drag.pointer !== event.pointerId) return
        const dx = event.clientX - drag.sx, dy = event.clientY - drag.sy
        if (Math.hypot(dx, dy) > 7) drag.moved = true
        if (!drag.moved) return
        const n = nodes[index]
        n.x = confine(drag.x + dx, width, n.w); n.y = confine(drag.y + dy, height, n.h)
        n.vx = n.vy = 0; link.dataset.dragging = 'true'; paint()
      })
      const release = (event) => {
        if (!drag || drag.index !== index || drag.pointer !== event.pointerId) return
        if (drag.moved) suppress.set(index, performance.now() + 650)
        drag = null; hovered = -1; delete link.dataset.dragging
        if (link.hasPointerCapture(event.pointerId)) link.releasePointerCapture(event.pointerId)
        sync()
      }
      listen(link, 'pointerup', release); listen(link, 'pointercancel', release); listen(link, 'lostpointercapture', release)
      listen(link, 'click', (event) => {
        if (event.detail !== 0 && (suppress.get(index) || 0) > performance.now()) {
          event.preventDefault(); event.stopPropagation(); suppress.delete(index)
        }
      }, true)
      listen(link, 'dragstart', (event) => event.preventDefault())
      listen(link, 'focus', () => { focused = link.matches(':focus-visible') ? index : -1 })
      listen(link, 'blur', () => { focused = -1 })
      listen(link, 'pointerenter', () => { hovered = index })
      listen(link, 'pointerleave', () => { if (hovered === index) hovered = -1 })
    })
    const observer = new ResizeObserver(resize)
    observer.observe(host); links.forEach((link) => observer.observe(link))
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: 0.05 })
    intersection.observe(host)
    listen(document, 'visibilitychange', sync); listen(reduced, 'change', sync)
    resize()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); disposers.forEach((dispose) => dispose()) }
  }, [paused, language])
  return stage
}
