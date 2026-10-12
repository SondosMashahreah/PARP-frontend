import PlatformAdmin from './components/PlatformAdmin.jsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ROLE_OPTIONS, roleLabel } from '../../features/auth/roles.js'
import { useAuth } from '../../features/auth/useAuth.js'
import { workflowApi } from '../../features/workflow/workflowApi.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import './DashboardPage.css'

const STATUS_LABELS = {
  submitted: ['مرفوع', 'Submitted'],
  under_review: ['قيد التحكيم', 'Under review'],
  revision_requested: ['بحاجة لتعديل', 'Revision requested'],
  approved: ['مقبول', 'Approved'],
  rejected: ['مرفوض', 'Rejected'],
  practice_suggested: ['مقترح كممارسة', 'Practice suggested'],
  published: ['منشور', 'Published'],
}

const EVENT_LABELS = {
  submitted: ['رفع بحث جديد', 'Research submitted'],
  resubmitted: ['إعادة إرسال بحث', 'Research resubmitted'],
  reviewer_assigned: ['تعيين محكم', 'Reviewer assigned'],
  review_submitted: ['إرسال تحكيم', 'Review submitted'],
  scientific_decision: ['قرار اللجنة العلمية', 'Scientific decision'],
  published: ['نشر بحث', 'Research published'],
  published_as_practice: ['نشر ممارسة', 'Practice published'],
}

function pick(pair, isArabic) {
  return pair?.[isArabic ? 0 : 1] || ''
}

function formatNumber(value, isArabic) {
  return new Intl.NumberFormat(isArabic ? 'ar-PS' : 'en-GB').format(Number(value || 0))
}

