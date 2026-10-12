import { RouteLink } from '../../../routing/clientRouter.jsx'
import { visibleSections } from '../../../features/researcher/workspaceSections.js'

export default function WorkspaceHub({ role, isArabic, name }) {
  return <div className="researcher-hub">
    <svg className="researcher-hub__lines" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true"><path d="M500 200 L190 110 M500 200 L810 110 M500 200 L500 355 M190 110 L810 110 L500 355 Z" /></svg>
    <div className="researcher-hub__center"><span aria-hidden="true">✧</span><strong>{name}</strong><small>{isArabic ? 'مساحتك للمعرفة والأثر' : 'Your space for knowledge and impact'}</small></div>
    {visibleSections(role).map((section, i) => <RouteLink key={section.id} to={`/workspace#${section.id}`} className={`researcher-hub__node researcher-hub__node--${i}`}><span className="researcher-hub__number" aria-hidden="true">{section.symbol}</span><span><strong>{isArabic ? section.ar : section.en}</strong><small>{section.description[isArabic ? 0 : 1]}</small></span><span aria-hidden="true">↗</span></RouteLink>)}
  </div>
}
