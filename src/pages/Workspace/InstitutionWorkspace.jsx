import { useState } from 'react'
import { usePlatformData } from '../../features/platform/usePlatformData.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useAuth } from '../../features/auth/useAuth.js'
import './InstitutionWorkspace.css'
export default function InstitutionWorkspace() {
  const { data, error, reload } = usePlatformData('/statistics'),
    { isArabic } = useLanguage(),
    { user } = useAuth(),
    t = (a, e) => (isArabic ? a : e)
  const [directorate, setDirectorate] = useState(''),
    [school, setSchool] = useState('')
  if (error)
    return (
      <p role="alert">
        {error} <button onClick={reload}>{t('إعادة المحاولة', 'Retry')}</button>
      </p>
    )
  if (!data)
    return (
      <p role="status">{t('جارٍ تحميل الإحصائيات', 'Loading statistics')}</p>
    )
  const schools = data.schools.filter(
    (s) => !directorate || s.directorate_id === directorate,
  )
  const rows = data.research.filter(
    (r) =>
      (!directorate || r.directorate_id === directorate) &&
      (!school || r.school_id === school),
  )
  const participants = data.participations.filter(
    (r) =>
      (!directorate || r.directorate_id === directorate) &&
      (!school || r.school_id === school),
  )
  const total = data.totals.research + data.totals.practices,
    percent = total ? Math.round((data.totals.published / total) * 100) : 0
  return (
    <section className="institution-workspace">
      <h2>
        {user.role === 'school_manager'
          ? t('مدرستي ومشاركات المعلمين', 'My school and teacher participation')
          : t(
              'المديريات والمدارس المشاركة',
              'Directorates and participating schools',
            )}
      </h2>
      {user.role === 'school_manager' &&
        data.schools.map((s) => (
          <h3 key={s.id}>{isArabic ? s.name_ar : s.name_en}</h3>
        ))}
      <div className="institution-metrics">
        <div
          className="institution-donut"
          style={{ '--progress': `${percent}%` }}
        >
          <strong>{percent}%</strong>
          <span>{t('منشور', 'Published')}</span>
        </div>
        {[
          ['research', 'الأبحاث', 'Research'],
          ['practices', 'الممارسات', 'Practices'],
          ['researchers', 'الباحثون المشاركون', 'Participating researchers'],
          ['participations', 'مشاركات المؤتمر', 'Conference participations'],
        ].map(([k, a, e]) => (
          <article key={k}>
            <strong>{data.totals[k]}</strong>
            <span>{t(a, e)}</span>
          </article>
        ))}
      </div>
      <div className="workspace-form">
        {user.role === 'decision_maker' && (
          <label>
            {t('المديرية', 'Directorate')}
            <select
              value={directorate}
              onChange={(e) => {
                setDirectorate(e.target.value)
                setSchool('')
              }}
            >
              <option value="">{t('الكل', 'All')}</option>
              {data.directorates.map((d) => (
                <option key={d.id} value={d.id}>
                  {isArabic ? d.name_ar : d.name_en}
                </option>
              ))}
            </select>
          </label>
        )}
        {user.role !== 'school_manager' && (
          <label>
            {t('المدرسة', 'School')}
            <select value={school} onChange={(e) => setSchool(e.target.value)}>
              <option value="">{t('الكل', 'All')}</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {isArabic ? s.name_ar : s.name_en}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="institution-table">
        <table>
          <caption>
            {t(
              'الأبحاث والممارسات المقدّمة',
              'Submitted research and practices',
            )}
          </caption>
          <thead>
            <tr>
              {[
                t('المعلم', 'Teacher'),
                t('العنوان', 'Title'),
                t('الحالة', 'Status'),
                t('الملخص', 'Abstract'),
              ].map((h) => (
                <th scope="col" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.researcher_name}</td>
                <td>{r.title}</td>
                <td>
                  {t(
                    {
                      submitted: 'مقدّم',
                      under_review: 'قيد التقييم',
                      approved: 'مقبول',
                      rejected: 'مرفوض',
                      revision_requested: 'طلب تعديل',
                      practice_suggested: 'مقترح كممارسة',
                      published: 'منشور',
                    }[r.status] || r.status,
                    r.status,
                  )}
                </td>
                <td>
                  <details>
                    <summary>{t('عرض الملخص', 'Read abstract')}</summary>
                    {r.abstract ||
                      t(
                        'لم يُرفق ملخص لهذا السجل القديم',
                        'No abstract for this legacy record',
                      )}
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>{t('مشاركات المؤتمر', 'Conference participations')}</h3>
      {participants.map((p) => (
        <article className="workspace-card" key={p.id}>
          <h4>
            {p.researcher} — {p.title}
          </h4>
          <p>{p.abstract}</p>
          <a href={p.url} target="_blank" rel="noreferrer">
            {t('عرض المشاركة', 'Open presentation')} ↗
          </a>
        </article>
      ))}
      {!rows.length && !participants.length && (
        <p>
          {t(
            'لا توجد مشاركات ضمن النطاق المحدد. يجب اعتماد ارتباط حسابك بالمدرسة أو المديرية لعرض بياناتها.',
            'No participation in this scope. Your school or directorate affiliation must be approved to access its data.',
          )}
        </p>
      )}
    </section>
  )
}
