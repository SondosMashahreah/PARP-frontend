import { useCallback, useEffect, useState } from 'react'
import { platformApi } from './platformApi.js'
export function usePlatformData(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((n) => n + 1), [])
  useEffect(() => {
    let active = true
    platformApi
      .get(path)
      .then((result) => {
        if (active) {
          setData(result)
          setError('')
        }
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => {
      active = false
    }
  }, [path, version])
  return { data, error, reload }
}
