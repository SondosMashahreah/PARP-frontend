import { api } from '../auth/authApi.js'
export const researcherApi = {
  overview: () => api('/api/researcher/me'),
  create: (content) => api('/api/researcher/drafts', { method: 'POST', body: JSON.stringify(content) }),
  save: (id, content, revision) => api(`/api/researcher/drafts/${id}`, { method: 'PUT', body: JSON.stringify({ content, revision }) }),
  submit: (id, revision, file) => { const body = new FormData(); body.append('revision', revision); body.append('file', file); return api(`/api/researcher/drafts/${id}/submit`, { method: 'POST', body }) },
}
