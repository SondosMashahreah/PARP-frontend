import { useEffect, useMemo, useState } from 'react'
import { researcherApi } from '../../../features/researcher/researcherApi.js'
import { workflowApi } from '../../../features/workflow/workflowApi.js'
import { ACTION_RESEARCH_SECTIONS, prepareContent, requiredMissing, STANDARD_VERSION } from '../../../features/researcher/actionResearchStandard.js'
import RegisteredResearchersField from './RegisteredResearchersField.jsx'
import './ActionResearchEditor.css'

const RECORD_TEMPLATES = {
  researchers: { full_name: '', school: '', directorate: '' },
  steps: { objective: '', activity: '', date: '', assessment_tool: '' },
  instruments: { name: '', stage: '', description: '' },
}
const GROUP_LABELS = {
  researchers: [['full_name', 'الاسم الكامل', 'Full name'], ['school', 'المدرسة', 'School'], ['directorate', 'المديرية', 'Directorate']],
  steps: [['objective', 'الهدف', 'Objective'], ['activity', 'الإجراء أو النشاط', 'Activity / action'], ['date', 'التاريخ', 'Date'], ['assessment_tool', 'أداة التقييم', 'Assessment tool']],
  instruments: [['name', 'اسم الأداة', 'Instrument name'], ['stage', 'المرحلة (قبلي / أثناء / بعدي)', 'Stage (pre / during / post)'], ['description', 'وصف الأداة', 'Description']],
}

function ListField({ value, onChange, label, isArabic }) {
  const values = Array.isArray(value) ? value : []
  return <div className="ards-repeatable" role="group" aria-label={label}>
    {values.map((item, index) => <div className="ards-repeatable__row" key={index}>
      <input aria-label={`${label} ${index + 1}`} value={item || ''} maxLength={12000}
        onChange={(e) => onChange(values.map((x, i) => i === index ? e.target.value : x))} />
      <button type="button" className="ards-quiet" aria-label={`${isArabic ? 'حذف' : 'Remove'} ${index + 1}`} onClick={() => onChange(values.filter((_, i) => index !== i))}>×</button>
    </div>)}
    <button type="button" className="ards-add" onClick={() => onChange([...values, ''])}>＋ {isArabic ? 'إضافة عنصر' : 'Add item'}</button>
  </div>
}

function GroupField({ type, value, onChange, isArabic, title }) {
  const values = Array.isArray(value) ? value : []
  const labels = GROUP_LABELS[type]
  return <div className="ards-repeatable" role="group" aria-label={title}>
    {values.map((entry, index) => <div key={index} className="ards-entry">
      <div className="ards-entry__heading"><strong>{title} {index + 1}</strong><button type="button" className="ards-quiet" disabled={type === 'researchers' && values.length === 1} onClick={() => onChange(values.filter((_, i) => index !== i))}>{isArabic ? 'إزالة' : 'Remove'}</button></div>
      <div className="ards-entry__grid">{labels.map(([key, ar, en]) => <label key={key}>
        <span>{isArabic ? ar : en}{type === 'researchers' ? ' *' : ''}</span>
        <input type={type === 'steps' && key === 'date' ? 'date' : 'text'}
          value={entry?.[key] || ''} maxLength={key === 'activity' || key === 'description' ? 4000 : 300}
          onChange={(e) => onChange(values.map((row, i) => i === index ? { ...row, [key]: e.target.value } : row))} />
      </label>)}</div>
    </div>)}
    <button type="button" className="ards-add" onClick={() => onChange([...values, { ...RECORD_TEMPLATES[type] }])}>＋ {isArabic ? 'إضافة' : 'Add'} {title}</button>
  </div>
}

function FieldControl({ field, value, onChange, isArabic }) {
  const label = isArabic ? field.ar : field.en
  const id = `ards-${field.key}`
  const common = { id, value: value ?? '', onChange: (event) => onChange(event.target.value), maxLength: field.type === 'long' ? 12000 : field.key === 'title' || field.key === 'title_en' ? 500 : field.key === 'keywords' ? 2000 : ['research_field', 'subject_area'].includes(field.key) ? 150 : field.key === 'academic_year' ? 30 : 300 }
  return <div className={`ards-field ards-field--${field.type}`}>
    <label htmlFor={['list', 'researchers', 'steps', 'instruments'].includes(field.type) ? undefined : id} className="ards-field__label">{label}{field.required && <span className="ards-required" aria-label={isArabic ? 'إلزامي' : 'Required'}> *</span>}</label>
    {field.type === 'long' ? <textarea {...common} rows={5} />
      : field.type === 'select' ? <select id={id} value={value || ''} onChange={common.onChange}><option value="">—</option>{field.options.map(([v, ar, en]) => <option key={v} value={v}>{isArabic ? ar : en}</option>)}</select>
        : field.type === 'number' ? <input id={id} type="number" min="1" step="1" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
          : field.type === 'date' ? <input id={id} type="date" value={value || ''} onChange={common.onChange} />
            : field.type === 'list' ? <ListField label={label} value={value} onChange={onChange} isArabic={isArabic} />
              : field.type === 'researchers' ? <RegisteredResearchersField value={value} onChange={onChange} isArabic={isArabic} />
                : ['steps', 'instruments'].includes(field.type) ? <GroupField type={field.type} title={label} value={value} onChange={onChange} isArabic={isArabic} />
                : <input {...common} type="text" />}
  </div>
}

