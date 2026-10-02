import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { filterPractices, practices } from '../../features/practices/practices.js'
import './PracticesPage.css'

export default function PracticesPage() {
  const { isArabic, dir } = useLanguage()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const t = (ar, en) => isArabic ? ar : en
  const categories = [['all', t('جميع المجالات', 'All areas')], ['assessment', t('التقويم', 'Assessment')], ['participation', t('المشاركة الصفية', 'Participation')], ['learning', t('التعلّم', 'Learning')]]
  const results = filterPractices(practices, query, category)
  return <section className="practices-page" dir={dir} aria-labelledby="practices-title">
    <header className="practices-page__hero">
      <span>{t('بنك المعرفة · من التأمل إلى التطبيق', 'Knowledge bank · From reflection to practice')}</span>
      <h1 id="practices-title">{t('أفضل الممارسات', 'Best Practices')}</h1>
      <p>{t('استكشف طرقًا للتطبيق في سياقك التعليمي، وحدّد أدواتك، ثم تأمّل الأثر وطوّر ممارستك.', 'Explore approaches for your teaching context, choose your tools, reflect on the impact and refine your practice.')}</p>
      <p className="practices-page__notice">{t('نماذج توضيحية للواجهة؛ ليست ممارسات منشورة أو معتمدة، ولا تتضمن نتائج بحثية مثبتة.', 'Illustrative interface examples, not published or approved practices. No validated research outcomes are claimed.')}</p>
    </header>
    <div className="practices-page__filters">
      <label>{t('ابحث بالعربي أو الإنجليزي', 'Search in Arabic or English')}<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('عنوان، أداة، أو طريقة تطبيق…', 'Title, tool, or approach…')} /></label>
      <label>{t('المجال', 'Area')}<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </div>
    <p role="status">{t(`${results.length} نماذج توضيحية`, `${results.length} illustrative examples`)}</p>
    <div className="practices-page__grid">
      {results.map((item) => { const content = item[isArabic ? 'ar' : 'en']; return <article key={item.id}>
        <span className="practices-page__tag">{categories.find(([id]) => id === item.category)[1]}</span>
        <h2>{content.title}</h2><p>{content.intro}</p>
        <details><summary>{t('خطوات التطبيق وقياس الأثر', 'Application steps and impact')}</summary>
          <ol>{content.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <h3>{t('الأدوات المقترحة', 'Suggested tools')}</h3><p>{content.tools}</p>
          <h3>{t('كيف تتأمّل الأثر؟', 'How to reflect on impact')}</h3><p>{content.impact}</p>
        </details>
      </article> })}
    </div>
    {!results.length && <div className="practices-page__empty"><p>{t('لا توجد نماذج مطابقة. جرّب كلمة أو مجالًا آخر.', 'No matching examples. Try another search or area.')}</p><button onClick={() => { setQuery(''); setCategory('all') }}>{t('مسح الفلاتر', 'Clear filters')}</button></div>}
    <footer><h2>{t('حوّل الممارسة إلى سؤال بحثي', 'Turn practice into a research question')}</h2><p>{t('وثّق المشكلة والتدخل وأدوات جمع البيانات، واحمِ خصوصية الطلبة عند توثيق التطبيق.', 'Document the problem, intervention and data collection tools, and protect learners’ privacy.')}</p><RouteLink to="/guide">{t('اقرأ الدليل الفلسطيني', 'Read the Palestinian Guide')} ←</RouteLink><RouteLink to="/template">{t('افتح قالب البحث', 'Open the research template')} ←</RouteLink></footer>
  </section>
}
