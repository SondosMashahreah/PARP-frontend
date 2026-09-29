import { useSyncExternalStore } from 'react'
import { routeSnapshot, subscribeToRoute } from './navigation.js'

export function useLocation() {
  const route = useSyncExternalStore(subscribeToRoute, routeSnapshot, () => '/')
  const url = new URL(route, 'https://parp.invalid')
  return { pathname: url.pathname.replace(/\/$/, '') || '/', search: url.search, hash: url.hash }
}

export function usePathname() {
  return useLocation().pathname
}
