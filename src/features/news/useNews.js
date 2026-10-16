import { useEffect, useState } from 'react'
import { newsApi } from './newsApi.js'
export function useNews({ id = null, offset = 0, limit = 12, admin = false, revision = 0, q = '' } = {}) {
  const key = JSON.stringify([id, offset, limit, admin, revision, q])
  const [result, setResult] = useState({ key: '', data: null, error: '' })
  useEffect(() => {
    let active = true
    const request = id ? newsApi.detail(id, admin) : newsApi.list(offset, limit, admin, q)
    request.then(data => { if (active) setResult({ key, data, error: '' }) })
      .catch(error => { if (active) setResult({ key, data: null, error: error.message }) })
    return () => { active = false }
  }, [key, id, offset, limit, admin, q])
  return result.key === key ? { ...result, loading: false } : { data: null, error: '', loading: true }
}
