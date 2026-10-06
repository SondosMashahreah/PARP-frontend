import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { workflowApi } from '../../features/workflow/workflowApi.js'
import './PracticesPage.css'

export default function PracticesPage() {
  const { isArabic, dir } = useLanguage()
  const [query, setQuery] = useState('')
  const [field, setField] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const t = (ar, en) => isArabic ? ar : en

  useEffect(() => {
    let active = true
    workflowApi.practices()
      .then((payload) => { if (active) setItems(Array.isArray(payload) ? payload : []) })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const fields = useMemo(() => [...new Set(items.map((item) => item.research_field).filter(Boolean))].sort(), [items])
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesField = field === 'all' || item.research_field === field
      const haystack = `${item.title || ''} ${item.abstract || ''} ${item.problem || ''} ${item.intervention || ''} ${item.results || ''}`.toLowerCase()
      return matchesField && (!needle || haystack.includes(needle))
    })
  }, [field, items, query])

  return <section className="practices-page" dir={dir} aria-labelledby="practices-title">
    <header className="practices-page__hero">
      <span>{t('بنك المعرفة · من البحوث المنشورة', 'Knowledge bank · From published research')}</span>
      <h1 id="practices-title">{t('أفضل الممارسات', 'Best Practices')}</h1>
      <p>{t('هذه الصفحة تعرض فقط الممارسات التي أعادتها اللجنة العلمية كممارسة ثم اختار الباحث نشرها كممارسة داخل المنصة.', 'This page shows only items returned by the Scientific Committee as practices and then published by the researcher as practices.')}</p>
    </header>

    <div className="practices-page__filters">
      <label>{t('بحث', 'Search')}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('عنوان، مشكلة، تدخل…', 'Title, problem, intervention…')} /></label>
      <label>{t('المجال', 'Field')}<select value={field} onChange={(event) => setField(event.target.value)}><option value="all">{t('كل المجالات', 'All fields')}</option>{fields.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
    </div>

    {loading && <p role="status">{t('جارٍ تحميل الممارسات…', 'Loading practices…')}</p>}
    {error && <p className="practices-page__notice" role="alert">{error}</p>}
    {!loading && !error && <p role="status">{t(`${results.length} ممارسة منشورة`, `${results.length} published practices`)}</p>}

    <div className="practices-page__grid">
      {results.map((item) => <article key={item.id}>
        <span className="practices-page__tag">{item.research_field || t('ممارسة', 'Practice')}</span>
        <h2>{item.title}</h2>
        <p>{item.abstract || item.problem || t('لا يوجد ملخص متاح.', 'No summary is available.')}</p>
        <details><summary>{t('تفاصيل الممارسة والأثر', 'Practice and impact details')}</summary>
          {item.problem && <><h3>{t('المشكلة', 'Problem')}</h3><p>{item.problem}</p></>}
          {item.intervention && <><h3>{t('التدخل', 'Intervention')}</h3><p>{item.intervention}</p></>}
          {item.results && <><h3>{t('النتائج', 'Results')}</h3><p>{item.results}</p></>}
          {item.recommendations && <><h3>{t('التوصيات', 'Recommendations')}</h3><p>{item.recommendations}</p></>}
          {item.file?.url && <a href={item.file.url} target="_blank" rel="noreferrer">{t('فتح الملف المنشور', 'Open published file')} ↗</a>}
        </details>
      </article>)}
    </div>

    {!loading && !error && !results.length && <div className="practices-page__empty"><p>{items.length ? t('لا توجد نتائج مطابقة للفلاتر.', 'No practices match the current filters.') : t('لا توجد ممارسات منشورة بعد.', 'No practices have been published yet.')}</p>{items.length > 0 && <button onClick={() => { setQuery(''); setField('all') }}>{t('مسح الفلاتر', 'Clear filters')}</button>}</div>}
    <footer><h2>{t('من البحث إلى ممارسة قابلة للمشاركة', 'From research to a shareable practice')}</h2><p>{t('الممارسة لا تظهر هنا إلا بعد مرورها في مسار البحث وقرار اللجنة ثم موافقة الباحث على نشرها كممارسة.', 'A practice appears here only after the research workflow, committee decision, and researcher publication choice.')}</p><RouteLink to="/repository">{t('افتح المستودع الوطني', 'Open the National Repository')} ←</RouteLink></footer>
  </section>
}
