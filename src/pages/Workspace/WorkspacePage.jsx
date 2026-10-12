import PublicationPayment from './components/PublicationPayment.jsx'
import ConferenceWorkspace from '../Conference/ConferenceWorkspace.jsx'
import InstitutionWorkspace from './InstitutionWorkspace.jsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useAuth } from '../../features/auth/useAuth.js'
import { api } from '../../features/auth/authApi.js'
import { ROLE_OPTIONS, roleLabel } from '../../features/auth/roles.js'
import { workflowApi } from '../../features/workflow/workflowApi.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import './WorkspacePage.css'
import ResearcherWorkspace from './ResearcherWorkspace.jsx'
import RevisionEditor from './components/RevisionEditor.jsx'

const STATUS_AR = {
  submitted: 'مرفوع', under_review: 'قيد التحكيم', revision_requested: 'بحاجة لتعديل',
  approved: 'مقبول للنشر', rejected: 'غير مقبول', practice_suggested: 'مقترح كممارسة', published: 'منشور',
}

const WORKSPACE_SHORTCUTS = {
  researcher: [
    ['/training', 'التدريب', 'Training'],
    ['/guide', 'الدليل الفلسطيني', 'Palestinian Guide'],
    ['/template', 'القالب الفلسطيني', 'Palestinian Template'],
    ['/repository', 'المستودع الوطني', 'National Repository'],
  ],
  reviewer: [
    ['/guide', 'الدليل الفلسطيني', 'Palestinian Guide'],
    ['/repository', 'المستودع الوطني', 'National Repository'],
  ],
  school_manager: [
    ['/institutions', 'ملف المدرسة', 'School profile'],
    ['/map', 'الخريطة', 'Map'],
    ['/excellence', 'قاعة التميز', 'Hall of Excellence'],
  ],
  directorate_manager: [
    ['/institutions', 'المدارس والباحثون', 'Schools & Researchers'],
    ['/map', 'الخريطة', 'Map'],
    ['/training', 'التدريب', 'Training'],
  ],
  scientific_committee: [
    ['/guide', 'الدليل الفلسطيني', 'Palestinian Guide'],
    ['/template', 'القالب الفلسطيني', 'Palestinian Template'],
    ['/conference', 'المؤتمر الوطني', 'National Conference'],
  ],
  organizing_committee: [
    ['/conference', 'إدارة المؤتمر', 'Conference'],
    ['/news', 'الأخبار والفعاليات', 'News & Events'],
    ['/support', 'التواصل والدعم', 'Communication & Support'],
    ['/excellence', 'قاعة التميز', 'Hall of Excellence'],
  ],
  decision_maker: [
    ['/observatory', 'المرصد الوطني', 'National Observatory'],
    ['/map', 'خريطة المرصد', 'Observatory Map'],
    ['/repository', 'الأدلة والبحوث', 'Evidence & Research'],
  ],
  system_admin: [
    ['/dashboard', 'لوحة تحكم المنصة', 'Platform dashboard'],
  ],
}

function WorkspaceShortcuts({ role, isArabic }) {
  const items = WORKSPACE_SHORTCUTS[role] || []
  if (!items.length) return null
  return (
    <section className="workspace-panel workspace-shortcuts">
      <h2>{isArabic ? 'وصول سريع' : 'Quick access'}</h2>
      <div className="workspace-shortcuts__grid">
        {items.map(([to, ar, en]) => (
          <RouteLink className="workspace-shortcut" to={to} key={to}>
            <span>{isArabic ? ar : en}</span>
            <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
          </RouteLink>
        ))}
      </div>
    </section>
  )
}

