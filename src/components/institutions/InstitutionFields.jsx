import { useEffect, useMemo, useState } from 'react'
import { api } from '../../features/auth/authApi.js'
import './InstitutionFields.css'

const EMPTY = { governorate_id: '', directorate_id: '', school_id: '' }

/** Canonical education IDs are selected from the database, never typed by hand. */
export default function InstitutionFields({ initial = EMPTY, isArabic = true, active = true, requireDirectorate = false, requireSchool = false }) {
  const [selected, setSelected] = useState(() => ({
    governorate_id: initial?.governorate_id || '',
    directorate_id: initial?.directorate_id || '',
    school_id: initial?.school_id || '',
  }))
  const [directory, setDirectory] = useState({ directorates: [], governorates: [] })
  const [schools, setSchools] = useState([])
  const [schoolSearch, setSchoolSearch] = useState('')
  const [directorateSearch, setDirectorateSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const t = (ar, en) => isArabic ? ar : en
  const name = (item) => (isArabic ? item.name_ar || item.name_en : item.name_en || item.name_ar) || item.id
  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    api('/api/education/public/institutions', { signal: controller.signal })
      .then(setDirectory).catch((err) => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [active])

  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setBusy(true)
      const params = new URLSearchParams({ q: schoolSearch, limit: '30' })
      if (selected.directorate_id) params.set('directorate_id', selected.directorate_id)
      if (selected.school_id) params.set('selected_id', selected.school_id)
      api(`/api/education/public/schools?${params}`, { signal: controller.signal })
        .then((data) => { if (!controller.signal.aborted) { setSchools(data.items || []); setError('') } })
        .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
        .finally(() => { if (!controller.signal.aborted) setBusy(false) })
    }, 220)
    return () => { clearTimeout(timer); controller.abort() }
  }, [active, schoolSearch, selected.directorate_id, selected.school_id])

  const directorates = useMemo(() => {
    const query = directorateSearch.trim().toLowerCase()
    return (directory.directorates || []).filter((d) => !query || `${d.name_ar} ${d.name_en}`.toLowerCase().includes(query) || d.id === selected.directorate_id)
  }, [directory.directorates, directorateSearch, selected.directorate_id])

  const changeDirectorate = (id) => {
    const chosen = directory.directorates.find((d) => d.id === id)
    setSelected({ directorate_id: id, school_id: '', governorate_id: chosen?.governorate_id || '' })
    setSchoolSearch('')
  }
  const changeSchool = (id) => {
    const school = schools.find((s) => s.id === id)
    if (!school) { setSelected((old) => ({ ...old, school_id: '' })); return }
    const directorateId = school.directorate_id || selected.directorate_id
    const directorate = directory.directorates.find((d) => d.id === directorateId)
    setSelected({
      school_id: id,
      directorate_id: directorateId,
      governorate_id: school.governorate_id || directorate?.governorate_id || '',
    })
  }

  return <div className="institution-fields">
    <p className="institution-fields__intro">{t('الارتباط المؤسسي · اختاري من قاعدة بيانات التعليم', 'Institutional affiliation · select from the education directory')}</p>
    <label>{t('البحث عن المديرية', 'Find directorate')}
      <input type="search" value={directorateSearch} onChange={(e) => setDirectorateSearch(e.target.value)} placeholder={t('اكتبي اسم المديرية…', 'Search for a directorate…')} autoComplete="off" />
    </label>
    <label>{t('المديرية', 'Directorate')}
      <select name="directorate_id" value={selected.directorate_id} onChange={(e) => changeDirectorate(e.target.value)} required={requireDirectorate}>
        <option value="">{t('اختاري المديرية', 'Select directorate')}</option>
        {directorates.map((item) => <option key={item.id} value={item.id}>{name(item)}</option>)}
      </select>
    </label>
    <label>{t('البحث عن المدرسة', 'Find school')}
      <input type="search" value={schoolSearch} onChange={(e) => setSchoolSearch(e.target.value)} placeholder={t('اكتبي اسم المدرسة أو رمزها…', 'Search school name or code…')} autoComplete="off" />
    </label>
    <label>{t('المدرسة', 'School')}
      <select name="school_id" value={selected.school_id} onChange={(e) => changeSchool(e.target.value)} required={requireSchool}>
        <option value="">{busy ? t('جاري البحث…', 'Searching…') : t('اختاري المدرسة', 'Select school')}</option>
        {schools.map((item) => <option value={item.id} key={item.id}>{name(item)}</option>)}
      </select>
    </label>
    <input type="hidden" name="governorate_id" value={selected.governorate_id} />
    {error && <p role="alert" className="institution-fields__error">{t('تعذّر تحميل دليل المؤسسات: ', 'Could not load the institution directory: ')}{error}</p>}
    <small>{t('يُحفظ رقم المدرسة والمديرية المعتمد تلقائيًا، وليس النص المكتوب في البحث. يُعتمد الارتباط بعد مراجعة الطلب.', 'The approved school/directorate IDs are stored, not the search text. Affiliation requests require approval.')}</small>
  </div>
}
