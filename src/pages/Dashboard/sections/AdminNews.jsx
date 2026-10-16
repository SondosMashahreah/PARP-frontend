import { useState } from 'react'
import { AdminPanel } from '../components/AdminUi.jsx'
import { newsApi } from '../../../features/news/newsApi.js'
import { useNews } from '../../../features/news/useNews.js'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import './AdminNews.css'
const empty = { title: '', title_en: '', excerpt: '', excerpt_en: '', body: '', body_en: '', category: 'أخبار المنصة', category_en: '', image_alt: '', published: false }
const fields = Object.keys(empty)
export default function AdminNews({ ar }) {
  const [offset, setOffset] = useState(0)
  const [revision, setRevision] = useState(0)
  const { data, loading, error: loadError } = useNews({ admin: true, offset, revision })
  const [editor, setEditor] = useState(null)
  const [file, setFile] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const t = (a, e) => ar ? a : e
  const refresh = () => setRevision(x => x + 1)
  function canLeave() { return !dirty || window.confirm(t('تجاهل التغييرات غير المحفوظة؟', 'Discard unsaved changes?')) }
  async function edit(id) {
    if (!canLeave()) return
    setError(''); setNotice(''); setBusy(true)
    try { setEditor(id ? await newsApi.detail(id, true) : { ...empty }); setFile(null); setDirty(false) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function save(publish) {
    if (!editor.title.trim() || !editor.body.trim() || !editor.category.trim()) { setError(t('أدخل عنوان الخبر وموضوعه وتصنيفه.', 'Enter a title, body and category.')); return }
    if (publish && !editor.image_url && !file) { setError(t('أضف صورة للخبر قبل نشره.', 'Add an image before publishing.')); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const payload = Object.fromEntries(fields.map(key => [key, editor[key] ?? empty[key]]))
      // Keep new records private until the image has uploaded successfully.
      payload.published = publish && Boolean(editor.image_url)
      let saved = await newsApi.save(editor.id, payload)
      setEditor(saved); setDirty(false); refresh()
      if (file) {
        saved = await newsApi.image(saved.id, file)
        setEditor(saved); setFile(null)
      }
      if (saved.published !== publish) {
        saved = await newsApi.save(saved.id, { ...payload, published: publish })
        setEditor(saved)
      }
      refresh(); setNotice(publish ? t('تم نشر الخبر، وأصبح متاحاً بالهوم وللزوار.', 'Published. The article is now available on Home and to guests.') : t('تم حفظ المسودة.', 'Draft saved.'))
    } catch (e) { setError(t('تعذر إكمال الحفظ: ', 'Could not complete saving: ') + e.message); refresh() }
    finally { setBusy(false) }
  }
  async function remove(row) {
    if (!window.confirm(t(`حذف الخبر «${row.title}» نهائياً؟`, `Permanently delete “${row.title}”?`))) return
    setBusy(true); setError('')
    try { await newsApi.delete(row.id); if (editor?.id === row.id) { setEditor(null); setDirty(false) }; setOffset(0); refresh() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  function input(key, label, multiline = false, maxLength = 300) {
    const props = { value: editor[key] || '', maxLength, onChange: e => { setEditor({ ...editor, [key]: e.target.value }); setDirty(true) }, required: ['title', 'body', 'category'].includes(key) }
    return <label>{label}{multiline ? <textarea {...props} rows={key.startsWith('body') ? 12 : 3} /> : <input {...props} />}</label>
  }
  return <AdminPanel title={t('إدارة الأخبار', 'Manage news')} eyebrow={t('محتوى المنصة', 'PLATFORM CONTENT')}>
    <div className="admin-news">
      <button disabled={busy} onClick={() => edit(null)}>{t('+ خبر جديد', '+ New article')}</button>
      {(error || loadError) && <p role="alert">{error || loadError} <button onClick={refresh}>{t('تحديث', 'Refresh')}</button></p>}
      {notice && <p role="status">{notice}</p>}
      {editor && <form onSubmit={e => { e.preventDefault(); save(true) }}>
        <fieldset disabled={busy}><legend>{editor.id ? t('تعديل الخبر', 'Edit article') : t('خبر جديد', 'New article')}</legend>
          {input('title', t('عنوان الخبر *', 'Title *'))}
          {input('category', t('التصنيف *', 'Category *'), false, 100)}
          {input('excerpt', t('ملخص قصير يظهر بالهوم', 'Short summary for Home'), true, 1000)}
          {input('body', t('موضوع الخبر كاملاً *', 'Full article *'), true, 100000)}
          {editor.image_url && <img className="admin-news__preview" src={editor.image_url} alt={editor.image_alt || editor.title} />}
          <label>{t('صورة الخبر — PNG / JPEG / WebP، حتى 5 MB', 'Article image — PNG / JPEG / WebP, up to 5 MB')}<input key={`${editor.id || 'new'}-${editor.image_url || ''}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={e => {
            const chosen = e.target.files?.[0] || null
            if (chosen && chosen.size > 5 * 1024 * 1024) { setError(t('حجم الصورة يجب ألا يتجاوز 5 MB.', 'Image must be 5 MB or smaller.')); e.target.value = ''; setFile(null); return }
            setFile(chosen); setDirty(true); setError('')
          }} /></label>
          {file && <p>{t('الصورة المختارة: ', 'Selected image: ')}{file.name}</p>}
          {input('image_alt', t('وصف الصورة', 'Image description'))}
          <details><summary>{t('الترجمة الإنجليزية (اختيارية)', 'English translation (optional)')}</summary>
            {input('title_en', 'English title')}{input('category_en', 'English category', false, 100)}{input('excerpt_en', 'English summary', true, 1000)}{input('body_en', 'English article', true, 100000)}
          </details>
          <div className="admin-news__actions"><button type="submit">{t('حفظ ونشر', 'Save and publish')}</button><button type="button" onClick={() => save(false)}>{editor.published ? t('إلغاء النشر وحفظ كمسودة', 'Unpublish and save draft') : t('حفظ كمسودة', 'Save draft')}</button><button type="button" onClick={() => { if (canLeave()) { setEditor(null); setFile(null); setDirty(false) } }}>{t('إغلاق', 'Close')}</button></div>
        </fieldset>
      </form>}
      {busy && <p role="status">{t('جاري الحفظ أو التحميل…', 'Saving or loading…')}</p>}
      {loading && <p role="status">{t('جاري تحميل الأخبار…', 'Loading news…')}</p>}
      {data?.total === 0 && <p>{t('لا توجد أخبار بعد. أضف الخبر الأول.', 'No articles yet. Add your first article.')}</p>}
      <div className="admin-news__list">{data?.items.map(row => <article key={row.id}>
        {row.image_url && <img src={row.image_url} alt="" />}
        <div><span>{row.published ? t('منشور', 'Published') : t('مسودة', 'Draft')}</span><h3>{row.title}</h3><p>{row.excerpt}</p>
          <div className="admin-news__actions"><button disabled={busy} onClick={() => edit(row.id)}>{t('تعديل', 'Edit')}</button><button disabled={busy} onClick={() => remove(row)}>{t('حذف', 'Delete')}</button>{row.published && <RouteLink to={`/news?article=${row.id}`}>{t('عرض الخبر', 'View article')}</RouteLink>}</div>
        </div>
      </article>)}</div>
      {data && <div className="admin-news__actions"><button disabled={busy || offset === 0} onClick={() => setOffset(Math.max(0, offset - 12))}>{t('السابق', 'Previous')}</button><span>{Math.floor(offset / 12) + 1}</span><button disabled={busy || offset + 12 >= data.total} onClick={() => setOffset(offset + 12)}>{t('التالي', 'Next')}</button></div>}
    </div>
  </AdminPanel>
}
