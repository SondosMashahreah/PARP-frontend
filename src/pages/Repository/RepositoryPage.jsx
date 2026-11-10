import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { workflowApi } from '../../features/workflow/workflowApi.js'
import './RepositoryPage.css'

export default function RepositoryPage() {
  const { isArabic, dir } = useLanguage()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [year, setYear] = useState('')
  const [field, setField] = useState('')
  const [expanded, setExpanded] = useState([])
  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
  const t = (ar, en) => isArabic ? ar : en
  useEffect(() => {
    let active = true
    workflowApi.repository().then((value) => { if (active) setItems(value) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])
  const years = useMemo(() => [...new Set((items || []).map((r) => r.academic_year).filter(Boolean))].sort().reverse(), [items])
  const fields = useMemo(() => [...new Set((items || []).map((r) => r.research_field).filter(Boolean))].sort(), [items])
  const filtered = useMemo(() => (items || []).filter((r) => {
    if (year && r.academic_year !== year) return false
    if (field && r.research_field !== field) return false
    const authors = (r.researchers || []).flatMap((person) => [person.full_name, person.school, person.directorate])
    const haystack = [r.title, r.title_en, r.abstract, r.research_field, r.subject_area,
      r.academic_year, r.researcher_name, ...(r.keywords || []), ...authors].join(' ').toLocaleLowerCase()
    return haystack.includes(q.trim().toLocaleLowerCase())
  }), [items, year, field, q])
  return <section className="repository-catalog" dir={dir}>
    <header className="repository-catalog__hero">
      <span className="repository-catalog__eyebrow">PARP / NATIONAL REPOSITORY</span>
      <h1>{t('المستودع الوطني للأبحاث الإجرائية', 'National Action Research Repository')}</h1>
      <p>{t('ابحث في الأبحاث المنشورة والباحثين والمدارس والمديريات.', 'Discover published studies, researchers, schools and directorates.')}</p>
    </header>
    <div className="repository-catalog__filters">
      <label>{t('بحث بالعربي أو الإنجليزي', 'Search in Arabic or English')}
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('كلمات البحث…', 'Search keywords…')} />
      </label>
      <label>{t('العام الدراسي', 'Academic year')}
        <select value={year} onChange={(e) => setYear(e.target.value)}><option value="">{t('جميع الأعوام', 'All years')}</option>{years.map((v) => <option key={v} value={v}>{v}</option>)}</select>
      </label>
      <label>{t('المجال', 'Research field')}
        <select value={field} onChange={(e) => setField(e.target.value)}><option value="">{t('جميع المجالات', 'All fields')}</option>{fields.map((v) => <option key={v} value={v}>{v}</option>)}</select>
      </label>
    </div>
    {error && <p role="alert">{error}</p>}
    {!items && !error && <p role="status">{t('جارٍ تحميل الأبحاث…', 'Loading research…')}</p>}
    {items && <p className="repository-catalog__count" role="status">{filtered.length} {t('بحث منشور', 'published studies')}</p>}
    <div className="repository-catalog__list">
      {filtered.map((r) => <article className="repository-catalog__card" key={r.id}>
        <div className="repository-catalog__card-top">
          <span className="repository-catalog__tag">{r.research_field || t('بحث إجرائي', 'Action research')}</span>
          {r.standard_version && <span className="repository-catalog__tag repository-catalog__tag--outline">{r.standard_version}</span>}
          {r.academic_year && <span className="repository-catalog__tag repository-catalog__tag--outline">{r.academic_year}</span>}
        </div>
        <h2>{isArabic ? r.title : (r.title_en || r.title)}</h2>
        <div className="repository-catalog__actions">
          <button type="button" className="repository-catalog__action" aria-expanded={expanded.includes(r.id)} aria-controls={`research-abstract-${r.id}`} onClick={() => setExpanded(current => current.includes(r.id) ? current.filter(id => id !== r.id) : [...current, r.id])}>
            {expanded.includes(r.id) ? t('إخفاء الملخص', 'Hide abstract') : t('عرض الملخص', 'View abstract')}
          </button>
          <a className="repository-catalog__action repository-catalog__action--primary" href={`${apiOrigin}/api/workflow/repository/${encodeURIComponent(r.id)}/file`} target="_blank" rel="noopener noreferrer" aria-label={`${t('عرض البحث كاملًا', 'Open full research')}: ${r.title}`}>
            {t('عرض البحث كاملًا', 'Open full research')}
          </a>
        </div>
        {expanded.includes(r.id) && <p id={`research-abstract-${r.id}`} className="repository-catalog__abstract">{r.abstract || t('لا يوجد ملخص لهذا السجل القديم.', 'No abstract available for this legacy record.')}</p>}
        <div className="repository-catalog__authors"><strong>{t('الباحثون', 'Researchers')}</strong>
          {r.researchers?.length ? <ul>{r.researchers.map((person, i) => <li key={i}>
            <span>{person.full_name}</span><small>{[person.school, person.directorate].filter(Boolean).join(' · ')}</small>
          </li>)}</ul> : <p>{r.researcher_name || '—'}</p>}
        </div>
        {(r.subject_area || r.target_grades?.length) && <div className="repository-catalog__meta">
          {r.subject_area && <span>{t('المبحث:', 'Subject:')} {r.subject_area}</span>}
          {r.target_grades?.length > 0 && <span>{t('الصفوف:', 'Grades:')} {r.target_grades.join(', ')}</span>}
        </div>}
        <footer>{t('الملخص والملف الكامل متاحان للأبحاث المنشورة فقط، بعد اعتمادها ونشرها.', 'Abstract and full file are available only for approved, published research.')}</footer>
      </article>)}
    </div>
    {items && !filtered.length && <div className="repository-catalog__empty">{t('لا توجد أبحاث مطابقة.', 'No matching research.')}</div>}
  </section>
}
