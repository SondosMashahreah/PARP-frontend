import { useEffect, useId, useState } from 'react'
import { researcherApi } from '../../../features/researcher/researcherApi.js'
import './RegisteredResearchersField.css'

const EMPTY_AUTHOR = { user_id: null, full_name: '', school: '', school_en: '', school_id: '', directorate: '', directorate_en: '', directorate_id: '' }

function ResearcherRow({ value, index, isArabic, onChange, onRemove, canRemove, selectedIds }) {
  const [typed, setTyped] = useState('')
  const [editing, setEditing] = useState(false)
  const query = editing ? typed : value?.full_name || ''
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const suggestionsId = useId()
  const t = (ar, en) => isArabic ? ar : en
  const selected = Boolean(value?.user_id) && !editing

  useEffect(() => {
    if (!open || query.trim().length < 2 || selected) return undefined
    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const response = await researcherApi.searchResearchers(query.trim())
        if (active) {
          setResults(response.items || [])
          setLoading(false)
          setError('')
        }
      } catch (err) {
        if (active) {
          setResults([])
          setLoading(false)
          setError(err.message || (isArabic ? 'تعذر البحث' : 'Search failed'))
        }
      }
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [open, query, selected, isArabic])

  function typeName(next) {
    setTyped(next)
    setEditing(true)
    setOpen(next.trim().length >= 2)
    setResults([])
    setLoading(next.trim().length >= 2)
    setError('')
    // A typed name is not a verified identity: clear the previous selection.
    onChange({ ...EMPTY_AUTHOR })
  }

  function selectAuthor(item) {
    onChange(item)
    setEditing(false)
    setTyped('')
    setOpen(false)
    setResults([])
    setLoading(false)
  }

  return <div className="ards-entry ards-researcher" role="group" aria-label={`${t('الباحث', 'Researcher')} ${index + 1}`}>
    <div className="ards-entry__heading">
      <strong>{t('الباحث', 'Researcher')} {index + 1}</strong>
      <button type="button" className="ards-quiet" disabled={!canRemove} onClick={onRemove}>{t('إزالة', 'Remove')}</button>
    </div>
    <div className="ards-researcher__search" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <label htmlFor={`${suggestionsId}-input`}>{t('ابحث عن الباحث بالاسم', 'Search registered researchers by name')} *</label>
      <input id={`${suggestionsId}-input`} type="search" role="combobox" aria-autocomplete="list"
        aria-expanded={open && (results.length > 0 || loading)} aria-controls={suggestionsId}
        value={query} autoComplete="off" maxLength={150}
        placeholder={t('اكتب حرفين على الأقل من الاسم…', 'Type at least two letters…')}
        onChange={(event) => typeName(event.target.value)}
        onFocus={() => { if (query.trim().length >= 2 && !selected) setOpen(true) }} />
      {open && <div className="ards-researcher__suggestions" id={suggestionsId} role="listbox">
        {loading && <p role="status">{t('جارٍ البحث…', 'Searching…')}</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && results.length === 0 && <p>{t('لا توجد نتائج؛ يجب أن يكون ارتباط الباحث بالمدرسة والمديرية معتمدًا.', 'No matches with an approved school and directorate.')}</p>}
        {!loading && results.map((item) => <button key={item.user_id} type="button" role="option"
          aria-selected={false} disabled={selectedIds.includes(item.user_id)} onClick={() => selectAuthor(item)}>
          <strong>{item.full_name}</strong>
          <small>{isArabic ? item.school : item.school_en || item.school} · {isArabic ? item.directorate : item.directorate_en || item.directorate}</small>
        </button>)}
      </div>}
    </div>
    <div className="ards-entry__grid ards-researcher__affiliations">
      <label>{t('المدرسة (من الملف المعتمد)', 'School (verified profile)')}
        <input type="text" readOnly value={(isArabic ? value?.school : value?.school_en || value?.school) || ''}
          placeholder={t('تُعبّأ بعد اختيار الباحث', 'Filled automatically')} />
      </label>
      <label>{t('المديرية (من الملف المعتمد)', 'Directorate (verified profile)')}
        <input type="text" readOnly value={(isArabic ? value?.directorate : value?.directorate_en || value?.directorate) || ''}
          placeholder={t('تُعبّأ بعد اختيار الباحث', 'Filled automatically')} />
      </label>
    </div>
    {selected && <p className="ards-researcher__verified">✓ {t('تم الربط بحساب الباحث وبيانات ارتباطه المعتمد', 'Linked to verified platform affiliation')}</p>}
    {!selected && value?.full_name && <p className="ards-researcher__warning">{t('يلزم اختيار الاسم من الاقتراحات لتأكيد الربط.', 'Choose a suggested account to verify the researcher.')}</p>}
  </div>
}

export default function RegisteredResearchersField({ value, onChange, isArabic }) {
  const list = Array.isArray(value) && value.length ? value : [{ ...EMPTY_AUTHOR }]
  const selectedIds = list.map((entry) => entry.user_id).filter(Boolean)
  return <div className="ards-repeatable ards-researchers" role="group" aria-label={isArabic ? 'الباحثون' : 'Researchers'}>
    <p className="ards-researchers__hint">{isArabic
      ? 'اختاري الباحث من حسابات المنصة؛ المدرسة والمديرية بتظهر تلقائيًا من ارتباطه المعتمد. يمكن إضافة باحثين مشاركين بموافقتهم.'
      : 'Choose an existing platform researcher. School and directorate are filled from the approved account affiliation. Add co-authors with their consent.'}</p>
    {list.map((entry, index) => <ResearcherRow key={index} index={index} value={entry} isArabic={isArabic}
      onChange={(next) => onChange(list.map((item, i) => i === index ? next : item))}
      onRemove={() => onChange(list.filter((_, i) => i !== index))}
      canRemove={list.length > 1} selectedIds={selectedIds} />)}
    <button type="button" className="ards-add" onClick={() => onChange([...list, { ...EMPTY_AUTHOR }])}>
      ＋ {isArabic ? 'إضافة باحث مشارك' : 'Add co-author'}
    </button>
  </div>
}
