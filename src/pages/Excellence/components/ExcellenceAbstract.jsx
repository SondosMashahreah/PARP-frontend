import { useCallback } from 'react'
import { excellenceApi } from '../../../features/excellence/excellenceApi.js'
import { useAdminResource } from '../../../features/admin/useAdminResource.js'
import { RouteLink } from '../../../routing/clientRouter.jsx'
export default function ExcellenceAbstract({id,ar}) {
 const load=useCallback(()=>excellenceApi.abstract(id),[id]), resource=useAdminResource(load), entry=resource.data
 return <section className="ex-abstract"><RouteLink className="ex-back" to="/excellence">{ar?'→ العودة لقاعة التميز':'← Back to the hall'}</RouteLink>{resource.loading&&<p role="status">{ar?'جارٍ تحميل الملخص…':'Loading abstract…'}</p>}{resource.error&&<div role="alert"><p>{ar?'تعذر فتح الملخص. قد تكون البطاقة غير متاحة حالياً.':'This abstract could not be opened. The entry may no longer be available.'}</p><button onClick={resource.reload}>{ar?'إعادة المحاولة':'Retry'}</button></div>}{entry&&<><span className="ex-kicker">{ar?'بحث متميز':'DISTINGUISHED RESEARCH'} · {entry.year}</span><h1 dir="auto">{ar?entry.title:entry.title_en}</h1><p className="ex-abstract__author">{ar?entry.name_ar:entry.name_en} <span>·</span> {ar?entry.conference_title:entry.conference_title_en}</p><div className="ex-abstract__body"><h2>{ar?'ملخص البحث':'Research abstract'}</h2><p dir="auto">{entry.abstract}</p></div><small>{ar?'الملخص معروض بلغته الأصلية.':'The abstract is shown in its original language.'}</small></>}</section>
}
