import ConferenceWorkspace from '../Conference/ConferenceWorkspace.jsx'
import { useCallback, useEffect, useState } from 'react'
import { useLocation } from '../../routing/useLocation.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { navigate } from '../../routing/navigation.js'
import { researcherApi } from '../../features/researcher/researcherApi.js'
import {
  decisionStatuses,
  researchSections,
  workspaceSection,
} from '../../features/researcher/workspaceSections.js'
import WorkspaceHub from './components/WorkspaceHub.jsx'
import ResearchEditor from './components/ResearchEditor.jsx'
import './ResearcherWorkspace.css'

export default function ResearcherWorkspace({
  user,
  data,
  isArabic,
  dir,
  affiliation,
  renderResearch,
  onRefresh,
}) {
  const { hash } = useLocation()
  const section = workspaceSection(hash)
  const [records, setRecords] = useState(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const reload = useCallback(async () => {
    setError('')
    try {
      setRecords(await researcherApi.overview())
    } catch (err) {
      setError(err.message)
    }
  }, [])
  useEffect(() => {
    let active = true
    researcherApi
      .overview()
      .then((value) => {
        if (active) setRecords(value)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => {
      active = false
    }
  }, [])
  const t = (ar, en) => (isArabic ? ar : en)
  const researching = [
    'research',
    'new',
    'drafts',
    'decisions',
    'tracking',
  ].includes(section)
  const titles = {
    practices: t('ممارساتي', 'My practices'),
    'new-practice': t('ممارسة جديدة', 'New practice'),
    conference: t('مشاركاتي في المؤتمر', 'Conference participations'),
    home: t('مساحة عمل الباحث / المعلم', 'Teacher / Researcher Workspace'),
    research: t('بحوثي', 'My research'),
    new: t('بحث جديد', 'New research'),
    drafts: t('مسوداتي', 'My drafts'),
    decisions: t('القرارات والملاحظات', 'Decisions & feedback'),
    tracking: t('متابعة التحكيم', 'Track review'),
    training: t('تقدّمي في التدريب', 'My training progress'),
    certificates: t('شهاداتي', 'My certificates'),
  }
  const items = (data.submissions || [])
    .filter((item) => item.publication_type !== 'practice')
    .filter(
      (item) =>
        section !== 'decisions' || decisionStatuses.includes(item.status),
    )
    .filter((item) => filter === 'all' || item.status === filter)
  return (
    <section className="workspace-page researcher-workspace" dir={dir}>
      <header className="workspace-hero">
        <span>PARP / {t('مساحة العمل', 'WORKSPACE')}</span>
        <h1>{titles[section]}</h1>
        <p>
          {t(
            'كل خطوة في رحلتك البحثية، في مكانها.',
            'Every step of your research journey, in one place.',
          )}
        </p>
      </header>
      {section !== 'home' && (
        <nav
          className="researcher-breadcrumb"
          aria-label={t('مسار الصفحة', 'Breadcrumb')}
        >
          <RouteLink to="/workspace">{t('مساحة العمل', 'Workspace')}</RouteLink>
          {researching && (
            <RouteLink to="/workspace#research">
              {t('البحوث', 'Research')}
            </RouteLink>
          )}
        </nav>
      )}
      {error && (
        <div role="alert" className="workspace-error">
          {error}{' '}
          <button onClick={reload}>{t('إعادة المحاولة', 'Retry')}</button>
        </div>
      )}
      {section === 'home' && (
        <>
          <WorkspaceHub
            role={data.role}
            name={user.full_name}
            isArabic={isArabic}
          />
          <details className="researcher-affiliation">
            <summary>
              {t(
                'بيانات المدرسة والمديرية والاعتماد',
                'School, directorate and approval details',
              )}
            </summary>
            {affiliation}
          </details>
        </>
      )}
      {researching && (
        <nav
          className="researcher-tiles"
          aria-label={t('أقسام البحوث', 'Research sections')}
        >
          {researchSections.map((item, index) => (
            <RouteLink
              className={section === item.id ? 'is-active' : ''}
              key={item.id}
              to={`/workspace#${item.id}`}
              aria-current={section === item.id ? 'page' : undefined}
              onClick={() => {
                setSelected(null)
                setFilter('all')
              }}
            >
              <span className="researcher-tiles__icon" aria-hidden="true">
                {['＋', '▤', '✓', '◷'][index]}
              </span>
              <span>{isArabic ? item.ar : item.en}</span>
            </RouteLink>
          ))}
        </nav>
      )}
      {section === 'conference' && <ConferenceWorkspace />}
      {section === 'practices' && (
        <>
          <RouteLink className="workspace-link" to="/workspace#new-practice">
            {t('＋ ممارسة جديدة', '＋ New practice')}
          </RouteLink>
          <p>
            {t(
              'النشر والقراءة مجانيان بعد موافقة لجنة تقييم الأبحاث.',
              'Publication and reading are free after research evaluation approval.',
            )}
          </p>
          <div className="workspace-list">
            {(data.submissions || [])
              .filter((item) => item.publication_type === 'practice')
              .map((item) => (
                <div key={item.id}>{renderResearch(item)}</div>
              ))}
          </div>
          <RouteLink to="/workspace#drafts">
            {t('مسودات الممارسات والأبحاث', 'Practice and research drafts')}
          </RouteLink>
        </>
      )}
      {section === 'new-practice' && (
        <ResearchEditor
          key="practice"
          kind="practice"
          isArabic={isArabic}
          onSaved={reload}
          onSubmitted={async () => {
            await onRefresh()
            reload()
            navigate('/workspace#practices')
          }}
        />
      )}
      {section === 'research' && (
        <p className="researcher-empty">
          {t(
            'ابدأ بحثًا جديدًا، أو اختر قسمًا لمتابعة أبحاثك الحالية.',
            'Start a new study or select a section to continue your research.',
          )}
        </p>
      )}
      {section === 'new' && (
        <ResearchEditor
          key="new"
          isArabic={isArabic}
          onSaved={() => reload()}
          onSubmitted={async () => {
            await onRefresh()
            await reload()
            navigate('/workspace#tracking')
          }}
        />
      )}
      {section === 'drafts' && (
        <>
          {!records && !error && (
            <p role="status">{t('جارٍ تحميل المسودات…', 'Loading drafts…')}</p>
          )}
          {selected ? (
            <ResearchEditor
              key={selected.id}
              draft={selected}
              isArabic={isArabic}
              onSaved={(saved) => {
                setSelected(saved)
                reload()
              }}
              onSubmitted={async () => {
                setSelected(null)
                await reload()
                await onRefresh()
                navigate('/workspace#tracking')
              }}
            />
          ) : (
            <div className="workspace-list">
              {records?.drafts.map((draft) => (
                <article className="workspace-card" key={draft.id}>
                  <h2>
                    {draft.content.title ||
                      t('مسودة بدون عنوان', 'Untitled draft')}
                  </h2>
                  <p>{draft.content.research_field}</p>
                  <small>
                    {t('آخر حفظ: ', 'Last saved: ')}
                    {new Date(draft.updated_at).toLocaleString(
                      isArabic ? 'ar-PS' : 'en-GB',
                    )}
                  </small>
                  <button onClick={() => setSelected(draft)}>
                    {t('تحرير وإرسال', 'Edit & submit')}
                  </button>
                </article>
              ))}
              {records?.drafts.length === 0 && (
                <p className="researcher-empty">
                  {t(
                    'لا توجد مسودات بعد. ابدأ من بحث جديد واحفظ مسودتك.',
                    'No drafts yet. Start new research and save a draft.',
                  )}
                </p>
              )}
            </div>
          )}
        </>
      )}
      {['decisions', 'tracking'].includes(section) && (
        <>
          <label className="researcher-filter">
            {t('حالة البحث', 'Research status')}
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">{t('الكل', 'All')}</option>
              {[
                ['submitted', 'مُرسل'],
                ['under_review', 'قيد التحكيم'],
                ['revision_requested', 'طلب تعديلات'],
                ['approved', 'مقبول'],
                ['rejected', 'مرفوض'],
                ['practice_suggested', 'مقترح كممارسة'],
                ['published', 'منشور'],
              ]
                .filter(
                  ([key]) =>
                    section !== 'decisions' || decisionStatuses.includes(key),
                )
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {isArabic ? label : key.replaceAll('_', ' ')}
                  </option>
                ))}
            </select>
          </label>
          <div className="workspace-list">
            {items.map((item) => (
              <div key={item.id}>
                {section === 'tracking' && (
                  <ol
                    className="researcher-progress"
                    aria-label={t('مراحل البحث', 'Research stages')}
                  >
                    {[
                      t('تم الإرسال', 'Submitted'),
                      t('التحكيم', 'Review'),
                      t('قرار اللجنة', 'Decision'),
                      t('النشر', 'Publication'),
                    ].map((label, i) => {
                      const active =
                        item.status === 'submitted'
                          ? 0
                          : item.status === 'under_review'
                            ? 1
                            : item.status === 'published'
                              ? 3
                              : 2
                      return (
                        <li
                          key={i}
                          className={i <= active ? 'is-reached' : ''}
                          aria-current={i === active ? 'step' : undefined}
                        >
                          {label}
                        </li>
                      )
                    })}
                  </ol>
                )}
                {renderResearch(item)}
              </div>
            ))}
            {!items.length && (
              <p className="researcher-empty">
                {t(
                  'لا توجد أبحاث ضمن هذا القسم حاليًا.',
                  'No research in this section yet.',
                )}
              </p>
            )}
          </div>
        </>
      )}
      {['training', 'certificates'].includes(section) && !records && !error && (
        <p role="status">{t('جارٍ التحميل…', 'Loading…')}</p>
      )}
      {section === 'training' && records && (
        <div className="researcher-records">
          {records.training.map((course) => (
            <article className="workspace-card" key={course.id}>
              <h2>{course.title}</h2>
              <p>
                {course.completed} / {course.total}{' '}
                {t('وحدة مكتملة', 'units completed')}
              </p>
              <progress
                value={course.completed}
                max={course.total}
                aria-label={course.title}
              />
              <strong>
                {Math.round((course.completed / course.total) * 100)}%
              </strong>
            </article>
          ))}
          {!records.training.length && (
            <p className="researcher-empty">
              {t(
                'لم تُسجل لك تدريبات بعد. سيظهر تقدمك هنا عندما تُضاف سجلات التدريب المعتمدة.',
                'No training records yet. Your progress will appear when authorized training records are added.',
              )}
            </p>
          )}
          <RouteLink to="/training">
            {t('استكشف التدريب', 'Explore training')} ↗
          </RouteLink>
        </div>
      )}
      {section === 'certificates' && records && (
        <div className="researcher-records">
          {records.certificates.map((cert) => (
            <article
              className="workspace-card researcher-certificate"
              key={cert.id}
            >
              <span aria-hidden="true">✧</span>
              <h2>{cert.title}</h2>
              <p>{cert.issuer}</p>
              <time dateTime={cert.issued_at}>
                {new Date(cert.issued_at).toLocaleDateString(
                  isArabic ? 'ar-PS' : 'en-GB',
                )}
              </time>
              <a href={cert.url} target="_blank" rel="noreferrer">
                {t('فتح الشهادة PDF', 'Open PDF certificate')} ↗
              </a>
            </article>
          ))}
          {!records.certificates.length && (
            <p className="researcher-empty">
              {t(
                'لا توجد شهادات صادرة باسمك بعد.',
                'No certificates have been issued to you yet.',
              )}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
