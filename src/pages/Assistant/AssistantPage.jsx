import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import './AssistantPage.css'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export default function AssistantPage() {
  const { isArabic, dir } = useLanguage()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: isArabic
        ? 'مرحبًا، أنا مساعد PARP. اسألني عن المنصة أو البحث الإجرائي.'
        : 'Hello, I am the PARP Assistant. Ask me about PARP or action research.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage(event) {
    event.preventDefault()
    const message = input.trim()
    if (!message || loading) return

    setMessages((current) => [...current, { role: 'user', content: message }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) throw new Error('Assistant request failed')

      const data = await response.json()
      setMessages((current) => [...current, { role: 'assistant', content: data.answer }])
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: isArabic
            ? 'تعذر الاتصال بالمساعد حاليًا. حاول مرة أخرى.'
            : 'The assistant is unavailable right now. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="assistant-page" dir={dir} id="main-content">
      <section className="assistant-chat" aria-labelledby="assistant-title">
        <header className="assistant-chat__header">
          <span>PARP AI</span>
          <h1 id="assistant-title">{isArabic ? 'المساعد الذكي' : 'AI Assistant'}</h1>
          <p>
            {isArabic
              ? 'مخصص لمنصة PARP والبحث الإجرائي فقط.'
              : 'Dedicated to PARP and action research only.'}
          </p>
        </header>

        <div className="assistant-chat__messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              className={`assistant-message assistant-message--${message.role}`}
              key={`${message.role}-${index}`}
            >
              {message.content}
            </div>
          ))}
          {loading && (
            <div className="assistant-message assistant-message--assistant">
              {isArabic ? 'جاري تجهيز الإجابة...' : 'Preparing the answer...'}
            </div>
          )}
        </div>

        <form className="assistant-chat__form" onSubmit={sendMessage}>
          <input
            aria-label={isArabic ? 'اكتب سؤالك' : 'Type your question'}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={isArabic ? 'اكتب سؤالك عن PARP...' : 'Ask about PARP...'}
            maxLength={4000}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {isArabic ? 'إرسال' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  )
}
