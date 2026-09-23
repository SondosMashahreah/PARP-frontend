import { useEffect, useRef } from 'react'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'
import './Notifications.css'

export default function Notifications({ isOpen, onToggle, onClose }) {
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

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
      <IconButton ref={buttonRef} aria-label="الإشعارات" aria-expanded={isOpen} aria-controls="header-notifications" onClick={onToggle}>
        <Icon name="bell" />
      </IconButton>
      <section id="header-notifications" className="notifications__panel" aria-label="الإشعارات" dir="rtl" hidden={!isOpen}>
        <h2 className="notifications__heading">الإشعارات</h2>
        <div className="notifications__empty">
          <span className="notifications__empty-icon"><Icon name="bell" /></span>
          <p>لا توجد إشعارات بعد</p>
        </div>
      </section>
    </div>
  )
}
