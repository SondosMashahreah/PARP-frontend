import { useEffect, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { workflowApi } from '../../features/workflow/workflowApi.js'
import './RepositoryPage.css'
export default function RepositoryPage() {
  const { isArabic, dir } = useLanguage(),
    [items, setItems] = useState(null),
    [error, setError] = useState(''),
    [q, setQ] = useState('')
  useEffect(() => {
    let active = true
    workflowApi
      .repository()
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
    <section className="repository-catalog" dir={dir}>
      <h1>
        {isArabic ? 'الأبحاث الإجرائية المنشورة' : 'Published action research'}
      </h1>
      <label>
        {isArabic ? 'ابحث بالعربي أو الإنجليزي' : 'Search in Arabic or English'}
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      {!items && !error && (
        <p role="status">{isArabic ? 'جارٍ التحميل…' : 'Loading…'}</p>
      )}
      {items
        ?.filter((r) =>
          `${r.title} ${r.title_en || ''} ${r.abstract || ''}`
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .map((r) => (
          <article key={r.id}>
            <small>
              {r.research_field} · {r.researcher_name}
            </small>
            <h2>{isArabic ? r.title : r.title_en || r.title}</h2>
            <p>
              {r.abstract ||
                (isArabic
                  ? 'لا يوجد ملخص لهذا السجل القديم'
                  : 'No abstract available for this legacy record')}
            </p>
            <button disabled>
              {isArabic
                ? 'شراء البحث الكامل — غير مفعّل حالياً'
                : 'Purchase full research — currently unavailable'}
            </button>
            <p>
              <small>
                {isArabic
                  ? 'الملخص متاح مجاناً. سيتم تفعيل الوصول المدفوع عند اعتماد بوابة الدفع.'
                  : 'The abstract is free. Paid access will be enabled after a payment provider is configured.'}
              </small>
            </p>
          </article>
        ))}
      {items?.length === 0 && (
        <p>
          {isArabic
            ? 'لا توجد أبحاث منشورة بعد.'
            : 'No published research yet.'}
        </p>
      )}
    </section>
  )
}