function formatDate(value, isArabic) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(isArabic ? 'ar-PS' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function MetricCard({ label, value, hint }) {
  return (
    <article className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  )
}

function EmptyState({ children }) {
  return <p className="admin-empty">{children}</p>
}

function LoadingState({ isArabic }) {
  return (
    <section className="admin-dashboard" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="admin-skeleton admin-skeleton--hero" />
      <div className="admin-metrics-grid">
        {[0, 1, 2, 3, 4, 5].map((item) => <div className="admin-skeleton admin-skeleton--metric" key={item} />)}
      </div>
      <div className="admin-skeleton admin-skeleton--panel" />
    </section>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { isArabic } = useLanguage()
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const copy = isArabic ? {
    eyebrow: 'إدارة وتشغيل PARP', title: 'لوحة تحكم مدير النظام',
    subtitle: 'مركز موحد لمراقبة المنصة، إدارة الحسابات والصلاحيات، ومتابعة دورة البحث كاملة.',
    refresh: 'تحديث البيانات', refreshing: 'جارٍ التحديث…', apiOk: 'الخادم متصل',
    lastUpdate: 'آخر تحديث', overview: 'نظرة عامة على المنصة', researchFlow: 'دورة الأبحاث',
    roles: 'توزيع المستخدمين حسب الدور', coverage: 'تغطية المنصة', pending: 'طلبات اعتماد تحتاج إجراء',
    recent: 'آخر نشاط على المنصة', users: 'إدارة المستخدمين والصلاحيات', search: 'ابحث بالاسم أو البريد',
    allRoles: 'كل الأدوار', allStatuses: 'كل الحالات', active: 'نشط', inactive: 'موقوف',
    apply: 'بحث', clear: 'مسح', noPending: 'لا توجد طلبات اعتماد معلقة.', noActivity: 'لا يوجد نشاط حديث.',
    noUsers: 'لا توجد حسابات مطابقة.', approve: 'اعتماد', save: 'حفظ التعديلات', saving: 'جارٍ الحفظ…',
    role: 'الدور', account: 'الحساب', institution: 'الارتباط المؤسسي', status: 'الحالة', created: 'تاريخ الإنشاء',
    governorate: 'المحافظة ID', directorate: 'المديرية ID', school: 'المدرسة ID', specialization: 'التخصص', field: 'مجال البحث',
    enabled: 'الحساب فعال', verified: 'موثق', notVerified: 'غير موثق', openWorkspace: 'مساحة الإدارة القديمة',
    failed: 'تعذر تحميل بيانات لوحة التحكم.', retry: 'إعادة المحاولة', usersTotal: 'إجمالي المستخدمين',
    usersActive: 'الحسابات الفعالة', usersVerified: 'الحسابات الموثقة', researchTotal: 'إجمالي الأبحاث',
    published: 'الأبحاث المنشورة', pendingAffiliations: 'طلبات الاعتماد', schools: 'المدارس',
    directorates: 'المديريات', governorates: 'المحافظات', reviews: 'مهام التحكيم', recommendations: 'التوصيات', problems: 'بنك المشكلات',
  } : {
    eyebrow: 'PARP administration & operations', title: 'System Administrator Dashboard',
    subtitle: 'One control center to monitor the platform, manage accounts and permissions, and follow the full research lifecycle.',
    refresh: 'Refresh data', refreshing: 'Refreshing…', apiOk: 'API connected',
    lastUpdate: 'Last update', overview: 'Platform overview', researchFlow: 'Research workflow',
    roles: 'Users by role', coverage: 'Platform coverage', pending: 'Approvals requiring action',
    recent: 'Recent platform activity', users: 'Users & permissions', search: 'Search name or email',
    allRoles: 'All roles', allStatuses: 'All statuses', active: 'Active', inactive: 'Disabled',
    apply: 'Search', clear: 'Clear', noPending: 'No pending affiliation requests.', noActivity: 'No recent activity.',
    noUsers: 'No matching accounts.', approve: 'Approve', save: 'Save changes', saving: 'Saving…',
    role: 'Role', account: 'Account', institution: 'Institutional affiliation', status: 'Status', created: 'Created',
    governorate: 'Governorate ID', directorate: 'Directorate ID', school: 'School ID', specialization: 'Specialization', field: 'Research field',
    enabled: 'Account enabled', verified: 'Verified', notVerified: 'Not verified', openWorkspace: 'Legacy admin workspace',
    failed: 'Could not load the admin dashboard.', retry: 'Retry', usersTotal: 'Total users',
    usersActive: 'Active accounts', usersVerified: 'Verified accounts', researchTotal: 'Total research',
    published: 'Published research', pendingAffiliations: 'Pending approvals', schools: 'Schools',
    directorates: 'Directorates', governorates: 'Governorates', reviews: 'Review assignments', recommendations: 'Recommendations', problems: 'Problem bank',
  }

  const loadSummary = useCallback(async () => workflowApi.adminDashboard(), [])
  const loadUsers = useCallback(async (filters = {}) => workflowApi.adminUsers({ limit: 50, ...filters }), [])

  const reload = useCallback(async (silent = false, filters = null) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const userFilters = filters || { q: query.trim(), role: roleFilter, active: activeFilter }
      const [nextSummary, nextUsers] = await Promise.all([loadSummary(), loadUsers(userFilters)])
      setSummary(nextSummary)
      setUsers(nextUsers)
    } catch (err) {
      setError(err?.message || copy.failed)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeFilter, copy.failed, loadSummary, loadUsers, query, roleFilter])

  useEffect(() => {
    reload(false, { q: '', role: '', active: '' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = summary?.metrics || {}
  const researchStatuses = summary?.research_statuses || {}
  const roleDistribution = summary?.role_distribution || []
  const pending = summary?.pending_affiliations || []
  const activity = summary?.recent_activity || []
  const coverage = summary?.education || {}
  const workflowMax = Math.max(1, ...Object.values(researchStatuses).map(Number))
  const roleMax = Math.max(1, ...roleDistribution.map((row) => Number(row.value || 0)))

  const metricCards = useMemo(() => [
    [copy.usersTotal, metrics.users_total],
    [copy.usersActive, metrics.users_active],
    [copy.researchTotal, metrics.research_total],
    [copy.published, researchStatuses.published],
    [copy.pendingAffiliations, metrics.pending_affiliations],
    [copy.schools, coverage.schools],
  ], [copy, coverage.schools, metrics, researchStatuses.published])

  async function approveAffiliation(userId) {
    setBusyId(`approval-${userId}`); setError(''); setMessage('')
    try {
      await workflowApi.approveAffiliation(userId)
      setMessage(isArabic ? 'تم اعتماد الارتباط المؤسسي.' : 'Affiliation approved.')
      await reload(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function saveUser(event, target) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusyId(`user-${target.id}`); setError(''); setMessage('')
    try {
      await workflowApi.updateUserAccess(target.id, {
        role: form.get('role'),
        is_active: form.get('is_active') === 'on',
        governorate_id: form.get('governorate_id') || null,
        directorate_id: form.get('directorate_id') || null,
        school_id: form.get('school_id') || null,
        specialization: form.get('specialization') || null,
        research_field: form.get('research_field') || null,
      })
      setMessage(isArabic ? 'تم حفظ صلاحيات الحساب.' : 'Account access updated.')
      await reload(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  function submitFilters(event) {
    event.preventDefault()
    reload(true)
  }

  function clearFilters() {
    setQuery(''); setRoleFilter(''); setActiveFilter('')
    reload(true, { q: '', role: '', active: '' })
  }

  if (loading && !summary) return <LoadingState isArabic={isArabic} />

  if (!summary) {
    return (
      <section className="admin-dashboard" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="admin-error" role="alert">
          <strong>{copy.failed}</strong>
          <span>{error}</span>
          <button type="button" onClick={() => reload()}>{copy.retry}</button>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-dashboard" dir={isArabic ? 'rtl' : 'ltr'}>
      <PlatformAdmin />
      <header className="admin-hero">
        <div>
          <span className="admin-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <div className="admin-hero__meta">
            <span className="admin-health"><i />{copy.apiOk}</span>
            <span>{roleLabel('system_admin', isArabic)}</span>
            <span>{user?.full_name || summary.user?.full_name}</span>
          </div>
        </div>
        <div className="admin-hero__actions">
          <button type="button" onClick={() => reload(true)} disabled={refreshing}>{refreshing ? copy.refreshing : copy.refresh}</button>
          <RouteLink to="/workspace">{copy.openWorkspace}</RouteLink>
          <small>{copy.lastUpdate}: {formatDate(summary.generated_at, isArabic)}</small>
        </div>
      </header>

      {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
      {message ? <p className="admin-alert admin-alert--success" role="status">{message}</p> : null}

      <section className="admin-section">
        <div className="admin-section__heading"><div><span>01</span><h2>{copy.overview}</h2></div></div>
        <div className="admin-metrics-grid">
          {metricCards.map(([label, value]) => <MetricCard key={label} label={label} value={formatNumber(value, isArabic)} />)}
        </div>
      </section>

      <div className="admin-grid admin-grid--analytics">
        <section className="admin-panel">
          <div className="admin-panel__heading"><h2>{copy.researchFlow}</h2><strong>{formatNumber(metrics.research_total, isArabic)}</strong></div>
          <div className="admin-bars">
            {Object.entries(researchStatuses).map(([status, value]) => (
              <div className="admin-bar" key={status}>
                <div><span>{pick(STATUS_LABELS[status] || [status, status.replaceAll('_', ' ')], isArabic)}</span><strong>{formatNumber(value, isArabic)}</strong></div>
                <i><b style={{ inlineSize: `${Math.max(3, Number(value || 0) / workflowMax * 100)}%` }} /></i>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading"><h2>{copy.roles}</h2><strong>{formatNumber(metrics.users_total, isArabic)}</strong></div>
          <div className="admin-bars">
            {roleDistribution.map((row) => (
              <div className="admin-bar" key={row.key}>
                <div><span>{roleLabel(row.key, isArabic)}</span><strong>{formatNumber(row.value, isArabic)}</strong></div>
                <i><b style={{ inlineSize: `${Math.max(3, Number(row.value || 0) / roleMax * 100)}%` }} /></i>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-grid admin-grid--operations">
        <section className="admin-panel">
          <div className="admin-panel__heading"><h2>{copy.pending}</h2><strong>{formatNumber(metrics.pending_affiliations, isArabic)}</strong></div>
          {pending.length ? <div className="admin-approval-list">{pending.map((request) => (
            <article key={request.user.id}>
              <div><strong>{request.user.full_name || request.user.email}</strong><span>{request.user.email}</span><small>{request.affiliation.school_id || request.affiliation.directorate_id || '—'}</small></div>
              <button type="button" disabled={busyId === `approval-${request.user.id}`} onClick={() => approveAffiliation(request.user.id)}>{copy.approve}</button>
            </article>
          ))}</div> : <EmptyState>{copy.noPending}</EmptyState>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading"><h2>{copy.coverage}</h2></div>
          <div className="admin-coverage">
            <MetricCard label={copy.governorates} value={formatNumber(coverage.governorates, isArabic)} />
            <MetricCard label={copy.directorates} value={formatNumber(coverage.directorates, isArabic)} />
            <MetricCard label={copy.schools} value={formatNumber(coverage.schools, isArabic)} />
            <MetricCard label={copy.reviews} value={formatNumber(metrics.review_assignments, isArabic)} />
            <MetricCard label={copy.recommendations} value={formatNumber(metrics.recommendations, isArabic)} />
            <MetricCard label={copy.problems} value={formatNumber(metrics.problems, isArabic)} />
          </div>
        </section>
      </div>

      <section className="admin-panel admin-panel--activity">
        <div className="admin-panel__heading"><h2>{copy.recent}</h2></div>
        {activity.length ? <div className="admin-activity-list">{activity.map((item) => (
          <article key={item.id}>
            <span className="admin-activity__dot" />
            <div><strong>{pick(EVENT_LABELS[item.event_type] || [item.event_type, item.event_type.replaceAll('_', ' ')], isArabic)}</strong><p>{item.submission_title}</p><small>{item.actor_name} · {pick(STATUS_LABELS[item.to_status] || [item.to_status, item.to_status?.replaceAll('_', ' ')], isArabic)}</small></div>
            <time dateTime={item.created_at}>{formatDate(item.created_at, isArabic)}</time>
          </article>
        ))}</div> : <EmptyState>{copy.noActivity}</EmptyState>}
      </section>

      <section className="admin-panel admin-panel--users">
        <div className="admin-panel__heading"><div><h2>{copy.users}</h2><small>{formatNumber(users.total, isArabic)}</small></div></div>
        <form className="admin-user-filters" onSubmit={submitFilters}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} maxLength={150} />
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="">{copy.allRoles}</option>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{isArabic ? role.ar : role.en}</option>)}</select>
          <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}><option value="">{copy.allStatuses}</option><option value="true">{copy.active}</option><option value="false">{copy.inactive}</option></select>
          <button type="submit">{copy.apply}</button>
          <button type="button" className="is-ghost" onClick={clearFilters}>{copy.clear}</button>
        </form>

        {users.items.length ? <div className="admin-user-list">{users.items.map((target) => (
          <details key={target.id} className="admin-user-row">
            <summary>
              <span className="admin-user-avatar" aria-hidden="true">{target.full_name?.trim()?.charAt(0) || '#'}</span>
              <span className="admin-user-main"><strong>{target.full_name}</strong><small>{target.email}</small></span>
              <span className="admin-user-role">{roleLabel(target.role, isArabic)}</span>
              <span className={`admin-user-status ${target.is_active ? 'is-active' : 'is-disabled'}`}>{target.is_active ? copy.active : copy.inactive}</span>
              <span className="admin-user-verified">{target.is_verified ? copy.verified : copy.notVerified}</span>
            </summary>
            <form className="admin-user-form" onSubmit={(event) => saveUser(event, target)}>
              <label>{copy.role}<select name="role" defaultValue={target.role}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{isArabic ? role.ar : role.en}</option>)}</select></label>
              <label>{copy.governorate}<input name="governorate_id" defaultValue={target.affiliation?.governorate_id || ''} /></label>
              <label>{copy.directorate}<input name="directorate_id" defaultValue={target.affiliation?.directorate_id || ''} /></label>
              <label>{copy.school}<input name="school_id" defaultValue={target.affiliation?.school_id || ''} /></label>
              <label>{copy.specialization}<input name="specialization" defaultValue={target.affiliation?.specialization || ''} /></label>
              <label>{copy.field}<input name="research_field" defaultValue={target.affiliation?.research_field || ''} /></label>
              <label className="admin-user-toggle"><input name="is_active" type="checkbox" defaultChecked={target.is_active} /><span>{copy.enabled}</span></label>
              <button type="submit" disabled={busyId === `user-${target.id}`}>{busyId === `user-${target.id}` ? copy.saving : copy.save}</button>
            </form>
          </details>
        ))}</div> : <EmptyState>{copy.noUsers}</EmptyState>}
      </section>
    </section>
  )
}
