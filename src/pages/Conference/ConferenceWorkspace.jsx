import { useState } from 'react'
import { useAuth } from '../../features/auth/useAuth.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { usePlatformData } from '../../features/platform/usePlatformData.js'
import { platformApi } from '../../features/platform/platformApi.js'
import '../Workspace/WorkspacePage.css'
import './ConferenceWorkspace.css'
export default function ConferenceWorkspace() {
  const { user } = useAuth(),
    { isArabic, dir } = useLanguage(),
    t = (a, e) => (isArabic ? a : e)
  const conferences = usePlatformData('/conferences'),
    participations = usePlatformData('/participations'),
    notices = usePlatformData('/notices')
  const [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false)
  const scientific = user?.role === 'scientific_committee',
    researcher = user?.role === 'researcher'
  async function run(event, action) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action(new FormData(event.currentTarget))
      conferences.reload()
      participations.reload()
      notices.reload()
      setMessage(t('تم الحفظ', 'Saved'))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="workspace-page conference-workspace" dir={dir}>
      <header className="workspace-hero">
        <span>PARP / CONFERENCES</span>
        <h1>
          {researcher
            ? t('مشاركاتي في المؤتمر', 'My conference participations')
            : t('المؤتمرات', 'Conferences')}
        </h1>
        <p>
          {t(
            'مشاركة المعرفة، من المدرسة إلى المجتمع البحثي.',
            'Sharing knowledge, from school to the research community.',
          )}
        </p>
      </header>
      {[error, conferences.error, participations.error, notices.error]
        .filter(Boolean)
        .map((e, i) => (
          <p role="alert" key={i}>
            {e}
          </p>
        ))}
      {message && <p role="status">{message}</p>}
      {user?.role === 'organizing_committee' && (
        <details className="workspace-panel" open>
          <summary>
            {t('تغيير كلمة المرور المؤقتة', 'Change temporary password')}
          </summary>
          <form
            className="workspace-form"
            onSubmit={(e) =>
              run(e, (d) =>
                platformApi.put('/committee/password', {
                  password: d.get('password'),
                }),
              )
            }
          >
            <label>
              {t(
                'كلمة مرور جديدة: كبير وصغير ورقم ورمز',
                'New password: uppercase, lowercase, number and symbol',
              )}
              <input
                name="password"
                type="password"
                minLength={10}
                maxLength={72}
                required
                autoComplete="new-password"
              />
            </label>
            <button disabled={busy}>{t('حفظ', 'Save')}</button>
          </form>
        </details>
      )}
      {scientific && (
        <details className="workspace-panel">
          <summary>{t('إنشاء مؤتمر جديد', 'Create conference')}</summary>
          <form
            className="workspace-form"
            onSubmit={(e) =>
              run(e, (d) =>
                platformApi.post('/conferences', {
                  ...Object.fromEntries(d),
                  starts_at: new Date(d.get('starts_at')).toISOString(),
                  ends_at: new Date(d.get('ends_at')).toISOString(),
                  deadline: new Date(d.get('deadline')).toISOString(),
                }),
              )
            }
          >
            {[
              ['title', 'اسم المؤتمر', 'Title'],
              ['category', 'التصنيف', 'Category'],
              ['venue', 'المكان أو رابط الانعقاد', 'Venue or meeting URL'],
              [
                'starts_at',
                'البداية (بتوقيت جهازك)',
                'Start (your local time)',
              ],
              ['ends_at', 'النهاية', 'End'],
              ['deadline', 'آخر موعد للمشاركة', 'Submission deadline'],
            ].map(([key, a, en]) => (
              <label key={key}>
                {t(a, en)}
                <input
                  name={key}
                  required
                  type={
                    ['starts_at', 'ends_at', 'deadline'].includes(key)
                      ? 'datetime-local'
                      : 'text'
                  }
                  maxLength={key === 'venue' ? 500 : 150}
                />
              </label>
            ))}
            <button disabled={busy}>
              {t('إنشاء المؤتمر', 'Create conference')}
            </button>
          </form>
        </details>
      )}
      {researcher && (
        <form
          className="workspace-panel workspace-form"
          onSubmit={(e) =>
            run(e, (d) =>
              platformApi.post(
                `/conferences/${d.get('conference')}/participate`,
                d,
              ),
            )
          }
        >
          <h2>
            {t(
              'تقديم مشاركة أو إعادة إرسالها بعد التعديل',
              'Submit or resubmit a participation',
            )}
          </h2>
          <label>
            {t('المشارك', 'Participant')}
            <input value={user.full_name} readOnly />
          </label>
          <p>
            {t(
              'المدرسة والمديرية تؤخذان من بيانات حسابك المعتمدة.',
              'School and directorate use your approved account affiliation.',
            )}
          </p>
          <label>
            {t('المؤتمر', 'Conference')}
            <select name="conference" required defaultValue="">
              <option value="">—</option>
              {conferences.data?.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('عنوان المشاركة', 'Participation title')}
            <input name="title" required minLength={2} maxLength={500} />
          </label>
          <label>
            {t('ملخص المشاركة', 'Participation abstract')}
            <textarea
              name="abstract"
              required
              minLength={2}
              maxLength={12000}
            />
          </label>
          <label>
            {t('عرض PowerPoint حتى 25MB', 'PowerPoint up to 25MB')}
            <input name="file" type="file" accept=".ppt,.pptx" required />
          </label>
          <button disabled={busy}>
            {t('إرسال المشاركة', 'Submit participation')}
          </button>
        </form>
      )}
      <div className="conference-grid">
        {conferences.data?.map((c) => (
          <article key={c.id} className="workspace-card">
            <small>{c.category}</small>
            <h2>{c.title}</h2>
            <p>{c.venue}</p>
            <p>
              {new Date(c.starts_at).toLocaleString()} —{' '}
              {new Date(c.ends_at).toLocaleString()}
            </p>
            <p>
              {t('آخر موعد', 'Deadline')}:{' '}
              {new Date(c.deadline).toLocaleString()}
            </p>
            {scientific && (
              <form
                className="workspace-form"
                onSubmit={(e) =>
                  run(e, (d) =>
                    platformApi.post(`/conferences/${c.id}/notices`, {
                      text: d.get('text'),
                    }),
                  )
                }
              >
                <label>
                  {t(
                    'تبليغ جميع المشاركين داخل المنصة',
                    'Notify all participants in the platform',
                  )}
                  <textarea
                    name="text"
                    minLength={2}
                    maxLength={4000}
                    required
                  />
                </label>
                <button disabled={busy}>
                  {t('إرسال التبليغ', 'Send notice')}
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
      <h2>{t('المشاركات', 'Participations')}</h2>
      {participations.data?.length === 0 && (
        <p>
          {t(
            'لا توجد مشاركات ضمن صلاحياتك بعد.',
            'No participations in your scope yet.',
          )}
        </p>
      )}
      <div className="conference-grid">
        {participations.data?.map((p) => (
          <article className="workspace-card" key={p.id}>
            <h3>{p.title}</h3>
            <p>
              {p.researcher} ·{' '}
              {t(
                {
                  submitted: 'مُرسلة',
                  approved: 'مقبولة',
                  rejected: 'مرفوضة',
                  revision_requested: 'تحتاج تعديل',
                }[p.status] || p.status,
                p.status,
              )}
            </p>
            <p>{p.abstract}</p>
            <p>{p.notes}</p>
            <a href={p.url} target="_blank" rel="noreferrer">
              {t('فتح عرض المشاركة', 'Open presentation')} ↗
            </a>
            {scientific && (
              <form
                className="workspace-form"
                onSubmit={(e) =>
                  run(e, (d) =>
                    platformApi.put(
                      `/participations/${p.id}`,
                      Object.fromEntries(d),
                    ),
                  )
                }
              >
                <label>
                  {t('القرار', 'Decision')}
                  <select name="status">
                    <option value="approved">{t('قبول', 'Approve')}</option>
                    <option value="revision_requested">
                      {t('طلب تعديل', 'Request revision')}
                    </option>
                    <option value="rejected">{t('رفض', 'Reject')}</option>
                  </select>
                </label>
                <label>
                  {t('الملاحظات', 'Notes')}
                  <textarea
                    name="notes"
                    required
                    minLength={2}
                    maxLength={12000}
                  />
                </label>
                <button disabled={busy}>
                  {t('حفظ وتبليغ المشارك', 'Save and notify participant')}
                </button>
              </form>
            )}
          </article>
        ))}
      </div>
      <section className="workspace-panel">
        <h2>{t('تبليغاتي', 'My notices')}</h2>
        {notices.data?.map((n) => (
          <p key={n.id}>
            {n.text} <small>{new Date(n.created_at).toLocaleString()}</small>
          </p>
        ))}
        {notices.data?.length === 0 && (
          <p>{t('لا توجد تبليغات جديدة', 'No notices yet')}</p>
        )}
      </section>
    </section>
  )
}
