import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useAuth } from '../../features/auth/useAuth.js'
import { api } from '../../features/auth/authApi.js'
import Answer from '../../features/assistant/Answer.jsx'
import { storageKey, loadConversations, saveConversations, newConversation, renameConversation, deleteConversation, appendMessage, shouldSendKey } from '../../features/assistant/chatStorage.js'
import { cleanAnswer } from '../../features/assistant/answerFormat.js'
import './AssistantPage.css'

function Icon({ name }) {
  const paths = { plus: 'M12 5v14M5 12h14', menu: 'M4 6h16M4 12h16M4 18h16', edit: 'm15 5 4 4M4 20l4-1L20 7l-4-4L4 15v5Z', trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7', send: 'm5 12 7-7 7 7M12 5v15', close: 'm6 6 12 12M18 6 6 18' }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>
}
function Typing({ label }) {
  return <div className="assistant-typing" role="status" aria-label={label}><i/><i/><i/></div>
}
function AssistantChat({ isArabic, dir, user }) {
  const t = (ar, en) => isArabic ? ar : en
  const key = storageKey(user)
  const [initial] = useState(() => {
    try { return loadConversations(window.localStorage, key) } catch { return loadConversations({ getItem() { throw new Error('Unavailable') } }, key) }
  })
  const [store, setStore] = useState(initial.data)
  const current = useRef(initial.data)
  const [input, setInput] = useState('')
  const drafts = useRef({})
  const [busy, setBusy] = useState(false)
  const request = useRef(null)
  const [menu, setMenu] = useState(false)
  const [renaming, setRenaming] = useState(null)
  const [title, setTitle] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [saveError, setSaveError] = useState(initial.error)
  const transcript = useRef(null)
  const composer = useRef(null)
  const stickToBottom = useRef(true)
  const active = store.threads.find(thread => thread.id === store.activeId) || store.threads[0]
  const sorted = [...store.threads].sort((a, b) => b.updatedAt - a.updatedAt)

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    const node = transcript.current
    if (node && stickToBottom.current) node.scrollTop = node.scrollHeight
  }, [active.id, active.messages.length, busy])
  function commit(change) {
    const next = typeof change === 'function' ? change(current.current) : change
    current.current = next
    setStore(next)
    try { setSaveError(!saveConversations(window.localStorage, key, next)) } catch { setSaveError(true) }
  }
  function cancelRequest() { request.current?.abort(); request.current = null; setBusy(false) }
  function select(id) {
    if (id === current.current.activeId) { setMenu(false); return }
    cancelRequest(); drafts.current[active.id] = input
    commit(state => ({ ...state, activeId: id }))
    setInput(drafts.current[id] || ''); setMenu(false); setRenaming(null); setDeleting(null); stickToBottom.current = true
    composer.current?.focus()
  }
  function create() {
    cancelRequest(); drafts.current[active.id] = input
    const thread = newConversation()
    commit(state => ({ ...state, activeId: thread.id, threads: [thread, ...state.threads] }))
    setInput(''); setMenu(false); setRenaming(null); setDeleting(null); stickToBottom.current = true
    composer.current?.focus()
  }
  function remove(id) {
    if (current.current.activeId === id) cancelRequest()
    const next = deleteConversation(current.current, id)
    delete drafts.current[id]
    if (current.current.activeId === id) { setInput(drafts.current[next.activeId] || ''); stickToBottom.current = true }
    commit(next); setDeleting(null)
  }
  function rename(event, id) {
    event.preventDefault()
    if (!title.trim()) return
    commit(state => renameConversation(state, id, title)); setRenaming(null)
  }
  async function send(event) {
    event?.preventDefault()
    const text = input.trim()
    if (!text || request.current) return
    const id = current.current.activeId
    const thread = current.current.threads.find(c => c.id === id)
    const history = thread.messages.filter(m => !m.error).slice(-8).map(m => ({ role: m.role, content: m.content.slice(0, 12000) }))
    const controller = new AbortController(); request.current = controller
    stickToBottom.current = true
    commit(state => appendMessage(state, id, { role: 'user', content: text }))
    setInput(''); drafts.current[id] = ''; setBusy(true)
    try {
      const data = await api('/api/assistant/chat', { method: 'POST', signal: controller.signal, body: JSON.stringify({ message: text, history, mode: 'platform', allow_external: true }) })
      if (request.current === controller && !controller.signal.aborted) commit(state => appendMessage(state, id, { role: 'assistant', content: cleanAnswer(data.answer) }))
    } catch (error) {
      if (request.current === controller && error.name !== 'AbortError') commit(state => appendMessage(state, id, { role: 'assistant', error: true, content: t('تعذر إرسال الرسالة. حاول مرة أخرى.', 'Unable to send the message. Please try again.') }))
    } finally {
      if (request.current === controller) { request.current = null; setBusy(false); composer.current?.focus() }
    }
  }
  function onKeyDown(event) {
    if (shouldSendKey({ key: event.key, shiftKey: event.shiftKey, keyCode: event.keyCode, isComposing: event.nativeEvent.isComposing })) { event.preventDefault(); send() }
  }
  return <section className={`assistant-page ${menu ? 'assistant-page--menu-open' : ''}`} dir={dir} aria-label={t('المساعد الذكي', 'AI Assistant')}>
    {menu && <button className="assistant-menu-shade" aria-label={t('إغلاق المحادثات', 'Close conversations')} onClick={() => setMenu(false)}/>}
    <aside className="assistant-history" aria-label={t('المحادثات السابقة', 'Previous conversations')} onKeyDown={e => { if (e.key === 'Escape') setMenu(false) }}>
      <div className="assistant-history__top"><strong>{t('المحادثات', 'Conversations')}</strong><button className="assistant-icon assistant-mobile" onClick={() => setMenu(false)} aria-label={t('إغلاق', 'Close')}><Icon name="close"/></button></div>
      <button className="assistant-new" onClick={create}><Icon name="plus"/>{t('محادثة جديدة', 'New conversation')}</button>
      <div className="assistant-history__list">{sorted.map(thread => <div className={`assistant-thread ${active.id === thread.id ? 'is-active' : ''}`} key={thread.id}>
        {renaming === thread.id ? <form className="assistant-rename" onSubmit={e => rename(e, thread.id)}><input autoFocus value={title} onChange={e => setTitle(e.target.value)} maxLength={100} aria-label={t('اسم المحادثة', 'Conversation name')} onKeyDown={e => { if (e.key === 'Escape') setRenaming(null) }}/><div><button type="submit" disabled={!title.trim()}>{t('حفظ', 'Save')}</button><button type="button" onClick={() => setRenaming(null)}>{t('إلغاء', 'Cancel')}</button></div></form> : <><button className="assistant-thread__select" onClick={() => select(thread.id)} aria-current={active.id === thread.id ? 'true' : undefined} title={thread.title || t('محادثة جديدة', 'New conversation')}><span>{thread.title || t('محادثة جديدة', 'New conversation')}</span></button><div className="assistant-thread__actions"><button className="assistant-icon" onClick={() => { setRenaming(thread.id); setTitle(thread.title); setDeleting(null) }} aria-label={`${t('إعادة تسمية', 'Rename')}: ${thread.title}`}><Icon name="edit"/></button><button className="assistant-icon" onClick={() => setDeleting(thread.id)} aria-label={`${t('حذف', 'Delete')}: ${thread.title}`}><Icon name="trash"/></button></div></>}
        {deleting === thread.id && <div className="assistant-delete"><span>{t('حذف هذه المحادثة؟', 'Delete this conversation?')}</span><button onClick={() => remove(thread.id)}>{t('حذف', 'Delete')}</button><button onClick={() => setDeleting(null)}>{t('إلغاء', 'Cancel')}</button></div>}
      </div>)}</div>
    </aside>
    <div className="assistant-chat">
      <header className="assistant-chat__header"><button className="assistant-icon assistant-mobile" onClick={() => setMenu(true)} aria-label={t('عرض المحادثات', 'Show conversations')} aria-expanded={menu}><Icon name="menu"/></button><h1>{t('المساعد الذكي', 'AI Assistant')}</h1><button className="assistant-icon" onClick={create} aria-label={t('محادثة جديدة', 'New conversation')}><Icon name="plus"/></button></header>
      <div className="assistant-chat__messages" ref={transcript} role="log" aria-live="polite" aria-relevant="additions" onScroll={e => { const n = e.currentTarget; stickToBottom.current = n.scrollHeight - n.scrollTop - n.clientHeight < 80 }}>
        {!active.messages.length && <div className="assistant-welcome"><span aria-hidden="true">✦</span><h2>{t('مرحباً، أنا مساعد PARP', 'Hello, I’m the PARP Assistant')}</h2><p>{t('بقدر أساعدك في المنصة وكتابة بحثك وتطويره. كيف بقدر أساعدك؟', 'I can help you explore PARP, write your research and develop it. How can I help?')}</p></div>}
        {active.messages.map(message => <article key={message.id} className={`assistant-message assistant-message--${message.role}`} aria-label={message.role === 'user' ? t('أنت', 'You') : t('المساعد', 'Assistant')}>{message.role === 'assistant' ? <Answer text={message.content}/> : <p dir="auto">{message.content}</p>}</article>)}
        {busy && <Typing label={t('جارٍ تجهيز الإجابة', 'Preparing the answer')}/>}
      </div>
      <div className="assistant-composer">
        {saveError && <p className="assistant-save-error" role="alert">{t('تعذر حفظ المحادثة في هذا المتصفح. لا تغلق الصفحة قبل حفظ النص المهم لديك.', 'This browser could not save the conversation. Keep this page open until you have copied any important text.')}</p>}
        <form className="assistant-chat__form" onSubmit={send}><textarea ref={composer} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} aria-label={t('رسالتك', 'Your message')} placeholder={t('اكتب رسالتك…', 'Write your message…')} rows={2} maxLength={16000}/><button type="submit" disabled={busy || !input.trim()} aria-label={t('إرسال', 'Send')}><Icon name="send"/></button></form>
      </div>
    </div>
  </section>
}
export default function AssistantPage() {
  const { isArabic, dir } = useLanguage()
  const { user, loading } = useAuth()
  if (loading) return <Typing label={isArabic ? 'جارٍ التحميل' : 'Loading'}/>
  return <AssistantChat key={storageKey(user)} user={user} isArabic={isArabic} dir={dir}/>
}
