import { useState } from 'react'
import { AdminPanel } from '../components/AdminUi.jsx'
import { newsApi } from '../../../features/news/newsApi.js'
import { useNews } from '../../../features/news/useNews.js'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import './AdminNews.css'
import './AdminNewsGallery.css'
const empty = { title: '', title_en: '', excerpt: '', excerpt_en: '', body: '', body_en: '', category: 'أخبار المنصة', category_en: '', image_alt: '', published: false }
const fields = Object.keys(empty)
export default function AdminNews({ ar }) {
  const [offset, setOffset] = useState(0)
  const [revision, setRevision] = useState(0)
  const { data, loading, error: loadError } = useNews({ admin: true, offset, revision })
  const [editor, setEditor] = useState(null)
  const [files, setFiles] = useState([])
  const [replaceCover, setReplaceCover] = useState(false)
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
    try { setEditor(id ? await newsApi.detail(id, true) : { ...empty }); setFiles([]); setReplaceCover(false); setDirty(false) }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function save(publish) {
    if (!editor.title.trim() || !editor.body.trim() || !editor.category.trim()) { setError(t('أدخل عنوان الخبر وموضوعه وتصنيفه.', 'Enter a title, body and category.')); return }
    if (publish && !editor.image_url && !files.length) { setError(t('أضف صورة للخبر قبل نشره.', 'Add an image before publishing.')); return }
    setBusy(true); setError(''); setNotice('')
    try {
      const payload = Object.fromEntries(fields.map(key => [key, editor[key] ?? empty[key]]))
      // New records must get their cover before becoming public.
      payload.published = publish && Boolean(editor.image_url)
      let saved = await newsApi.save(editor.id, payload)
      setEditor(saved)
      for (let index = 0; index < files.length; index += 1) {
        // Existing articles append by default; opting in replaces the cover with the first file.
        const uploadCover = index === 0 && (!saved.image_url || replaceCover)
        saved = uploadCover
          ? await newsApi.image(saved.id, files[index])
          : await newsApi.addImage(saved.id, files[index])
        setEditor(saved)
      }
      setFiles([])
      setReplaceCover(false)
      if (saved.published !== publish) {
        saved = await newsApi.save(saved.id, { ...payload, published: publish })
        setEditor(saved)
      }
      setDirty(false)
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
  async function removeGalleryImage(imageId) {
    if (dirty && !window.confirm(t('احفظ التعديلات النصية أولاً أو تجاهلها لحذف الصورة.', 'Save or discard text changes before deleting an image.'))) return
    setBusy(true); setError('')
    try {
      const updated = await newsApi.removeImage(editor.id, imageId)
      setEditor(updated); setDirty(false); refresh()
    } catch (e) { setError(e.message) } finally { setBusy(false) }
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
          {editor.image_url && <div className="admin-news__gallery" aria-label={t('صور الخبر الحالية', 'Current article images')}>
            {(editor.images?.length ? editor.images : [{ id: 'cover', url: editor.image_url, is_cover: true }]).map(image =>
              <div key={image.id} className="admin-news__gallery-item">
                <img src={image.url} alt={editor.image_alt || editor.title} loading="lazy" />
                <span>{image.is_cover ? t('صورة الغلاف', 'Cover image') : t('صورة إضافية', 'Additional photo')}</span>
                {!image.is_cover && <button type="button" disabled={busy} onClick={() => removeGalleryImage(image.id)}>{t('حذف الصورة', 'Remove image')}</button>}
              </div>
            )}
          </div>}
          <label>{t('صور الخبر — اختاري أي عدد، PNG / JPEG / WebP، حتى 5 MB لكل صورة', 'Article images — select any number, PNG / JPEG / WebP, up to 5 MB per image')}
            <input key={`${editor.id || 'new'}-${editor.image_url || ''}`} type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={e => {
              const chosen = [...(e.target.files || [])]
              if (chosen.some(image => image.size > 5 * 1024 * 1024 || !['image/png','image/jpeg','image/webp'].includes(image.type))) {
                setError(t('كل صورة يجب أن تكون PNG أو JPEG أو WebP وبحجم لا يتجاوز 5 MB.', 'Each image must be PNG, JPEG or WebP and at most 5 MB.'))
                e.target.value = ''; setFiles([]); return
              }
              setFiles(chosen); setDirty(true); setError('')
            }} />
          </label>
          {editor.image_url && <label className="admin-news__cover-option">
            <input type="checkbox" checked={replaceCover} onChange={e => { setReplaceCover(e.target.checked); setDirty(true) }} />
            {t('استبدال صورة الغلاف بأول صورة جديدة (اختياري)', 'Replace cover with the first new image (optional)')}
          </label>}
          {files.length > 0 && <div role="status">
            <strong>{t(`صور مختارة: ${files.length}`, `${files.length} selected photos`)}</strong>
            <ol>{files.map((image, index) => <li key={`${image.name}-${index}`}>
              {index === 0 && (!editor.image_url || replaceCover) ? t('غلاف: ', 'Cover: ') : ''}{image.name}
            </li>)}</ol>
          </div>}
          {input('image_alt', t('وصف الصورة', 'Image description'))}
          <details><summary>{t('الترجمة الإنجليزية (اختيارية)', 'English translation (optional)')}</summary>
            {input('title_en', 'English title')}{input('category_en', 'English category', false, 100)}{input('excerpt_en', 'English summary', true, 1000)}{input('body_en', 'English article', true, 100000)}
          </details>
          <div className="admin-news__actions"><button type="submit">{t('حفظ ونشر', 'Save and publish')}</button><button type="button" onClick={() => save(false)}>{editor.published ? t('إلغاء النشر وحفظ كمسودة', 'Unpublish and save draft') : t('حفظ كمسودة', 'Save draft')}</button><button type="button" onClick={() => { if (canLeave()) { setEditor(null); setFiles([]); setReplaceCover(false); setDirty(false) } }}>{t('إغلاق', 'Close')}</button></div>
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
