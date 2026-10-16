export function storageKey(user) {
  // Committee accounts use a separate ID space; roles also isolate earlier access scopes.
  return `parp-chat:v1:${user ? `${user.role}:${user.id}` : 'guest'}`
}
export function newConversation(title = '') {
  const now = Date.now()
  return { id: globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`, title, createdAt: now, updatedAt: now, messages: [] }
}
export function emptyStore() {
  const thread = newConversation()
  return { version: 1, activeId: thread.id, threads: [thread] }
}
export function loadConversations(storage, key) {
  try {
    const raw = storage.getItem(key)
    if (!raw) return { data: emptyStore(), error: false }
    const parsed = JSON.parse(raw)
    if (parsed.version !== 1 || !Array.isArray(parsed.threads)) throw new Error('Invalid history')
    const ids = new Set()
    const threads = parsed.threads.filter(t => {
      if (!t || typeof t.id !== 'string' || ids.has(t.id) || !Array.isArray(t.messages)) return false
      ids.add(t.id); return true
    }).map(t => ({
      id: t.id, title: typeof t.title === 'string' ? t.title.slice(0, 100) : '',
      createdAt: Number.isFinite(t.createdAt) ? t.createdAt : Date.now(),
      updatedAt: Number.isFinite(t.updatedAt) ? t.updatedAt : Date.now(),
      messages: t.messages.filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
        .map(m => ({ id: typeof m.id === 'string' ? m.id : newConversation().id, role: m.role, content: m.content, error: Boolean(m.error) })),
    }))
    if (!threads.length) return { data: emptyStore(), error: false }
    return { data: { version: 1, threads, activeId: threads.some(t => t.id === parsed.activeId) ? parsed.activeId : threads[0].id }, error: false }
  } catch { return { data: emptyStore(), error: true } }
}
export function saveConversations(storage, key, data) {
  try { storage.setItem(key, JSON.stringify(data)); return true } catch { return false }
}
export function renameConversation(data, id, title) {
  const value = title.trim().slice(0, 100)
  if (!value) return data
  return { ...data, threads: data.threads.map(t => t.id === id ? { ...t, title: value, updatedAt: Date.now() } : t) }
}
export function deleteConversation(data, id) {
  const threads = data.threads.filter(t => t.id !== id)
  if (!threads.length) return emptyStore()
  return { ...data, threads, activeId: data.activeId === id ? [...threads].sort((a, b) => b.updatedAt - a.updatedAt)[0].id : data.activeId }
}
export function appendMessage(data, id, message) {
  return { ...data, threads: data.threads.map(t => t.id === id ? {
    ...t, title: t.title || (message.role === 'user' ? message.content.trim().slice(0, 55) : ''),
    updatedAt: Date.now(), messages: [...t.messages, { ...message, error: Boolean(message.error), id: newConversation().id }],
  } : t) }
}
export function shouldSendKey(event) {
  return event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229
}
