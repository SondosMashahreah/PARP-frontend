import RibbonButton from '../../../components/RibbonButton/RibbonButton.jsx'
import { ribbonSelectionForRoute } from '../../../components/RibbonButton/ribbonRoutes.js'
import { visibleSections } from '../../../features/researcher/workspaceSections.js'
import './WorkspaceRibbonLayout.css'

export default function WorkspaceHub({ role, isArabic, name }) {
  return <div className="researcher-hub researcher-hub--ribbon">
    <div className="researcher-hub__center"><span aria-hidden="true">✧</span><strong>{name}</strong><small>{isArabic ? 'مساحتك للمعرفة والأثر' : 'Your space for knowledge and impact'}</small></div>
    <div className="researcher-hub__ribbon-grid">
      {visibleSections(role).map((section, index) => {
        const to = `/workspace#${section.id}`
        const selection = ribbonSelectionForRoute(to, isArabic)
        return selection && <RibbonButton key={section.id} {...selection} offset={index * 600} />
      })}
    </div>
  </div>
}
