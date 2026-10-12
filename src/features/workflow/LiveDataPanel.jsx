import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useAuth } from '../auth/useAuth.js'
import { roleLabel } from '../auth/roles.js'
import { workflowApi } from './workflowApi.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import './LiveDataPanel.css'

const LIVE_PATHS = new Set(['/repository', '/dashboard', '/institutions', '/observatory', '/excellence', '/conference'])

const STATUS_AR = {
  submitted: 'مرفوع',
  under_review: 'قيد التحكيم',
  revision_requested: 'بحاجة لتعديل',
  approved: 'مقبول للنشر',
  rejected: 'غير مقبول',
  practice_suggested: 'مقترح كممارسة',
  published: 'منشور',
}

function countBy(items, key, value) {
  return (items || []).filter((item) => item?.[key] === value).length
}

function MetricGrid({ items }) {
  return <div className="live-data__metrics">{items.map(([label, value]) => <article key={label}><strong>{value ?? 0}</strong><span>{label}</span></article>)}</div>
}

function Empty({ children }) {
  return <p className="live-data__empty">{children}</p>
}

function ResearchList({ items, isArabic }) {
  if (!items.length) return <Empty>{isArabic ? 'لا توجد بحوث منشورة بعد.' : 'No published research yet.'}</Empty>
  return <div className="live-data__list">{items.map((item) => <article className="live-data__record" key={item.id}>
    <div className="live-data__record-head">
      <div><small>#{item.id}</small><h3>{item.title}</h3></div>
      <span>{item.research_field || '—'}</span>
    </div>
    <p>{item.abstract || item.problem || (isArabic ? 'لا يوجد ملخص متاح.' : 'No abstract is available.')}</p>
    <div className="live-data__meta">
      <span>{item.researcher_name || '—'}</span>
      <span>{item.school_id || '—'}</span>
      <span>{item.directorate_id || '—'}</span>
    </div>
    {item.file?.url && <a href={item.file.url} target="_blank" rel="noreferrer">{isArabic ? 'فتح ملف البحث' : 'Open research file'} ↗</a>}
  </article>)}</div>
}

