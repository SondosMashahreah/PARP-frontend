import { useCallback, useState } from 'react'
import HeaderLogo from './HeaderLogo.jsx'
import HeaderSearch from './HeaderSearch.jsx'
import Notifications from './Notifications.jsx'
import Sidebar from './Sidebar.jsx'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'
import './Header.css'

function Header() {
  const [activePanel, setActivePanel] = useState(null)
  const closePanel = useCallback(() => setActivePanel(null), [])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <HeaderLogo />
        <HeaderSearch />
        <div className="site-header__actions">
          <Notifications
            isOpen={activePanel === 'notifications'}
            onToggle={() => setActivePanel((current) => current === 'notifications' ? null : 'notifications')}
            onClose={closePanel}
          />
          <span className="site-header__divider" aria-hidden="true" />
          <IconButton
            className="site-header__menu"
            aria-label="فتح القائمة الجانبية"
            aria-expanded={activePanel === 'sidebar'}
            aria-controls="main-sidebar"
            aria-haspopup="dialog"
            onClick={() => setActivePanel('sidebar')}
          >
            <Icon name="menu" />
          </IconButton>
        </div>
      </div>
      <Sidebar isOpen={activePanel === 'sidebar'} onClose={closePanel} />
    </header>
  )
}

export default Header
