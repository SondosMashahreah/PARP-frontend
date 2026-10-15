import { api } from '../auth/authApi.js'
export const excellenceApi = {
  list: (filters = {}) => api('/api/excellence?' + new URLSearchParams(Object.entries(filters).filter(([,v]) => v !== '' && v != null))),
  filters: () => api('/api/excellence/filters'),
  researcher: id => api(`/api/excellence/${id}/researcher`),
  abstract: id => api(`/api/excellence/${id}/abstract`),
  adminList: offset => api(`/api/excellence/admin?offset=${offset}&limit=50`),
  research: q => api('/api/excellence/admin/research?' + new URLSearchParams({q})),
  save: (id, data) => api(`/api/excellence/admin${id ? `/${id}` : ''}`, {method:id?'PUT':'POST',body:JSON.stringify(data)}),
  image: (id, file) => {const form=new FormData();form.set('file',file);return api(`/api/excellence/admin/${id}/image`,{method:'POST',body:form})},
  remove: id => api(`/api/excellence/admin/${id}`,{method:'DELETE'}),
}
