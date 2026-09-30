import { api } from '../../auth/authApi.js'

export async function educationRequest(path, signal) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) abort()
  const timer = setTimeout(abort, 15000)
  try {
    return await api(`/api/education${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

export function queryString(values) {
  return new URLSearchParams(
    Object.entries(values).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  ).toString()
}
