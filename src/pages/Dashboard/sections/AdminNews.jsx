import { useEffect, useState } from 'react'
import { AdminPanel } from '../components/AdminUi.jsx'
import { newsApi } from '../../../features/news/newsApi.js'
import { useNews } from '../../../features/news/useNews.js'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import { MAX_NEWS_IMAGE_MB as MAX_MB, NEWS_IMAGE_ACCEPT as PHOTO_ACCEPT, isSupportedNewsImage, newsImageKey as fileKey, mergeNewsImages } from '../../../features/news/newsUploadRules.js'
import './AdminNews.css'
import './AdminNewsGallery.css'
import './AdminNewsUploads.css'

const empty = { title: '', title_en: '', excerpt: '', excerpt_en: '', body: '', body_en: '', category: 'أخبار المنصة', category_en: '', image_alt: '', published: false }
const fields = Object.keys(empty)

function PendingPhoto({ file, index, cover, onRemove, onMove, ar, busy }) {
  const nativePreview = /\.(png|jpe?g|webp|gif)$/i.test(file.name)
  const [localUrl] = useState(() => nativePreview ? URL.createObjectURL(file) : null)
  const [rendered, setRendered] = useState(null)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(!nativePreview)
  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl) }, [localUrl])
  useEffect(() => {
    if (nativePreview) return undefined
    let active = true
    newsApi.preview(file)
      .then(data => {
        if (!active) return
        setRendered(`data:${data.content_type};base64,${data.image_base64}`)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setFailed(true)
        setLoading(false)
      })
    return () => { active = false }
  }, [file, nativePreview])
  const src = rendered || localUrl
  return <article className="admin-news__pending-photo">
    {src && !failed
      ? <img src={src} alt="" onError={() => setFailed(true)} />
      : <span className="admin-news__pending-fallback" aria-hidden="true">{loading ? '…' : '▧'}</span>}
    <div className="admin-news__pending-caption">
      <strong>{cover ? (ar ? 'صورة الغلاف' : 'Cover') : (ar ? 'صورة إضافية' : 'Gallery')}</strong>
      <small dir="auto" title={file.name}>{file.name}</small>
      <small>{(file.size / (1024 * 1024)).toFixed(1)} MB</small>
      {loading && <small>{ar ? 'جارٍ تجهيز المعاينة…' : 'Generating preview…'}</small>}
      {failed && <small>{ar ? 'تعذرت معاينة الصورة. يمكن إعادة المحاولة بعد التأكد من الملف.' : 'Preview failed. Check the file before upload.'}</small>}
    </div>
    <div className="admin-news__pending-controls">
      <button type="button" disabled={busy || index === 0} onClick={() => onMove(index, -1)} aria-label={ar ? 'تقديم الصورة' : 'Move photo earlier'}>↑</button>
      <button type="button" disabled={busy} onClick={() => onMove(index, 1)} aria-label={ar ? 'تأخير الصورة' : 'Move photo later'}>↓</button>
      <button type="button" disabled={busy} onClick={() => onRemove(index)}>{ar ? 'إزالة' : 'Remove'}</button>
    </div>
  </article>
}

