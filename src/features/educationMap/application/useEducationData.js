import { useEffect, useState } from 'react'
import { educationRequest } from '../data/educationApi.js'

export function useEducationData(path, revision = 0) {
  const key = `${path}:${revision}`
  const [result, setResult] = useState({ key: null, data: null, error: false })
  useEffect(() => {
    if (path === null) return undefined
    const controller = new AbortController()
    educationRequest(path, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data, error: false })
      },
      () => {
        if (!controller.signal.aborted)
          setResult({ key, data: null, error: true })
      },
    )
    return () => controller.abort()
  }, [path, key])
  return path === null
    ? { data: null, loading: false, error: false }
    : result.key === key
      ? { ...result, loading: false }
      : { data: null, error: false, loading: true }
}

export function useDebouncedValue(value, delay = 300) {
  const [settled, setSettled] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return settled
}
