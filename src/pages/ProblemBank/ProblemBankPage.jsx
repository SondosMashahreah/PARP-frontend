import { useEffect, useState } from 'react'
import { api } from '../../features/auth/authApi.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import './ProblemBankPage.css'
export default function ProblemBankPage() {
  const { isArabic, dir } = useLanguage(),
    [items, setItems] = useState(null),
    [error, setError] = useState(''),
    [q, setQ] = useState('')
  useEffect(() => {
    let active = true
    api('/api/workflow/problem-bank')
      .then((r) => {
        if (active) setItems(r)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [])
  return (
    <section className="problem-bank" dir={dir}>
      <h1>{isArabic ? 'بنك المشكلات' : 'Problem bank'}</h1>
      <label>
        {isArabic ? 'بحث في المشكلات' : 'Search problems'}
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      {!items && !error && (
        <p role="status">{isArabic ? 'جارٍ التحميل…' : 'Loading…'}</p>
      )}
      {items
        ?.filter((p) =>
          `${p.text} ${p.research_field}`
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .map((p) => (
          <article key={p.id}>
            <h2>{p.research_field}</h2>
            <p>{p.text}</p>
          </article>
        ))}
      {items?.length === 0 && (
        <p>
          {isArabic ? 'لا توجد مشكلات مسجلة بعد.' : 'No problems recorded yet.'}
        </p>
      )}
    </section>
  )
}
