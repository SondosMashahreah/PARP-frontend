import { useEffect, useRef } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'
import './Notifications.css'

export default function Notifications({ isOpen, onToggle, onClose }) {
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const { isArabic, dir } = useLanguage()

  const title = isArabic ? 'الإشعارات' : 'Notifications'
  const empty = isArabic ? 'لا توجد إشعارات بعد' : 'No notifications yet'

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) onClose()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div
      className="notifications"
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose()
      }}
    >
      <IconButton ref={buttonRef} aria-label={title} aria-expanded={isOpen} aria-controls="header-notifications" onClick={onToggle}>
        <Icon name="bell" />
      </IconButton>
      <section id="header-notifications" className="notifications__panel" aria-label={title} dir={dir} hidden={!isOpen}>
        <h2 className="notifications__heading">{title}</h2>
        <div className="notifications__empty">
          <span className="notifications__empty-icon"><Icon name="bell" /></span>
          <p>{empty}</p>
        </div>
      </section>
    </div>
  )
}
