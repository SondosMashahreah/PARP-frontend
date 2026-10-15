import { useCallback } from 'react'
import { excellenceApi } from '../../../features/excellence/excellenceApi.js'
import { useAdminResource } from '../../../features/admin/useAdminResource.js'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import './ExcellenceResearcher.css'
export default function ExcellenceResearcher({ id, ar }) {
  const load = useCallback(() => excellenceApi.researcher(id), [id])
  const { data, loading, error, reload } = useAdminResource(load)
  const t = (a, e) => ar ? a : e
  const name = value => value ? (ar ? value.name_ar : value.name_en) || value.name_ar : t('غير متوفر', 'Not available')
  const research = data?.publications.filter(p => p.publication_type !== 'practice') || []
  const practices = data?.publications.filter(p => p.publication_type === 'practice') || []
  function publications(items, title) {
    return <section className="ex-profile__publications"><h2>{title} <span>({items.length})</span></h2>{items.length ? items.map(p => <article key={p.id}><h3 dir="auto">{ar ? p.title : p.title_en}</h3><p dir="auto">{p.research_field}</p>{p.abstract ? <details><summary>{t('قراءة الملخص', 'Read abstract')}</summary><p className="ex-profile__abstract" dir="auto">{p.abstract}</p></details> : <p>{t('لا يوجد ملخص متاح.', 'No abstract available.')}</p>}</article>) : <p>{t('لا توجد أبحاث منشورة حالياً.', 'No published research yet.')}</p>}</section>
  }
  return <section className="ex-abstract ex-profile"><RouteLink className="ex-back" to="/excellence">{t('→ العودة لقاعة التميز', '← Back to the hall')}</RouteLink>{loading && <p role="status">{t('جارٍ تحميل ملف الباحث…', 'Loading researcher profile…')}</p>}{error && <div role="alert"><p>{t('تعذر فتح ملف الباحث. قد تكون البطاقة غير متاحة حالياً.', 'Unable to open this profile. The entry may no longer be available.')}</p><button onClick={reload}>{t('إعادة المحاولة', 'Retry')}</button></div>}{data && <><header className="ex-profile__header"><img src={data.image_url} alt={name(data)} /><div><span className="ex-kicker">{t('باحث في قاعة التميز', 'HALL OF EXCELLENCE RESEARCHER')}</span><h1 dir="auto">{name(data)}</h1><dl><div><dt>{t('المدرسة', 'School')}</dt><dd dir="auto">{name(data.school)}</dd></div><div><dt>{t('المديرية', 'Directorate')}</dt><dd dir="auto">{name(data.directorate)}</dd></div><div><dt>{t('التخصص', 'Specialization')}</dt><dd dir="auto">{data.specialization || t('غير متوفر', 'Not available')}</dd></div><div><dt>{t('مجال البحث', 'Research field')}</dt><dd dir="auto">{data.research_field || t('غير متوفر', 'Not available')}</dd></div></dl></div></header>{publications(research, t('الأبحاث المنشورة', 'Published research'))}{practices.length > 0 && publications(practices, t('الممارسات المنشورة', 'Published practices'))}</>}</section>
}
