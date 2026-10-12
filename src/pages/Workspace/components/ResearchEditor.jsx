import { useEffect, useState } from 'react'
import { researcherApi } from '../../../features/researcher/researcherApi.js'
const fields = [
  ['title', 'عنوان البحث', 'Research title', 500], ['research_field', 'مجال البحث', 'Research field', 150],
  ['problem', 'المشكلة', 'Problem'], ['research_question', 'سؤال البحث', 'Research question'], ['intervention', 'التدخل', 'Intervention'],
  ['abstract', 'الملخص (مطلوب عند الإرسال)', 'Abstract (required for submission)'], ['results', 'النتائج', 'Results'], ['recommendations', 'التوصيات', 'Recommendations'], ['keywords', 'الكلمات المفتاحية (بفواصل)', 'Keywords (comma separated)', 2000],
]
export default function ResearchEditor({ draft, isArabic, onSaved, onSubmitted, kind = 'research' }) {
  const [record, setRecord] = useState(draft)
  const [content, setContent] = useState(draft?.content || { kind })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    if (!dirty) return
    const warn = (event) => { event.preventDefault(); event.returnValue = '' }
    const guard = (event) => {
      if (event.target.closest('a[href]') && !window.confirm(isArabic ? 'لديك تعديلات غير محفوظة. هل تريد المغادرة؟' : 'You have unsaved changes. Leave this page?')) { event.preventDefault(); event.stopPropagation() }
    }
    document.addEventListener('click', guard, true)
    window.addEventListener('beforeunload', warn)
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', guard, true) }
  }, [dirty, isArabic])
  async function save(submit = false) {
    if (busy) return
    if (submit && file?.size > 25 * 1024 * 1024) { setError(isArabic ? 'الحد الأقصى للملف 25MB.' : 'Maximum file size is 25MB.'); return }
    setBusy(true); setError(''); setMessage('')
    try {
      const saved = record ? await researcherApi.save(record.id, content, record.revision) : await researcherApi.create(content)
      setRecord(saved); setDirty(false); onSaved(saved)
      if (submit) {
        if (!file) throw new Error(isArabic ? 'اختاري ملف البحث قبل الإرسال.' : 'Choose a research file before submitting.')
        await researcherApi.submit(saved.id, saved.revision, file)
        onSubmitted()
      } else setMessage(isArabic ? 'تم حفظ النصوص كمسودة في حسابك.' : 'Draft text saved to your account.')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <section className="workspace-panel"><h2>{isArabic ? (record ? 'تحرير المسودة' : (kind === 'practice' ? 'ممارسة جديدة' : 'ابدأ بحثًا جديدًا')) : (record ? 'Edit draft' : (kind === 'practice' ? 'New practice' : 'Start new research'))}</h2>
    <p className="researcher-muted">{isArabic ? 'احفظ أفكارك الآن، وأكملها لاحقًا. يرفق ملف البحث عند الإرسال للتحكيم؛ حفظ المسودة يحفظ النصوص فقط.' : 'Save your ideas and return later. Attach the research file when submitting; draft saves preserve text only.'}</p>
    <form className="workspace-form" onSubmit={(event) => { event.preventDefault(); save(true) }}>
      {fields.map(([key, ar, en, max]) => <label key={key}>{isArabic ? ar : en}{max ? <input value={content[key] || ''} maxLength={max} onChange={(e) => { setContent({ ...content, [key]: e.target.value }); setDirty(true) }} /> : <textarea value={content[key] || ''} maxLength={12000} onChange={(e) => { setContent({ ...content, [key]: e.target.value }); setDirty(true) }} />}</label>)}
      <label>{isArabic ? 'ملف البحث PDF أو Word — حتى 25MB' : 'Research PDF or Word — up to 25MB'}<input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0] || null)} /></label>
      <div className="researcher-editor-actions"><button type="button" disabled={busy} onClick={() => save(false)}>{isArabic ? 'حفظ مسودة' : 'Save draft'}</button><button disabled={busy || !file || ['title', 'research_field', 'problem', 'abstract'].some(k => (content[k] || '').trim().length < 2)}>{isArabic ? 'إرسال للتحكيم' : 'Submit for review'}</button></div>
    </form>
    {message && <p role="status" className="workspace-message">{message}</p>}{error && <p role="alert" className="workspace-error">{error}</p>}
  </section>
}
