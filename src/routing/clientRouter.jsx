import { useSyncExternalStore } from 'react'

const ROUTE_EVENT = 'parp:route-change'

function getBasePath() {
  const base = import.meta.env.BASE_URL || '/'
  if (base === '/') return ''
  return base.replace(/\/$/, '')
}

function normalizePath(pathname) {
  const base = getBasePath()
  let path = pathname || '/'

  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || '/'
  }

  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1) path = path.replace(/\/+$/, '')
  return path
}

function subscribe(callback) {
  window.addEventListener('popstate', callback)
  window.addEventListener(ROUTE_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(ROUTE_EVENT, callback)
  }
}

function getSnapshot() {
  return normalizePath(window.location.pathname)
}

function getServerSnapshot() {
  return '/'
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function navigate(to) {
  const base = getBasePath()
  const target = to === '/' ? `${base || ''}/` : `${base}${to}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (current !== target) {
    window.history.pushState({}, '', target)
  }

  window.dispatchEvent(new Event(ROUTE_EVENT))
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

export function RouteLink({ to, onClick, target, children, ...props }) {
  const base = getBasePath()
  const href = to === '/' ? `${base || ''}/` : `${base}${to}`

  const handleClick = (event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (target && target !== '_self') return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={href} target={target} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