/** Same editor for new drafts and revised, already-submitted ARDS research. */
export default function ActionResearchEditor({ draft, submission, isArabic, onSaved, onSubmitted, onRefresh }) {
  const [record, setRecord] = useState(draft || null)
  const [content, setContent] = useState(() => prepareContent({
    ...(!draft && !submission ? { researchers_mode: 'linked' } : {}),
    ...(submission?.standard_data || draft?.content || {}),
  }))
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  const [affiliationNotice, setAffiliationNotice] = useState('')
  const t = (ar, en) => isArabic ? ar : en
  const section = ACTION_RESEARCH_SECTIONS[step]
  const missing = useMemo(() => requiredMissing(content), [content])
  const complete = ACTION_RESEARCH_SECTIONS.filter((part) => !part.fields.some((f) => missing.some((m) => m.key === f.key))).length
  const isRevision = Boolean(submission)

  // New studies begin with the currently logged-in researcher, if approved.
  useEffect(() => {
    if (draft || submission) return undefined
    let alive = true
    researcherApi.myResearcherProfile().then((response) => {
      if (!alive) return
      if (!response.researcher) {
        setAffiliationNotice('unavailable')
        return
      }
      setContent((previous) => {
        const rows = previous.researchers || []
        if (rows.length !== 1 || rows[0]?.user_id || rows[0]?.full_name?.trim()) return previous
        return { ...previous, researchers: [response.researcher] }
      })
    }).catch(() => { if (alive) setAffiliationNotice('unavailable') })
    return () => { alive = false }
  }, [draft, submission])

  useEffect(() => {
    if (!dirty) return
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    const guard = (e) => {
      if (e.target.closest('a[href]') && !window.confirm(isArabic ? 'لديك تعديلات غير محفوظة. هل تريد المغادرة؟' : 'You have unsaved changes. Leave?')) {
        e.preventDefault(); e.stopPropagation()
      }
    }
    document.addEventListener('click', guard, true)
    window.addEventListener('beforeunload', warn)
    return () => { document.removeEventListener('click', guard, true); window.removeEventListener('beforeunload', warn) }
  // Translation is derived only from the stable isArabic prop.
  }, [dirty, isArabic])

  function update(key, value) { setContent((previous) => ({ ...previous, [key]: value, ...(key === 'researchers' && value.some((item) => item.user_id) ? { researchers_mode: 'linked' } : {}) })); setDirty(true); setMessage('') }
  function goTo(next) { setStep(next); setError(''); setMessage('') }

  async function save(submit = false) {
    if (busy) return
    if (submit && missing.length) {
      const first = missing[0]
      setStep(ACTION_RESEARCH_SECTIONS.findIndex((item) => item.key === first.section))
      setError(t(`يرجى استكمال: ${first.ar}`, `Please complete: ${first.en}`))
      return
    }
    if (submit && (!file || file.size > 25 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(file.name))) {
      setError(t('أرفقي ملف PDF أو Word بحجم لا يتجاوز 25MB.', 'Attach a PDF or Word file up to 25MB.'))
      setStep(ACTION_RESEARCH_SECTIONS.length - 1)
      return
    }
    setBusy(true); setError(''); setMessage('')
    try {
      if (isRevision) {
        if (!submit) { setError(t('إعادة إرسال التعديلات تتطلب ملفًا جديدًا.', 'Revisions require a new research file.')); return }
        const body = new FormData()
        body.append('file', file)
        body.append('form_json', JSON.stringify(content))
        await workflowApi.resubmitResearch(submission.id, body)
        setDirty(false)
        await onRefresh?.()
        await onSubmitted?.()
        return
      }
      const next = record
        ? await researcherApi.save(record.id, content, record.revision)
        : await researcherApi.create(content)
      setRecord(next)
      setDirty(false)
      await onSaved?.(next)
      if (submit) {
        await researcherApi.submit(next.id, next.revision, file)
        await onSubmitted?.()
      } else setMessage(t('تم حفظ المسودة بنجاح. يمكنك العودة وإكمالها لاحقًا.', 'Draft saved. You can return to it later.'))
    } catch (err) { setError(err.message || t('تعذر الحفظ', 'Could not save')) }
    finally { setBusy(false) }
  }

  return <section className="workspace-panel ards-editor" dir={isArabic ? 'rtl' : 'ltr'}>
    <header className="ards-header">
      <div><span className="ards-eyebrow">PARP / {STANDARD_VERSION}</span>
        <h2>{isRevision ? t('تعديل البحث الإجرائي', 'Revise action research') : record ? t('تحرير البحث الإجرائي', 'Edit action research') : t('بحث إجرائي جديد', 'New action research')}</h2>
        <p>{t('نموذج موحّد ثنائي اللغة؛ الحقول ذات النجمة إلزامية عند إرسال البحث للتحكيم.', 'Bilingual standard form; fields marked * are required on submission.')}</p>
      </div>
      <div className="ards-progress" aria-label={t('الأقسام المكتملة', 'Completed sections')}><strong>{complete} / 9</strong><span>{t('أقسام مكتملة', 'Sections completed')}</span></div>
    </header>
    <div className="ards-progressbar" role="progressbar" aria-valuenow={complete} aria-valuemin={0} aria-valuemax={9} aria-label={t('تقدّم البحث', 'Research completion')}><span style={{ width: `${complete / 9 * 100}%` }} /></div>
    <div className="ards-layout">
      <nav className="ards-steps" aria-label={t('أقسام الستاندر', 'Standard sections')}>
        {ACTION_RESEARCH_SECTIONS.map((part, index) => {
          const incomplete = part.fields.some((f) => missing.some((m) => m.key === f.key))
          return <button type="button" key={part.key} className={`ards-step${step === index ? ' is-current' : ''}`} aria-current={step === index ? 'step' : undefined} onClick={() => goTo(index)}>
            <span className="ards-step__number">{String(index + 1).padStart(2, '0')}</span>
            <span>{isArabic ? part.ar : part.en}</span>
            <span className="ards-step__mark" aria-hidden="true">{incomplete ? '○' : '✓'}</span>
          </button>
        })}
      </nav>
      <div className="ards-content">
        <div className="ards-section-head"><small>{t('القسم', 'SECTION')} {String(step + 1).padStart(2, '0')} / 09</small>
          <h3>{isArabic ? section.ar : section.en}</h3><p>{isArabic ? section.descriptionAr : section.descriptionEn}</p></div>
        <form onSubmit={(e) => { e.preventDefault(); save(true) }}>
          {step === 0 && affiliationNotice && <p className="ards-researcher__warning" role="status">{
            t('تعذّر العثور على ارتباط مدرستك ومديريتك المعتمد. راجعي بيانات ارتباط حسابك، ثم اختاري الباحث من القائمة بعد اعتمادها.',
              'Your account has no approved school/directorate profile. Update your affiliation before submission.')
          }</p>}
          <div className="ards-fields">{section.fields.map((field) => <FieldControl key={field.key} field={field} value={content[field.key]} onChange={(value) => update(field.key, value)} isArabic={isArabic} />)}</div>
          {step === 8 && <div className="ards-upload">
            <label htmlFor="ards-research-file">{t('ملف البحث الأصلي (PDF أو Word، بحد أقصى 25MB)', 'Original research file (PDF or Word, max 25MB)')}</label>
            <input id="ards-research-file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0] || null)} />
            <p>{t('رفع الملف إلزامي عند الإرسال، ولا يتم تخزينه عند حفظ المسودة.', 'File upload is required to submit; saving a draft does not upload a file.')}</p>
          </div>}
          {error && <p className="workspace-error" role="alert">{error}</p>}
          {message && <p className="workspace-message" role="status">{message}</p>}
          <div className="ards-actions">
            <button type="button" className="ards-secondary" disabled={step === 0 || busy} onClick={() => goTo(step - 1)}>{t('السابق', 'Previous')}</button>
            {!isRevision && <button type="button" className="ards-secondary" disabled={busy} onClick={() => save(false)}>{busy ? t('جارٍ الحفظ…', 'Saving…') : t('حفظ المسودة', 'Save draft')}</button>}
            {step < 8 ? <button type="button" disabled={busy} onClick={() => goTo(step + 1)}>{t('التالي', 'Next')}</button>
              : <button type="submit" disabled={busy}>{busy ? t('جارٍ الإرسال…', 'Submitting…') : isRevision ? t('إعادة الإرسال للتحكيم', 'Resubmit for review') : t('إرسال للتحكيم', 'Submit for review')}</button>}
          </div>
        </form>
      </div>
    </div>
  </section>
}