export default function AdminNews({ ar }) {
  const [offset, setOffset] = useState(0)
  const [revision, setRevision] = useState(0)
  const { data, loading, error: loadError } = useNews({ admin: true, offset, revision })
  const [editor, setEditor] = useState(null)
  const [files, setFiles] = useState([])
  const [replaceCover, setReplaceCover] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const t = (a, e) => ar ? a : e
  const refresh = () => setRevision(x => x + 1)
  function canLeave() { return !dirty || window.confirm(t('تجاهل التغييرات غير المحفوظة؟', 'Discard unsaved changes?')) }

  async function edit(id) {
    if (!canLeave()) return
    setError(''); setNotice(''); setBusy(true)
    try {
      setEditor(id ? await newsApi.detail(id, true) : { ...empty })
      setFiles([]); setReplaceCover(false); setDirty(false)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  function chooseFiles(nextFiles) {
    const incoming = Array.from(nextFiles || [])
    if (!incoming.length) return
    const invalid = incoming.find(file => !isSupportedNewsImage(file))
    if (invalid) {
      setError(t(`الصورة ${invalid.name} غير مدعومة أو تتجاوز ${MAX_MB}MB.`, `The image ${invalid.name} is unsupported or exceeds ${MAX_MB} MB.`))
      return
    }
    setFiles(old => mergeNewsImages(old, incoming))
    setDirty(true); setError(''); setNotice('')
  }
  function move(index, direction) {
    setFiles(current => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setDirty(true)
  }
  async function save(publish) {
    if (busy || !editor) return
    if (!editor.title?.trim() || !editor.body?.trim() || !editor.category?.trim()) {
      setError(t('أدخل عنوان الخبر وموضوعه وتصنيفه.', 'Enter a title, body and category.'))
      return
    }
    if (publish && !editor.image_url && !files.length) {
      setError(t('أضف صورة للخبر قبل النشر.', 'Add a cover image before publishing.'))
      return
    }
    setBusy(true); setError(''); setNotice(''); setProgress('')
    let saved = editor
    try {
      const payload = Object.fromEntries(fields.map(key => [key, editor[key] ?? empty[key]]))
      // Draft first on creation. Existing public articles stay public while adding photos.
      payload.published = Boolean(publish && editor.id && editor.published && editor.image_url)
      setProgress(t('حفظ نص الخبر…', 'Saving article text…'))
      saved = await newsApi.save(editor.id, payload)
      setEditor(saved)
      const queue = [...files]
      for (let index = 0; index < queue.length; index += 1) {
        const file = queue[index]
        setProgress(t(`رفع الصورة ${index + 1} من ${queue.length}: ${file.name}`, `Uploading photo ${index + 1} of ${queue.length}: ${file.name}`))
        const uploadCover = !saved.image_url || (index === 0 && replaceCover)
        try {
          saved = uploadCover ? await newsApi.image(saved.id, file) : await newsApi.addImage(saved.id, file)
        } catch (uploadError) {
          throw new Error(t(`لم تكتمل صورة ${index + 1} (${file.name}). `, `Photo ${index + 1} (${file.name}) failed. `) + uploadError.message, { cause: uploadError })
        }
        setEditor(saved)
        setFiles(queue.slice(index + 1))
        if (uploadCover) setReplaceCover(false)
      }
      if (saved.published !== publish) {
        setProgress(t('تحديث حالة النشر…', 'Updating publication status…'))
        saved = await newsApi.save(saved.id, { ...payload, published: publish })
        setEditor(saved)
      }
      setDirty(false)
      refresh()
      setNotice(publish ? t('تم نشر الخبر بنجاح وأصبحت صوره متاحة للزوار.', 'Article and photos published successfully.') : t('تم حفظ مسودة الخبر.', 'Article draft saved.'))
    } catch (e) {
      setError(t('حُفظ ما اكتمل فقط. الصور المتبقية ما زالت مختارة؛ يمكنك إعادة المحاولة. التفاصيل: ', 'Completed steps were saved. Remaining photos are still selected; you can retry. Details: ') + e.message)
      setEditor(saved)
      setDirty(true)
      refresh()
    } finally { setBusy(false); setProgress('') }
  }
  async function remove(row) {
    if (!window.confirm(t(`حذف الخبر «${row.title}» نهائيًا؟`, `Permanently delete “${row.title}”?`))) return
    setBusy(true); setError('')
    try { await newsApi.delete(row.id); if (editor?.id === row.id) { setEditor(null); setDirty(false); setFiles([]) }; setOffset(0); refresh() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  async function removeGalleryImage(imageId) {
    if (dirty && !window.confirm(t('احفظ التعديلات النصية أولًا أو تجاهلها لحذف الصورة.', 'Save or discard text edits before deleting an image.'))) return
    setBusy(true); setError('')
    try { setEditor(await newsApi.removeImage(editor.id, imageId)); setDirty(false); refresh() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  function input(key, label, multiline = false, maxLength = 300) {
    const props = { value: editor[key] || '', maxLength, onChange: e => { setEditor({ ...editor, [key]: e.target.value }); setDirty(true) }, required: ['title', 'body', 'category'].includes(key) }
    return <label>{label}{multiline ? <textarea {...props} rows={key.startsWith('body') ? 10 : 3} /> : <input {...props} />}</label>
  }
  return <AdminPanel title={t('إدارة الأخبار', 'Manage news')} eyebrow={t('محتوى المنصة', 'PLATFORM CONTENT')}>
    <div className="admin-news">
      <button disabled={busy} onClick={() => edit(null)}>{t('+ خبر جديد', '+ New article')}</button>
      {(error || loadError) && <p role="alert" className="admin-news__error">{error || loadError} <button type="button" onClick={refresh}>{t('تحديث', 'Refresh')}</button></p>}
      {notice && <p role="status">{notice}</p>}
      {editor && <form onSubmit={e => { e.preventDefault(); save(true) }}>
        <fieldset disabled={busy}><legend>{editor.id ? t('تعديل الخبر', 'Edit article') : t('خبر جديد', 'New article')}</legend>
          {input('title', t('عنوان الخبر *', 'Title *'))}
          {input('category', t('التصنيف *', 'Category *'), false, 100)}
          {input('excerpt', t('ملخص يظهر في الرئيسية', 'Summary shown on Home'), true, 1000)}
          {input('body', t('نص الخبر كاملًا *', 'Full article *'), true, 100000)}
          {editor.image_url && <div className="admin-news__gallery" aria-label={t('الصور المرفوعة', 'Uploaded photos')}>
            {(editor.images?.length ? editor.images : [{ id: 'cover', url: editor.image_url, is_cover: true }]).map(image =>
              <div key={image.id} className="admin-news__gallery-item">
                <img src={image.url} alt={editor.image_alt || editor.title} loading="lazy" />
                <span>{image.is_cover ? t('الغلاف الحالي', 'Current cover') : t('صورة إضافية', 'Gallery image')}</span>
                {!image.is_cover && <button type="button" disabled={busy} onClick={() => removeGalleryImage(image.id)}>{t('حذف الصورة', 'Remove image')}</button>}
              </div>
            )}
          </div>}
          <label className="admin-news__file-drop">
            <strong>{t('اسحبي صور الخبر وأفلتيها هنا، أو اضغطي للاختيار', 'Drag and drop article photos here, or click to choose')}</strong>
            <small>{t(`صور JPG / PNG / WebP / HEIC / HEIF / GIF / BMP / TIFF / AVIF حتى ${MAX_MB} MB للصورة. تُحوّل إلى WebP تلقائيًا.`, `JPG / PNG / WebP / HEIC / HEIF / GIF / BMP / TIFF / AVIF, up to ${MAX_MB} MB per image. Automatically converted to WebP.`)}</small>
            <input type="file" multiple accept={PHOTO_ACCEPT} onChange={e => { chooseFiles(e.target.files); e.target.value = '' }} />
          </label>
          {editor.image_url && <label className="admin-news__cover-option"><input type="checkbox" checked={replaceCover} onChange={e => { setReplaceCover(e.target.checked); setDirty(true) }} />{t('استبدال الغلاف الحالي بأول صورة مختارة', 'Replace the current cover with the first selected photo')}</label>}
          {files.length > 0 && <section aria-label={t('معاينة الصور قبل الرفع', 'Photo previews before upload')}>
            <h3>{t(`معاينة ${files.length} صورة قبل الرفع`, `Preview ${files.length} photos before upload`)}</h3>
            <div className="admin-news__pending-grid">{files.map((file, index) =>
              <PendingPhoto key={fileKey(file)} file={file} index={index} cover={index === 0 && (!editor.image_url || replaceCover)}
                ar={ar} busy={busy} onRemove={i => { setFiles(old => old.filter((_, j) => j !== i)); setDirty(true) }} onMove={move} />
            )}</div>
          </section>}
          {input('image_alt', t('وصف الصورة لسهولة الوصول', 'Image alt text for accessibility'))}
          <details><summary>{t('الترجمة الإنجليزية (اختيارية)', 'English translation (optional)')}</summary>
            {input('title_en', 'English title')}{input('category_en', 'English category', false, 100)}
            {input('excerpt_en', 'English summary', true, 1000)}{input('body_en', 'English article', true, 100000)}
          </details>
          <div className="admin-news__actions"><button type="submit">{busy ? t('جارٍ الحفظ…', 'Saving…') : t('حفظ ونشر', 'Save and publish')}</button>
            <button type="button" onClick={() => save(false)}>{editor.published ? t('إلغاء النشر وحفظ مسودة', 'Unpublish and save draft') : t('حفظ كمسودة', 'Save draft')}</button>
            <button type="button" onClick={() => { if (canLeave()) { setEditor(null); setFiles([]); setReplaceCover(false); setDirty(false) } }}>{t('إغلاق', 'Close')}</button></div>
          {progress && <p role="status" aria-live="polite">{progress}</p>}
        </fieldset>
      </form>}
      {busy && <p role="status">{progress || t('جارٍ الحفظ…', 'Saving…')}</p>}
      {loading && <p role="status">{t('جارٍ تحميل الأخبار…', 'Loading news…')}</p>}
      {data?.total === 0 && <p>{t('لا توجد أخبار بعد. أضيفي الخبر الأول.', 'No articles yet. Add the first article.')}</p>}
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
