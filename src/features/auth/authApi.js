const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const ACCESS_KEY = 'parp-access-token'
const REFRESH_KEY = 'parp-refresh-token'

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_KEY)
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
}

export function saveTokens(payload) {
  window.localStorage.setItem(ACCESS_KEY, payload.access_token)
  window.localStorage.setItem(REFRESH_KEY, payload.refresh_token)
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = Array.isArray(payload.detail)
      ? payload.detail.map((item) => item.msg).join(', ')
      : payload.detail
    throw new Error(detail || 'Request failed')
  }
  return payload
}

async function refreshAccessToken() {
  const refreshToken = window.localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return null
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!response.ok) {
    clearTokens()
    return null
  }
  const payload = await response.json()
  saveTokens(payload)
  return payload.access_token
}

export async function api(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {})
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 401 && retry && window.localStorage.getItem(REFRESH_KEY)) {
    const nextToken = await refreshAccessToken()
    if (nextToken) {
      headers.set('Authorization', `Bearer ${nextToken}`)
      response = await fetch(`${API_URL}${path}`, { ...options, headers })
    }
  }
  return parseResponse(response)
}

export const authApi = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false),
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),
  verifyOtp: (email, otp) => api('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }, false),
  resendOtp: (email) => api('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }, false),
  me: () => api('/auth/me'),
  logout: () => clearTokens(),
}
