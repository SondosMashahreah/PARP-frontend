import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../features/auth/useAuth.js'
import { useLanguage } from '../../i18n/useLanguage.js'
import { navigate } from '../../routing/navigation.js'
import { notificationsApi } from '../../features/notifications/notificationsApi.js'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'
import './Notifications.css'

const PAGE_SIZE = 30

export default function Notifications({ isOpen, onToggle, onClose }) {
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const { user, isAuthenticated } = useAuth()
  const { isArabic, dir } = useLanguage()
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [moreLoading, setMoreLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const fetchId = useRef(0)
  const title = isArabic ? 'الإشعارات' : 'Notifications'
  const refresh = useCallback(async ({ quiet = false } = {}) => {
    if (!isAuthenticated) return
    const seq = ++fetchId.current
    if (!quiet) setLoading(true)
    try {
      const data = await notificationsApi.list(PAGE_SIZE, 0)
      if (seq !== fetchId.current) return
      setItems(data.items || [])
      setUnreadCount(data.unread_count || 0)
      setTotal(data.total || 0)
      setError(false)
    } catch {
      if (seq === fetchId.current) setError(true)
    } finally {
      if (seq === fetchId.current) setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    refresh()
    const updateIfVisible = () => {
      if (document.visibilityState === 'visible') refresh({ quiet: true })
    }
    const timer = window.setInterval(updateIfVisible, 40000)
    window.addEventListener('focus', updateIfVisible)
    document.addEventListener('visibilitychange', updateIfVisible)
    window.addEventListener('parp:notifications-refresh', updateIfVisible)
    return () => {
      ++fetchId.current
      window.clearInterval(timer)
      window.removeEventListener('focus', updateIfVisible)
      document.removeEventListener('visibilitychange', updateIfVisible)
      window.removeEventListener('parp:notifications-refresh', updateIfVisible)
    }
  }, [isAuthenticated, user?.id, user?.role, refresh])

  useEffect(() => {
    if (!isOpen) return undefined
    refresh({ quiet: true })
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
  }, [isOpen, onClose, refresh])

  const readItem = async (notification) => {
    if (busy) return
    setBusy(true)
    try {
      if (!notification.read_at) {
        await notificationsApi.read(notification.id)
        setItems((list) => list.map((item) => item.id === notification.id
          ? { ...item, read_at: new Date().toISOString() } : item))
        setUnreadCount((count) => Math.max(0, count - 1))
      }
      onClose()
      // The server only generates internal paths; never open external destinations.
      const href = notification.href
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !href.includes('\\')) {
        navigate(href)
      }
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const readAll = async () => {
    if (busy || unreadCount === 0) return
    setBusy(true)
    try {
      await notificationsApi.readAll()
      setUnreadCount(0)
      setItems((list) => list.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const loadMore = async () => {
    if (moreLoading || items.length >= total) return
    setMoreLoading(true)
    try {
      const data = await notificationsApi.list(PAGE_SIZE, items.length)
      setItems((current) => {
        const existing = new Set(current.map((row) => row.id))
        return [...current, ...(data.items || []).filter((row) => !existing.has(row.id))]
      })
      setUnreadCount(data.unread_count || 0)
      setTotal(data.total || 0)
    } catch {
      setError(true)
    } finally {
      setMoreLoading(false)
    }
  }

  const dateLabel = (date) => {
    const value = new Date(date)
    if (Number.isNaN(value.getTime())) return ''
    return new Intl.DateTimeFormat(isArabic ? 'ar-PS' : 'en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(value)
  }

  return (
    <div className="notifications" ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose()
      }}>
      <IconButton ref={buttonRef}
        aria-label={`${title}${unreadCount ? ` (${unreadCount})` : ''}`}
        aria-expanded={isOpen} aria-controls="header-notifications" aria-haspopup="dialog"
        onClick={onToggle}>
        <Icon name="bell" />
        {unreadCount > 0 && <span className="notifications__badge" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </IconButton>
      <section id="header-notifications" className="notifications__panel"
        aria-label={title} role="dialog" dir={dir} hidden={!isOpen}>
        <header className="notifications__panel-heading">
          <h2>{title}</h2>
          {unreadCount > 0 && <button className="notifications__read-all" type="button"
            onClick={readAll} disabled={busy}>
            {isArabic ? 'تحديد الكل كمقروء' : 'Mark all as read'}
          </button>}
        </header>
        {error && <div className="notifications__error" role="alert">
          {isArabic ? 'تعذّر تحديث الإشعارات.' : 'Could not update notifications.'}
          <button type="button" onClick={() => refresh()}>{isArabic ? 'إعادة المحاولة' : 'Retry'}</button>
        </div>}
        {loading && items.length === 0 ? (
          <p className="notifications__status" role="status">{isArabic ? 'جارٍ تحميل الإشعارات…' : 'Loading notifications…'}</p>
        ) : items.length === 0 && !error ? (
          <div className="notifications__empty">
            <span className="notifications__empty-icon"><Icon name="bell" /></span>
            <p>{isArabic ? 'لا توجد إشعارات بعد' : 'No notifications yet'}</p>
          </div>
        ) : (
          <div className="notifications__list">
            {items.map((item) => (
              <button key={item.id} className={`notifications__item${item.read_at ? '' : ' is-unread'}`}
                type="button" onClick={() => readItem(item)} disabled={busy}>
                {!item.read_at && <span className="notifications__unread-dot" aria-hidden="true" />}
                <strong dir="auto">{(isArabic ? item.title_ar : item.title_en) || item.title_ar}</strong>
                {(item.body_ar || item.body_en) && <span className="notifications__body" dir="auto">
                  {(isArabic ? item.body_ar : item.body_en) || item.body_ar}
                </span>}
                <time dateTime={item.created_at}>{dateLabel(item.created_at)}</time>
              </button>
            ))}
            {items.length < total && <button className="notifications__more" type="button"
              disabled={moreLoading} onClick={loadMore}>
              {moreLoading ? (isArabic ? 'جارٍ التحميل…' : 'Loading…') : (isArabic ? 'عرض المزيد' : 'Show more')}
            </button>}
          </div>
        )}
      </section>
    </div>
  )
}
