import { useState } from 'react'
import { workflowApi } from '../../../features/workflow/workflowApi.js'
export default function RevisionEditor({ item, isArabic, onRefresh }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault(); if (busy) return
    setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const fields = Object.fromEntries([...form.entries()].filter(([key]) => key !== 'file'))
    fields.keywords = fields.keywords.split(',').map(s => s.trim()).filter(Boolean)
    const body = new FormData(); body.append('file', form.get('file')); body.append('form_json', JSON.stringify(fields))
    try { await workflowApi.resubmitResearch(item.id, body); await onRefresh() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <details className="researcher-revision"><summary>{isArabic ? 'تعديل البحث وإعادة إرساله للتحكيم' : 'Revise and resubmit for review'}</summary><form className="workspace-form" onSubmit={submit}>
    {[['title','العنوان','Title',500],['research_field','المجال','Field',150],['problem','المشكلة','Problem'],['research_question','سؤال البحث','Research question'],['intervention','التدخل','Intervention'],['abstract','الملخص','Abstract'],['results','النتائج','Results'],['recommendations','التوصيات','Recommendations']].map(([key, ar, en, max]) => <label key={key}>{isArabic ? ar : en}{max ? <input name={key} defaultValue={item[key] || ''} maxLength={max} required minLength={2} /> : <textarea name={key} defaultValue={item[key] || ''} maxLength={12000} required={key === 'problem'} minLength={key === 'problem' ? 2 : undefined} />}</label>)}
    <label>{isArabic ? 'الكلمات المفتاحية' : 'Keywords'}<input name="keywords" defaultValue={(item.keywords || []).join(', ')} maxLength={2000} /></label>
    <label>{isArabic ? 'الملف المعدّل PDF/Word' : 'Revised PDF/Word'}<input name="file" type="file" accept=".pdf,.doc,.docx" required /></label><button disabled={busy}>{isArabic ? 'إعادة الإرسال' : 'Resubmit'}</button>
    {error && <p role="alert" className="workspace-error">{error}</p>}
  </form></details>
}
