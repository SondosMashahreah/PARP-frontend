import { api } from '../auth/authApi.js'

export const notificationsApi = {
  list: (limit = 30, offset = 0) => api(`/api/notifications?limit=${limit}&offset=${offset}`),
  read: (id) => api(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),
  readAll: () => api('/api/notifications/read-all', { method: 'POST' }),
}
