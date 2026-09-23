import { useEffect, useRef } from 'react'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'
import './Sidebar.css'

export default function Sidebar({ isOpen, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }

    if (dialog.open) dialog.close()
  }, [isOpen])

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
  }

  return (
    <dialog
      id="main-sidebar"
      className="sidebar"
      ref={dialogRef}
      aria-label="القائمة الجانبية"
      dir="rtl"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
    >
      <div className="sidebar__top">
        <IconButton aria-label="إغلاق القائمة الجانبية" onClick={onClose}><Icon name="close" /></IconButton>
      </div>
      <div className="sidebar__content" />
    </dialog>
  )
}
