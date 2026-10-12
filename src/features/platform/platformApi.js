import { api } from '../auth/authApi.js'
const base = '/api/platform'
export const platformApi = {
  get: (path) => api(base + path),
  post: (path, body) =>
    api(base + path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    }),
  put: (path, body) =>
    api(base + path, { method: 'PUT', body: JSON.stringify(body) }),
}