function downloadCsv(filename, rows) {
  if (!rows.length) return
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const csv = [columns.map(escape).join(','), ...rows.map((row) => columns.map((key) => escape(row[key])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
}

function ResearchCard({ item, isArabic, onRefresh, reviewers = [], committee = false, readOnly = false }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const status = isArabic ? (STATUS_AR[item.status] || item.status) : item.status.replaceAll('_', ' ')
  const reviewerOptions = [...reviewers].sort((a, b) => {
    const aMatch = (a.research_field || '').trim().toLowerCase() === (item.research_field || '').trim().toLowerCase()
    const bMatch = (b.research_field || '').trim().toLowerCase() === (item.research_field || '').trim().toLowerCase()
    return Number(bMatch) - Number(aMatch)
  })

  async function run(action) {
    setBusy(true); setError('')
    try { await action(); await onRefresh() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function assign(event) {
    event.preventDefault()
    const reviewerId = new FormData(event.currentTarget).get('reviewer_id')
    await run(() => workflowApi.assignReviewer(item.id, reviewerId))
  }



  return (
    <article className="workspace-card">
      <div className="workspace-card__heading">
        <div><small>#{item.id}</small><h3>{item.title}</h3><p>{item.researcher_name || ''} · {item.research_field}</p></div>
        <span className={`workspace-status workspace-status--${item.status}`}>{status}</span>
      </div>
      <div className="workspace-meta">
        <span>{isArabic ? 'المدرسة' : 'School'}: {item.school_id || '—'}</span>
        <span>{isArabic ? 'المديرية' : 'Directorate'}: {item.directorate_id || '—'}</span>
        <span>{isArabic ? 'النسخة' : 'Version'}: {item.current_version}</span>
      </div>
      {item.abstract && <p>{item.abstract}</p>}
      {item.problem && <p><strong>{isArabic ? 'المشكلة:' : 'Problem:'}</strong> {item.problem}</p>}
      {item.file?.url && <a className="workspace-link" href={item.file.url} target="_blank" rel="noreferrer">{isArabic ? 'فتح الملف المرفوع' : 'Open uploaded file'}</a>}
      {item.reviews?.map((review) => <blockquote key={review.id}><strong>{isArabic ? 'ملاحظات التحكيم:' : 'Review notes:'}</strong> {review.comments}</blockquote>)}
      {item.events?.filter(event => event.event_type === 'scientific_decision').slice(-1).map((event, i) => <blockquote key={`decision-${i}`}><strong>{isArabic ? 'ملاحظات اللجنة: ' : 'Committee feedback: '}</strong>{event.note || (isArabic ? 'لم تُرفق ملاحظات بالقرار.' : 'No notes were attached to this decision.')}</blockquote>)}
      {item.events?.length > 0 && (
        <details><summary>{isArabic ? 'سجل العملية' : 'Workflow history'}</summary>
          <ol className="workspace-timeline">{item.events.map((event, index) => <li key={`${event.event_type}-${index}`}><strong>{event.to_status}</strong>{event.note ? ` — ${event.note}` : ''}</li>)}</ol>
        </details>
      )}
      {['revision_requested', 'rejected'].includes(item.status) && !committee && !readOnly && <RevisionEditor item={item} isArabic={isArabic} onRefresh={onRefresh} />}
      {item.status === 'approved' && item.publication_type === 'research' && !committee && !readOnly && <PublicationPayment item={item} isArabic={isArabic} onRefresh={onRefresh} />}
      {(item.status === 'practice_suggested' || (item.status === 'approved' && item.publication_type === 'practice')) && !committee && !readOnly && <button disabled={busy} onClick={() => run(() => workflowApi.publishPractice(item.id))}>{isArabic ? 'نشرها كممارسة' : 'Publish as practice'}</button>}
      {committee && (
        <div className="workspace-actions-grid">
          <form className="workspace-inline-form" onSubmit={assign}>
            <label>{isArabic ? 'تعيين عضو لجنة تقييم الأبحاث' : 'Assign research evaluator'}<select name="reviewer_id" required defaultValue=""><option value="" disabled>—</option>{reviewerOptions.map((r) => <option key={r.id} value={r.id}>{r.full_name} — {r.research_field || r.specialization || r.email}</option>)}</select></label>
            <button disabled={busy}>{isArabic ? 'تعيين' : 'Assign'}</button>
          </form>

        </div>
      )}
      {error && <p className="workspace-error" role="alert">{error}</p>}
    </article>
  )
}

function ReviewerAssignment({ assignment, isArabic, onRefresh }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function run(action) { setBusy(true); setError(''); try { await action(); await onRefresh() } catch (err) { setError(err.message) } finally { setBusy(false) } }
  async function review(event) {
    event.preventDefault(); const data = new FormData(event.currentTarget)
    await run(() => workflowApi.submitReview(assignment.id, { recommendation: data.get('recommendation'), comments: data.get('comments'), rubric: {} }))
  }
  return <article className="workspace-card">
    <h3>{assignment.submission?.title}</h3>
    <p>{assignment.submission?.research_field} · {assignment.status}</p>
    {assignment.submission?.file?.url && <a className="workspace-link" href={assignment.submission.file.url} target="_blank" rel="noreferrer">{isArabic ? 'فتح البحث' : 'Open research'}</a>}
    {!assignment.confidentiality_accepted && <button disabled={busy} onClick={() => run(() => workflowApi.acceptAssignment(assignment.id))}>{isArabic ? 'قبول الدعوة والموافقة على السرية' : 'Accept invitation & confidentiality'}</button>}
    {assignment.confidentiality_accepted && <form className="workspace-inline-form" onSubmit={review}>
      <label>{isArabic ? 'التوصية' : 'Recommendation'}<select name="recommendation" defaultValue="revision"><option value="approve">{isArabic ? 'قبول' : 'Approve'}</option><option value="revision">{isArabic ? 'تعديلات' : 'Revision'}</option><option value="practice">{isArabic ? 'ممارسة' : 'Practice'}</option><option value="reject">{isArabic ? 'رفض' : 'Reject'}</option></select></label>
      <label>{isArabic ? 'الملاحظات' : 'Comments'}<textarea name="comments" required minLength={2} maxLength={12000} /></label>
      <button disabled={busy}>{isArabic ? 'إرسال التحكيم' : 'Submit review'}</button>
    </form>}
    {assignment.status === 'completed' && assignment.submission?.status !== 'published' && <form className="workspace-inline-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); run(() => workflowApi.decide(assignment.submission.id, { decision: form.get('decision'), note: form.get('note') })) }}><label>{isArabic ? 'قرار لجنة تقييم الأبحاث' : 'Research evaluation decision'}<select name="decision"><option value="approve">{isArabic ? 'قبول' : 'Approve'}</option><option value="revision">{isArabic ? 'تعديل' : 'Revision'}</option><option value="reject">{isArabic ? 'رفض' : 'Reject'}</option><option value="practice">{isArabic ? 'اعتماد كممارسة' : 'Approve as practice'}</option></select></label><textarea name="note" required minLength={2} maxLength={12000} aria-label={isArabic ? 'ملاحظات القرار' : 'Decision notes'} /><button disabled={busy}>{isArabic ? 'اعتماد القرار' : 'Confirm decision'}</button></form>}
    {error && <p className="workspace-error">{error}</p>}
  </article>
}

export default function WorkspacePage() {
  const { user, refreshUser } = useAuth()
  const { isArabic, dir } = useLanguage()
  const [data, setData] = useState(null)
  const [catalog, setCatalog] = useState(null)
  const [schools, setSchools] = useState([])
  const [schoolQuery, setSchoolQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const copy = isArabic ? {
    title: 'مساحة العمل', role: 'الدور الحالي', affiliation: 'الارتباط المؤسسي',
    submit: 'رفع بحث جديد', saveAff: 'إرسال بيانات المدرسة والمديرية للاعتماد', searchSchool: 'ابحث عن المدرسة',
    pending: 'طلب الارتباط بانتظار الاعتماد.', approved: 'الارتباط المؤسسي معتمد.', noItems: 'لا توجد عناصر بعد.',
  } : {
    title: 'Workspace', role: 'Current role', affiliation: 'Institutional affiliation',
    submit: 'Submit new research', saveAff: 'Send school/directorate details for approval', searchSchool: 'Search school',
    pending: 'Affiliation is awaiting approval.', approved: 'Institutional affiliation approved.', noItems: 'No items yet.',
  }

  const workspaceTitle = isArabic ? {
    researcher: 'مساحة عمل الباحث / المعلم',
    reviewer: 'مساحة عمل عضو لجنة تقييم الأبحاث',
    school_manager: 'مساحة عمل مدير المدرسة',
    directorate_manager: 'مساحة عمل المديرية',
    scientific_committee: 'مساحة عمل اللجنة العلمية',
    organizing_committee: 'مساحة عمل اللجنة المنظمة',
    decision_maker: 'مساحة عمل صانع القرار',
    system_admin: 'مساحة عمل مدير النظام',
  }[data?.role] || copy.title : {
    researcher: 'Teacher / Researcher Workspace',
    reviewer: 'Research Evaluation Committee Workspace',
    school_manager: 'School Manager Workspace',
    directorate_manager: 'Directorate Workspace',
    scientific_committee: 'Scientific Committee Workspace',
    organizing_committee: 'Organizing Committee Workspace',
    decision_maker: 'Decision Maker Workspace',
    system_admin: 'System Administrator Workspace',
  }[data?.role] || copy.title

  const load = useCallback(async () => {
    setError('')
    try {
      const [workspace, education] = await Promise.all([workflowApi.workspace(), api('/api/education/catalog')])
      setData(workspace); setCatalog(education)
    } catch (err) { setError(err.message) }
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([workflowApi.workspace(), api('/api/education/catalog')])
      .then(([workspace, education]) => { if (active) { setData(workspace); setCatalog(education) } })
      .catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [])

  async function searchSchools() {
    if (schoolQuery.trim().length < 2) return
    setBusy(true); setError('')
    try {
      const result = await api(`/api/education/schools?q=${encodeURIComponent(schoolQuery.trim())}&limit=20`)
      setSchools(result.items || [])
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function submitAffiliation(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    setBusy(true); setError(''); setMessage('')
    try {
      await workflowApi.requestAffiliation({
        governorate_id: form.get('governorate_id') || null,
        directorate_id: form.get('directorate_id') || null,
        school_id: form.get('school_id') || null,
        specialization: form.get('specialization') || null,
        research_field: form.get('research_field') || null,
      })
      setMessage(copy.pending); await load()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function approveAffiliation(userId) {
    setBusy(true); setError(''); setMessage('')
    try {
      await workflowApi.approveAffiliation(userId)
      setMessage(isArabic ? 'تم اعتماد الحساب التابع.' : 'Affiliated account approved.')
      await load()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function updateRecommendation(id, status) {
    setBusy(true); setError('')
    try { await workflowApi.updateRecommendation(id, status); await load() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  function exportReport() {
    const rows = data.role === 'decision_maker'
      ? data.recommendations.map((item) => ({ id: item.id, research_field: item.research_field, directorate_id: item.directorate_id, status: item.status, recommendation: item.text }))
      : data.submissions.map((item) => ({ id: item.id, title: item.title, researcher: item.researcher_name, research_field: item.research_field, school_id: item.school_id, directorate_id: item.directorate_id, status: item.status, version: item.current_version, published_at: item.published_at || '' }))
    downloadCsv(`parp-${data.role}-report.csv`, rows)
  }

  async function updateAdminUser(event, target) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError('')
    try {
      await workflowApi.updateUserAccess(target.id, {
        role: form.get('role'), governorate_id: form.get('governorate_id') || null, directorate_id: form.get('directorate_id') || null,
        school_id: form.get('school_id') || null, specialization: form.get('specialization') || null, research_field: form.get('research_field') || null,
      })
      await load(); await refreshUser()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const needsAffiliation = useMemo(() => ['researcher', 'school_manager', 'directorate_manager'].includes(data?.role), [data?.role])
  if (!user || !data) return <section className="workspace-page" dir={dir}><p>{error || (isArabic ? 'جارٍ تحميل مساحة العمل…' : 'Loading workspace…')}</p></section>

  const affiliationPanel = needsAffiliation && <section className="workspace-panel"><h2>{copy.affiliation}</h2>
      {data.affiliation?.approval_status === 'approved' ? <p className="workspace-message">{copy.approved} — {data.affiliation.school_id || data.affiliation.directorate_id}</p> : <form className="workspace-form" onSubmit={submitAffiliation}>
        <label>{isArabic ? 'المحافظة' : 'Governorate'}<select name="governorate_id" defaultValue={data.affiliation?.governorate_id || ''}><option value="">—</option>{catalog?.governorates?.map((g) => <option key={g.id} value={g.id}>{isArabic ? g.name_ar : g.name_en}</option>)}</select></label>
        <label>{isArabic ? 'المديرية' : 'Directorate'}<select name="directorate_id" defaultValue={data.affiliation?.directorate_id || ''}><option value="">—</option>{catalog?.directorates?.map((d) => <option key={d.id} value={d.id}>{isArabic ? d.name_ar : d.name_en}</option>)}</select></label>
        <div className="workspace-school-search"><label>{copy.searchSchool}<input value={schoolQuery} onChange={(e) => setSchoolQuery(e.target.value)} /></label><button type="button" onClick={searchSchools} disabled={busy}>{isArabic ? 'بحث' : 'Search'}</button></div>
        <label>{isArabic ? 'المدرسة' : 'School'}<select name="school_id" defaultValue={data.affiliation?.school_id || ''}><option value="">—</option>{schools.map((school) => <option key={school.id} value={school.id}>{isArabic ? school.name_ar : school.name_en} — {school.national_code}</option>)}</select></label>
        <label>{isArabic ? 'التخصص' : 'Specialization'}<input name="specialization" defaultValue={data.affiliation?.specialization || ''} /></label>
        <label>{isArabic ? 'مجال البحث' : 'Research field'}<input name="research_field" defaultValue={data.affiliation?.research_field || ''} /></label>
        <button disabled={busy}>{copy.saveAff}</button>
      </form>}
    </section>

  if (data.role === 'researcher') return <ResearcherWorkspace key={user.id} user={user} data={data} isArabic={isArabic} dir={dir} affiliation={<>{error && <p role="alert" className="workspace-error">{error}</p>}{message && <p role="status" className="workspace-message">{message}</p>}{affiliationPanel}</>} onRefresh={load} renderResearch={(item) => <ResearchCard item={item} isArabic={isArabic} onRefresh={load} />} />

  return <section className="workspace-page" dir={dir}>
    <header className="workspace-hero"><span>PARP</span><h1>{workspaceTitle}</h1><p>{copy.role}: <strong>{roleLabel(data.role, isArabic)}</strong></p></header>
    {error && <p className="workspace-error" role="alert">{error}</p>}{message && <p className="workspace-message" role="status">{message}</p>}

    <WorkspaceShortcuts role={data.role} isArabic={isArabic} />

    {data.role === 'researcher' && (
      <section className="workspace-panel workspace-research-summary">
        <h2>{isArabic ? 'حالة أبحاثي' : 'My research status'}</h2>
        <div className="workspace-counts">{Object.entries(data.counts || {}).map(([key, value]) => <span key={key}><strong>{value}</strong>{isArabic ? (STATUS_AR[key] || key) : key.replaceAll('_', ' ')}</span>)}</div>
      </section>
    )}

    {['school_manager', 'directorate_manager', 'scientific_committee', 'decision_maker', 'system_admin'].includes(data.role) && (data.submissions.length || data.recommendations.length) > 0 && (
      <button className="workspace-export" type="button" onClick={exportReport}>{isArabic ? 'استخراج تقرير CSV' : 'Export CSV report'}</button>
    )}

    {affiliationPanel}

    {['school_manager', 'directorate_manager', 'system_admin'].includes(data.role) && data.affiliation_requests?.length > 0 && (
      <section className="workspace-panel">
        <h2>{isArabic ? 'حسابات بانتظار الاعتماد' : 'Accounts awaiting approval'}</h2>
        <div className="workspace-list workspace-list--compact">
          {data.affiliation_requests.map((request) => (
            <article className="workspace-mini workspace-mini--action" key={request.user.id}>
              <div><strong>{request.user.full_name || `#${request.user.id}`}</strong><p>{request.user.email || ''}</p><small>{request.affiliation.school_id || request.affiliation.directorate_id || '—'}</small></div>
              <button type="button" disabled={busy} onClick={() => approveAffiliation(request.user.id)}>{isArabic ? 'اعتماد' : 'Approve'}</button>
            </article>
          ))}
        </div>
      </section>
    )}

    {['scientific_committee', 'organizing_committee'].includes(data.role) && <ConferenceWorkspace />}
    {['school_manager', 'directorate_manager', 'decision_maker'].includes(data.role) && <InstitutionWorkspace />}
    {data.role === 'reviewer' && <section className="workspace-list"><h2>{isArabic ? 'طلبات التحكيم' : 'Review assignments'}</h2>{data.assignments.length ? data.assignments.map((item) => <ReviewerAssignment key={item.id} assignment={item} isArabic={isArabic} onRefresh={load} />) : <p>{copy.noItems}</p>}</section>}

    {data.role === 'system_admin' && <section className="workspace-list"><h2>{isArabic ? 'إدارة التحكيم والقرارات' : 'Review & decisions'}</h2>{data.submissions.length ? data.submissions.map((item) => <ResearchCard key={item.id} item={item} isArabic={isArabic} onRefresh={load} reviewers={data.reviewers} committee />) : <p>{copy.noItems}</p>}</section>}


    {data.role === 'decision_maker' && <div className="workspace-two-columns">
      <section className="workspace-panel"><h2>{isArabic ? 'توصيات المرصد الوطني' : 'National Observatory recommendations'}</h2>
        {data.recommendations.length ? data.recommendations.map((r) => <article className="workspace-mini" key={r.id}><strong>{r.research_field}</strong><p>{r.text}</p><label className="workspace-mini__status">{isArabic ? 'حالة المتابعة' : 'Follow-up status'}<select value={r.status} disabled={busy} onChange={(event) => updateRecommendation(r.id, event.target.value)}><option value="new">new</option><option value="under_review">under_review</option><option value="adopted">adopted</option><option value="closed">closed</option></select></label></article>) : <p>{copy.noItems}</p>}
      </section>
      <section className="workspace-panel"><h2>{isArabic ? 'بنك المشكلات' : 'Problem bank'}</h2>
        {data.problems.length ? data.problems.map((p) => <article className="workspace-mini" key={p.id}><strong>{p.research_field}</strong><p>{p.text}</p><small>{p.directorate_id || '—'}</small></article>) : <p>{copy.noItems}</p>}
      </section>
    </div>}

    {data.role === 'system_admin' && <section className="workspace-list"><h2>{isArabic ? 'إدارة المستخدمين والصلاحيات' : 'User & permission management'}</h2>{data.users.map((target) => <details className="workspace-card" key={target.id}><summary>{target.full_name} — {target.email} — {roleLabel(target.role, isArabic)}</summary><form className="workspace-form" onSubmit={(event) => updateAdminUser(event, target)}>
      <label>{isArabic ? 'الدور' : 'Role'}<select name="role" defaultValue={target.role}>{ROLE_OPTIONS.map((role) => <option value={role.value} key={role.value}>{isArabic ? role.ar : role.en}</option>)}</select></label>
      <label>{isArabic ? 'المحافظة ID' : 'Governorate ID'}<input name="governorate_id" defaultValue={target.affiliation?.governorate_id || ''} /></label>
      <label>{isArabic ? 'المديرية ID' : 'Directorate ID'}<input name="directorate_id" defaultValue={target.affiliation?.directorate_id || ''} /></label>
      <label>{isArabic ? 'المدرسة ID' : 'School ID'}<input name="school_id" defaultValue={target.affiliation?.school_id || ''} /></label>
      <label>{isArabic ? 'التخصص' : 'Specialization'}<input name="specialization" defaultValue={target.affiliation?.specialization || ''} /></label>
      <label>{isArabic ? 'مجال البحث' : 'Research field'}<input name="research_field" defaultValue={target.affiliation?.research_field || ''} /></label>
      <button disabled={busy}>{isArabic ? 'حفظ الصلاحيات' : 'Save access'}</button>
    </form></details>)}</section>}
  </section>
}
