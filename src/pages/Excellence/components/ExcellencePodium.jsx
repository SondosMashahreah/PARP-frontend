import { useState } from 'react'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import './ExcellencePodium.css'
import './ExcellenceResearcher.css'
export default function ExcellencePodium({ entry, ar, preview = false }) {
 const [failed,setFailed]=useState(false)
 const name=(ar?entry.name_ar:entry.name_en)||entry.name_ar||entry.name_en
 return <article className="ex-podium">{!preview&&<RouteLink className="ex-podium__profile-link" to={`/excellence?researcher=${entry.id}`} aria-label={`${ar?'عرض ملف الباحث':'View researcher profile'}: ${name}`} />}<div className="ex-podium__scene"><div className="ex-podium__art" aria-hidden="true"/><div className="ex-podium__mist" aria-hidden="true"/><div className="ex-podium__orbit" aria-hidden="true"><i/></div>
 <div className="ex-podium__portrait">{entry.image_url&&!failed?<img key={entry.image_url} src={entry.image_url} alt={name||''} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span className="ex-podium__initial" aria-label={name}>{name?.charAt(0)||'✦'}</span>}</div>
 <div className="ex-podium__plaque"><h2 dir="auto" title={name}>{name|| (ar?'اسم الباحث':'Researcher name')}</h2><span className="ex-podium__diamond" aria-hidden="true">◇</span></div></div>
</article>
}