export default function LiveDataPanel({ pathname }) {
  const { isArabic } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [field, setField] = useState('all')

  useEffect(() => {
    if (!LIVE_PATHS.has(pathname)) {
      setData(null)
      setError('')
      return undefined
    }
    let active = true
    setLoading(true)
    setError('')

    async function load() {
      try {
        let payload = null
        if (pathname === '/repository' || pathname === '/excellence') {
          payload = { repository: await workflowApi.repository() }
        } else if (pathname === '/observatory') {
          if (!isAuthenticated) return
          const [recommendations, problems] = await Promise.all([workflowApi.recommendations(), workflowApi.problems()])
          payload = { recommendations, problems }
        } else if (pathname === '/institutions') {
          if (!isAuthenticated) return
          const [workspace, catalog] = await Promise.all([workflowApi.workspace(), workflowApi.educationCatalog()])
          payload = { workspace, catalog }
        } else if (pathname === '/dashboard' || pathname === '/conference') {
          if (!isAuthenticated) return
          payload = { workspace: await workflowApi.workspace() }
        }
        if (active) setData(payload)
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [isAuthenticated, pathname, user?.id])

  const repository = data?.repository || []
  const fields = useMemo(() => [...new Set(repository.map((item) => item.research_field).filter(Boolean))].sort(), [repository])
  const filteredResearch = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return repository.filter((item) => {
      const matchesField = field === 'all' || item.research_field === field
      const haystack = `${item.title || ''} ${item.researcher_name || ''} ${item.abstract || ''} ${item.problem || ''} ${(item.keywords || []).join(' ')}`.toLowerCase()
      return matchesField && (!needle || haystack.includes(needle))
    })
  }, [field, query, repository])

  if (!LIVE_PATHS.has(pathname)) return null
  if (loading) return <section className="live-data" aria-live="polite"><p>{isArabic ? 'جارٍ تحميل بيانات المنصة…' : 'Loading platform data…'}</p></section>
  if (error) return <section className="live-data live-data--error" role="alert"><p>{error}</p></section>
  if (!data) return null

  if (pathname === '/repository') {
    return <section className="live-data" aria-labelledby="live-repository-title">
      <div className="live-data__heading"><div><span>PARP DATA</span><h2 id="live-repository-title">{isArabic ? 'البحوث المنشورة في قاعدة البيانات' : 'Published research from the database'}</h2></div><strong>{repository.length}</strong></div>
      <div className="live-data__filters">
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? 'ابحث بالعنوان أو الباحث أو المشكلة…' : 'Search title, researcher, or problem…'} aria-label={isArabic ? 'بحث في البحوث المنشورة' : 'Search published research'} />
        <select value={field} onChange={(event) => setField(event.target.value)} aria-label={isArabic ? 'تصفية حسب المجال' : 'Filter by field'}>
          <option value="all">{isArabic ? 'كل المجالات' : 'All fields'}</option>
          {fields.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </div>
      <p className="live-data__count">{isArabic ? `${filteredResearch.length} بحث منشور` : `${filteredResearch.length} published research items`}</p>
      <ResearchList items={filteredResearch} isArabic={isArabic} />
    </section>
  }

  if (pathname === '/dashboard') {
    const workspace = data.workspace || {}
    const submissions = workspace.submissions || []
    const role = workspace.role
    let metrics = []
    if (role === 'decision_maker') {
      const recs = workspace.recommendations || []
      metrics = [
        [isArabic ? 'التوصيات' : 'Recommendations', recs.length],
        [isArabic ? 'جديدة' : 'New', countBy(recs, 'status', 'new')],
        [isArabic ? 'تم تبنيها' : 'Adopted', countBy(recs, 'status', 'adopted')],
        [isArabic ? 'المشكلات' : 'Problems', (workspace.problems || []).length],
      ]
    } else {
      metrics = [
        [isArabic ? 'البحوث ضمن نطاقك' : 'Research in your scope', submissions.length],
        [isArabic ? 'قيد التحكيم' : 'Under review', countBy(submissions, 'status', 'under_review')],
        [isArabic ? 'بحاجة لتعديل' : 'Needs revision', countBy(submissions, 'status', 'revision_requested')],
        [isArabic ? 'منشور' : 'Published', countBy(submissions, 'status', 'published')],
      ]
    }
    return <section className="live-data" aria-labelledby="live-dashboard-title">
      <div className="live-data__heading"><div><span>{isArabic ? 'بيانات فعلية حسب الصلاحية' : 'Live role-scoped data'}</span><h2 id="live-dashboard-title">{isArabic ? 'مؤشرات مساحة العمل' : 'Workspace indicators'}</h2><p>{roleLabel(role, isArabic)}</p></div></div>
      <MetricGrid items={metrics} />
      <RouteLink className="live-data__action" to="/workspace">{isArabic ? 'فتح مساحة العمل والتفاصيل' : 'Open workspace details'} {isArabic ? '←' : '→'}</RouteLink>
    </section>
  }

  if (pathname === '/institutions') {
    const workspace = data.workspace || {}
    const catalog = data.catalog || {}
    const affiliation = workspace.affiliation
    return <section className="live-data" aria-labelledby="live-institutions-title">
      <div className="live-data__heading"><div><span>{isArabic ? 'بيانات التعليم المرتبطة بالمنصة' : 'Platform education data'}</span><h2 id="live-institutions-title">{isArabic ? 'المدارس والمديريات الحالية' : 'Current schools and directorates'}</h2></div></div>
      <MetricGrid items={[
        [isArabic ? 'المحافظات' : 'Governorates', catalog.governorates?.length || 0],
        [isArabic ? 'المديريات' : 'Directorates', catalog.directorates?.length || 0],
        [isArabic ? 'المدارس' : 'Schools', catalog.total_schools || 0],
        [isArabic ? 'بحوث ضمن نطاق الحساب' : 'Research in account scope', workspace.submissions?.length || 0],
      ]} />
      <div className="live-data__two">
        <article className="live-data__info"><h3>{isArabic ? 'ارتباط الحساب' : 'Account affiliation'}</h3>{affiliation ? <dl><dt>{isArabic ? 'الحالة' : 'Status'}</dt><dd>{affiliation.approval_status}</dd><dt>{isArabic ? 'المديرية' : 'Directorate'}</dt><dd>{affiliation.directorate_id || '—'}</dd><dt>{isArabic ? 'المدرسة' : 'School'}</dt><dd>{affiliation.school_id || '—'}</dd></dl> : <Empty>{isArabic ? 'لا يوجد ارتباط مؤسسي لهذا الحساب.' : 'This account has no institutional affiliation.'}</Empty>}</article>
        <article className="live-data__info"><h3>{isArabic ? 'طلبات الاعتماد' : 'Affiliation approvals'}</h3><strong>{workspace.affiliation_requests?.length || 0}</strong><p>{isArabic ? 'طلبات ظاهرة فقط ضمن نطاق صلاحية الحساب.' : 'Only requests inside this account’s authorized scope are shown.'}</p></article>
      </div>
      <RouteLink className="live-data__action" to="/map">{isArabic ? 'فتح خريطة المدارس والمديريات' : 'Open schools & directorates map'} {isArabic ? '←' : '→'}</RouteLink>
    </section>
  }

  if (pathname === '/observatory') {
    const recommendations = data.recommendations || []
    const problems = data.problems || []
    return <section className="live-data" aria-labelledby="live-observatory-title">
      <div className="live-data__heading"><div><span>{isArabic ? 'من البحوث المنشورة' : 'From published research'}</span><h2 id="live-observatory-title">{isArabic ? 'بيانات المرصد الوطني' : 'National Observatory data'}</h2></div></div>
      <MetricGrid items={[
        [isArabic ? 'التوصيات' : 'Recommendations', recommendations.length],
        [isArabic ? 'جديدة' : 'New', countBy(recommendations, 'status', 'new')],
        [isArabic ? 'تم تبنيها' : 'Adopted', countBy(recommendations, 'status', 'adopted')],
        [isArabic ? 'المشكلات' : 'Problems', problems.length],
      ]} />
      <div className="live-data__two">
        <div><h3>{isArabic ? 'أحدث التوصيات' : 'Latest recommendations'}</h3>{recommendations.length ? recommendations.slice(0, 8).map((item) => <article className="live-data__mini" key={item.id}><strong>{item.research_field || '—'}</strong><p>{item.text}</p><small>{item.status}</small></article>) : <Empty>{isArabic ? 'لا توجد توصيات منشورة بعد.' : 'No recommendations have been published yet.'}</Empty>}</div>
        <div><h3>{isArabic ? 'أحدث المشكلات' : 'Latest problems'}</h3>{problems.length ? problems.slice(0, 8).map((item) => <article className="live-data__mini" key={item.id}><strong>{item.research_field || '—'}</strong><p>{item.text}</p><small>{item.directorate_id || '—'}</small></article>) : <Empty>{isArabic ? 'لا توجد مشكلات مستخرجة من بحوث منشورة بعد.' : 'No problems have been extracted from published research yet.'}</Empty>}</div>
      </div>
    </section>
  }

  if (pathname === '/excellence') {
    return <section className="live-data" aria-labelledby="live-excellence-title">
      <div className="live-data__heading"><div><span>{isArabic ? 'بدون بيانات وهمية' : 'No fabricated awards'}</span><h2 id="live-excellence-title">{isArabic ? 'حالة بيانات قاعة التميز' : 'Hall of Excellence data status'}</h2></div><strong>{repository.length}</strong></div>
      <p>{isArabic ? 'المستودع يحتوي على البحوث المنشورة الفعلية. قاعدة البيانات الحالية لا تحتوي جدول جوائز أو قرارات تميز معتمدة، لذلك لا تعرض الصفحة فائزين أو ترتيبًا غير مسجل في النظام.' : 'The repository contains the actual published research. The current database has no awards or approved excellence-selection table, so this page does not invent winners or rankings.'}</p>
      {repository.length > 0 && <><h3>{isArabic ? 'بحوث منشورة مرتبطة بالمستودع' : 'Published research linked to the repository'}</h3><ResearchList items={repository.slice(0, 6)} isArabic={isArabic} /></>}
    </section>
  }

  if (pathname === '/conference') {
    const workspace = data.workspace || {}
    const role = workspace.role
    let summary = []
    if (role === 'researcher') summary = [[isArabic ? 'أبحاثي' : 'My research', workspace.submissions?.length || 0], [isArabic ? 'قيد التحكيم' : 'Under review', countBy(workspace.submissions, 'status', 'under_review')]]
    else if (role === 'scientific_committee') summary = [[isArabic ? 'الأبحاث' : 'Research', workspace.submissions?.length || 0], [isArabic ? 'عضو لجنة تقييم الأبحاثون' : 'Reviewers', workspace.reviewers?.length || 0]]
    else if (role === 'organizing_committee') summary = [[isArabic ? 'الدور' : 'Role', isArabic ? 'اللجنة المنظمة' : 'Organizing Committee']]
    return <section className="live-data" aria-labelledby="live-conference-title">
      <div className="live-data__heading"><div><span>{isArabic ? 'المسار التشغيلي' : 'Operational workflow'}</span><h2 id="live-conference-title">{isArabic ? 'المؤتمر مرتبط بمساحة العمل' : 'Conference workflow is connected to the workspace'}</h2><p>{roleLabel(role, isArabic)}</p></div></div>
      {summary.length > 0 && <MetricGrid items={summary} />}
      <p>{isArabic ? 'رفع الأبحاث، التحكيم والقرارات تتم من مساحة العمل حسب صلاحية الحساب. بيانات المواعيد والشهادات الخاصة بالمؤتمر ليست مخزنة في نموذج البيانات الحالي، لذلك لا نعرض مواعيد أو شهادات وهمية.' : 'Research submission, review, and decisions are handled from the role workspace. Conference schedules and certificate records are not stored in the current data model, so no placeholder schedule or certificate data is shown.'}</p>
      <RouteLink className="live-data__action" to="/workspace">{isArabic ? 'فتح مساحة العمل' : 'Open workspace'} {isArabic ? '←' : '→'}</RouteLink>
    </section>
  }

  return null
}
