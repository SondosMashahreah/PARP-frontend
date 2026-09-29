import { scrollToRoute } from './scrollToRoute.js'

export const ROUTE_EVENT = 'parp:route-change'

export function appHref(to = '/') {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return `${base}${to.startsWith('/') ? to : `/${to}`}`
}

export function routeSnapshot() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  let path = window.location.pathname
  if (base && (path === base || path.startsWith(`${base}/`))) path = path.slice(base.length)
  return `${path || '/'}${window.location.search}${window.location.hash}`
}

export function subscribeToRoute(callback) {
  window.addEventListener('popstate', callback)
  window.addEventListener('hashchange', callback)
  window.addEventListener(ROUTE_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener('hashchange', callback)
    window.removeEventListener(ROUTE_EVENT, callback)
  }
}

export function navigate(to) {
  const target = appHref(to)
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== target) {
    window.history.pushState({}, '', target)
  } else {
    scrollToRoute(window.location.hash)
  }
  window.dispatchEvent(new Event(ROUTE_EVENT))
}
