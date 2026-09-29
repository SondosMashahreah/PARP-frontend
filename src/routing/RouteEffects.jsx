import { useEffect } from 'react'
import { useLocation } from './useLocation.js'
import { scrollToRoute } from './scrollToRoute.js'

export default function RouteEffects() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollToRoute(hash))
    return () => cancelAnimationFrame(frame)
  }, [pathname, search, hash])
  return null
}
