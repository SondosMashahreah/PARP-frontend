import InstitutionWorkspace from '../Workspace/InstitutionWorkspace.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import '../Workspace/WorkspacePage.css'
import './InstitutionsPage.css'
export default function InstitutionsPage() {
  const { dir } = useLanguage()
  return <section className="workspace-page" dir={dir}><InstitutionWorkspace /></section>
}
