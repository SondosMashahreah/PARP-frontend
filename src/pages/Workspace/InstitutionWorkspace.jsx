import { useEffect, useMemo, useState } from 'react'
import { usePlatformData } from '../../features/platform/usePlatformData.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useAuth } from '../../features/auth/useAuth.js'
import { api } from '../../features/auth/authApi.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import './InstitutionWorkspace.css'

const normal = (value) => String(value || '').toLocaleLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim()
const matches = (value, search) => normal(value).includes(search)
const readable = (row, ar) => (ar ? row?.name_ar || row?.name_en : row?.name_en || row?.name_ar) || '—'

export default function InstitutionWorkspace() {
  const { data, error, reload } = usePlatformData('/statistics')
  const { isArabic } = useLanguage()
  const { user } = useAuth()
  const t = (ar, en) => isArabic ? ar : en
  const [directorate, setDirectorate] = useState('')
  const [school, setSchool] = useState('')
  const [search, setSearch] = useState('')
  const [nationalPublished, setNationalPublished] = useState(null)
  useEffect(() => {
    if (user?.role !== 'directorate_manager') return undefined
    let active = true
    api('/api/education/research/governorates')
      .then(value => { if (active && value.scope === 'national_published') setNationalPublished(value) })
      .catch(() => { if (active) setNationalPublished(null) })
    return () => { active = false }
  }, [user?.role])

  const directory = useMemo(() => {
    if (!data) return null
    const allDirs = data.directorates || []
    const allSchools = data.schools || []
    const clean = normal(search)
    const dirById = new Map(allDirs.map(d => [d.id, d]))
    const dirMatch = new Set(allDirs.filter(d => matches(d.name_ar, clean) || matches(d.name_en, clean)).map(d => d.id))
    const schools = allSchools.filter(s => {
      if (directorate && s.directorate_id !== directorate) return false
      if (school && s.id !== school) return false
      if (!clean) return true
      return matches(s.name_ar, clean) || matches(s.name_en, clean) || dirMatch.has(s.directorate_id)
    })
    const visibleIds = new Set(schools.map(s => s.id))
    const matchRecord = r => {
      if (directorate && r.directorate_id !== directorate) return false
      if (school && r.school_id !== school) return false
      if (clean && !visibleIds.has(r.school_id) && !dirMatch.has(r.directorate_id)) return false
      return true
    }
    const research = (data.research || []).filter(matchRecord)
    const participation = (data.participations || []).filter(matchRecord)
    const researcherIds = new Set([...research, ...participation].map(r => r.researcher_id).filter(Boolean))
    const totals = {
      research: research.filter(r => r.publication_type === 'research').length,
      practices: research.filter(r => r.publication_type === 'practice').length,
      published: research.filter(r => r.status === 'published').length,
      researchers: researcherIds.size,
      participations: participation.length,
      schools: schools.length,
    }
    return { allDirs, dirById, schools, research, participation, totals }
  }, [data, directorate, school, search])

  if (error) return <p role="alert">{error} <button type="button" onClick={reload}>{t('إعادة المحاولة', 'Retry')}</button></p>
  if (!directory) return <p role="status">{t('جارٍ تحميل إحصائيات المؤسسات…', 'Loading institution statistics…')}</p>
  const { allDirs, dirById, schools, research, participation, totals } = directory
  const studies = totals.research + totals.practices
  const percent = studies ? Math.round(100 * totals.published / studies) : 0
  const scope = user?.role === 'school_manager'
    ? t('نطاق مدرستك المعتمدة', 'Your approved school scope')
    : user?.role === 'directorate_manager'
      ? t('نطاق مديريتك المعتمدة', 'Your approved directorate scope')
      : t('البيانات المتاحة حسب الصلاحية', 'Data available to your role')

  return <section className="institution-workspace" aria-labelledby="institution-title">
    <header className="institution-workspace__heading">
      <span className="institution-workspace__eyebrow">PARP / {t('المؤسسات', 'Institutions')}</span>
      <h1 id="institution-title">{t('المديريات والمدارس والبحوث', 'Directorates, schools & research')}</h1>
      <p>{scope}. {t('ابحث باسم المدرسة أو المديرية، أو اختر مديرية لعرض مدارسها وإحصائياتها الفعلية.', 'Search schools or directorates by name, or select a directorate to explore its schools and verified statistics.')}</p>
    </header>

    {user?.role === 'directorate_manager' && nationalPublished && <aside className="institution-national-publications" aria-label={t('الأبحاث المنشورة على مستوى الوطن', 'National published research')}>
      <div><span>{t('الأبحاث المنشورة على مستوى الوطن', 'Published research nationwide')}</span><strong>{nationalPublished.total_research.toLocaleString(isArabic ? 'ar-PS' : 'en-GB')}</strong></div>
      <p>{t('هذا الرقم يشمل جميع المديريات. الإحصائيات والجدول أدناه يخصان مديريتك المعتمدة فقط، لذلك قد يظلان صفرًا إذا كان البحث تابعًا لمديرية أخرى.', 'This is the nationwide published count. The institution metrics and table below remain restricted to your approved directorate, and may be zero when the research belongs elsewhere.')}</p>
      <RouteLink to="/repository">{t('عرض الأبحاث في المستودع', 'Browse published research')}</RouteLink>
    </aside>}

    <div className="institution-filters" role="search" aria-label={t('البحث في المؤسسات', 'Search institutions')}>
      <label>{t('ابحث عن مدرسة أو مديرية', 'Search school or directorate')}
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('اكتب اسم المدرسة أو المديرية…', 'Type a school or directorate name…')} />
      </label>
      {user?.role !== 'school_manager' && <label>{t('المديرية', 'Directorate')}
        <select value={directorate} onChange={e => { setDirectorate(e.target.value); setSchool('') }}>
          <option value="">{t('كل المديريات المتاحة', 'All available directorates')}</option>
          {allDirs.map(d => <option key={d.id} value={d.id}>{readable(d, isArabic)}</option>)}
        </select>
      </label>}
      <label>{t('المدرسة', 'School')}
        <select value={school} onChange={e => setSchool(e.target.value)}>
          <option value="">{t('كل المدارس المتاحة', 'All available schools')}</option>
          {(data.schools || []).filter(s => !directorate || s.directorate_id === directorate).map(s => <option key={s.id} value={s.id}>{readable(s, isArabic)}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => { setDirectorate(''); setSchool(''); setSearch('') }}>{t('إعادة ضبط', 'Reset')}</button>
    </div>

    <div className="institution-overview" aria-live="polite">
      <div className="institution-donut" style={{ '--progress': `${percent}%` }}><strong>{percent}%</strong><span>{t('منشور', 'Published')}</span></div>
      <div className="institution-metrics">
        {[
          ['research', t('الأبحاث', 'Research')],
          ['practices', t('الممارسات', 'Practices')],
          ['researchers', t('الباحثون المشاركون', 'Researchers')],
          ['participations', t('مشاركات المؤتمر', 'Conference entries')],
          ['schools', t('المدارس', 'Schools')],
        ].map(([key, label]) => <article key={key}><strong>{totals[key].toLocaleString(isArabic ? 'ar-PS' : 'en-GB')}</strong><span>{label}</span></article>)}
      </div>
    </div>

    <section className="institution-directory" aria-labelledby="institution-directory-title">
      <div className="institution-directory__heading"><h2 id="institution-directory-title">{t('المدارس حسب نطاق البحث', 'Schools in this selection')}</h2><span>{schools.length.toLocaleString(isArabic ? 'ar-PS' : 'en-GB')}</span></div>
      <div className="institution-table"><table>
        <thead><tr><th scope="col">{t('المدرسة', 'School')}</th><th scope="col">{t('المديرية', 'Directorate')}</th><th scope="col">{t('أبحاث', 'Research')}</th><th scope="col">{t('ممارسات', 'Practices')}</th><th scope="col">{t('مؤتمر', 'Conference')}</th></tr></thead>
        <tbody>{schools.map(s => <tr key={s.id}>
          <td><strong>{readable(s, isArabic)}</strong></td>
          <td>{readable(dirById.get(s.directorate_id), isArabic)}</td>
          <td>{s.research || 0}</td><td>{s.practices || 0}</td><td>{s.participations || 0}</td>
        </tr>)}</tbody>
      </table></div>
      {!schools.length && <p className="institution-empty">{t('لا توجد مدارس مرتبطة بهذا النطاق في قاعدة البيانات حاليًا. المدارس غير المرتبطة بمديرية لا تُنسب إليها تلقائيًا.', 'No schools are linked to this scope in the database yet. Unassigned schools are not automatically attributed to a directorate.')}</p>}
    </section>

    <section className="institution-directory" aria-labelledby="institution-research-title">
      <div className="institution-directory__heading"><h2 id="institution-research-title">{t('الأبحاث والممارسات المقدّمة', 'Submitted research and practices')}</h2><span>{research.length}</span></div>
      <div className="institution-table"><table>
        <thead><tr>{[t('الباحث', 'Researcher'), t('البحث', 'Title'), t('الحالة', 'Status'), t('الملخص', 'Abstract')].map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead>
        <tbody>{research.map(r => <tr key={r.id}><td>{r.researcher_name || '—'}</td><td>{r.title}</td><td>{t(({ submitted: 'مقدّم', under_review: 'قيد التقييم', approved: 'مقبول', rejected: 'مرفوض', revision_requested: 'طلب تعديل', practice_suggested: 'مقترح كممارسة', published: 'منشور' })[r.status] || r.status, r.status)}</td><td><details><summary>{t('عرض الملخص', 'Read abstract')}</summary><p>{r.abstract || t('لا يوجد ملخص', 'No abstract')}</p></details></td></tr>)}</tbody>
      </table></div>
      {!research.length && <p className="institution-empty">{t('لا توجد أبحاث ضمن الاختيار الحالي.', 'No research in this selection.')}</p>}
    </section>

    <section className="institution-directory" aria-labelledby="institution-conference-title">
      <div className="institution-directory__heading"><h2 id="institution-conference-title">{t('مشاركات المؤتمر', 'Conference participations')}</h2><span>{participation.length}</span></div>
      {participation.map(p => <article className="institution-conference" key={p.id}><strong>{p.researcher} — {p.title}</strong><p>{p.abstract}</p>{p.url && <a href={p.url} target="_blank" rel="noreferrer">{t('عرض المشاركة', 'Open presentation')} ↗</a>}</article>)}
      {!participation.length && <p className="institution-empty">{t('لا توجد مشاركات ضمن الاختيار الحالي.', 'No conference entries in this selection.')}</p>}
    </section>
  </section>
}
