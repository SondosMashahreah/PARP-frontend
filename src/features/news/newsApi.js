import { api } from '../auth/authApi.js'
export const newsApi = {
  list: (offset = 0, limit = 12, admin = false, q = '') => api(`/api/news${admin ? '/admin' : ''}?offset=${offset}&limit=${limit}&q=${encodeURIComponent(q.slice(0, 150))}`),
  detail: (id, admin = false) => api(`/api/news${admin ? '/admin' : ''}/${encodeURIComponent(id)}`),
  save: (id, data) => api(`/api/news/admin${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) }),
  // The first uploaded image is the cover; subsequent images are appended in upload order.
  image: (id, file) => { const body = new FormData(); body.append('file', file); return api(`/api/news/admin/${id}/image`, { method: 'POST', body }) },
  addImage: (id, file) => { const body = new FormData(); body.append('file', file); return api(`/api/news/admin/${id}/images`, { method: 'POST', body }) },
  removeImage: (id, imageId) => api(`/api/news/admin/${id}/images/${encodeURIComponent(imageId)}`, { method: 'DELETE' }),
  delete: (id) => api(`/api/news/admin/${id}`, { method: 'DELETE' }),
}
export function displayNews(row, ar = true) {
  const text = (key) => (!ar && row[`${key}_en`]) || row[key] || ''
  const images = Array.isArray(row.images) && row.images.length
    ? row.images.filter(item => item?.url)
    : row.image_url ? [{ id: 'cover', url: row.image_url, alt: row.image_alt || text('title'), is_cover: true }] : []
  return { ...row, title: text('title'), excerpt: text('excerpt'), body: text('body'), category: text('category'),
    image: row.image_url, imageAlt: row.image_alt || text('title'), images, publishedAt: row.published_at,
    href: `/news?article=${encodeURIComponent(row.id)}` }
}
