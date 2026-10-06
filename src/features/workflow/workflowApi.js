import { api } from '../auth/authApi.js'

export const workflowApi = {
  workspace: () => api('/api/workflow/workspace'),
  repository: () => api('/api/workflow/repository'),
  practices: () => api('/api/workflow/practices'),
  recommendations: () => api('/api/workflow/observatory/recommendations'),
  problems: () => api('/api/workflow/problem-bank'),
  educationCatalog: () => api('/api/education/catalog'),
  requestAffiliation: (body) => api('/api/workflow/me/affiliation', { method: 'PATCH', body: JSON.stringify(body) }),
  approveAffiliation: (userId) => api(`/api/workflow/affiliations/${userId}/approve`, { method: 'POST' }),
  submitResearch: (body) => api('/api/workflow/research', { method: 'POST', body }),
  resubmitResearch: (id, body) => api(`/api/workflow/research/${id}/resubmit`, { method: 'POST', body }),
  assignReviewer: (id, reviewerId) => api(`/api/workflow/research/${id}/assign-reviewer`, { method: 'POST', body: JSON.stringify({ reviewer_id: Number(reviewerId) }) }),
  acceptAssignment: (id) => api(`/api/workflow/assignments/${id}/accept`, { method: 'POST', body: JSON.stringify({ confidentiality_accepted: true }) }),
  submitReview: (id, body) => api(`/api/workflow/assignments/${id}/review`, { method: 'POST', body: JSON.stringify(body) }),
  decide: (id, body) => api(`/api/workflow/research/${id}/decision`, { method: 'POST', body: JSON.stringify(body) }),
  publish: (id) => api(`/api/workflow/research/${id}/publish`, { method: 'POST' }),
  publishPractice: (id) => api(`/api/workflow/research/${id}/publish-practice`, { method: 'POST' }),
  updateRecommendation: (id, status) => api(`/api/workflow/observatory/recommendations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateUserAccess: (id, body) => api(`/api/workflow/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
}
