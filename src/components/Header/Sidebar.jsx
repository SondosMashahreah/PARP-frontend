import { useEffect, useRef } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { usePathname } from '../../routing/useLocation.js'
import Icon from '../ui/Icon.jsx'
import IconButton from '../ui/IconButton.jsx'
import './Sidebar.css'

const NAV_GROUPS = {
  ar: [
    {
      label: 'المنصة',
      items: [
        { to: '/', label: 'الرئيسية' },
        { to: '/about', label: 'عن المنصة' },
      ],
    },
    {
      label: 'البحث والمعرفة',
      items: [
        { to: '/repository', label: 'المستودع الوطني' },
        { to: '/guide', label: 'الدليل الفلسطيني' },
        { to: '/template', label: 'القالب الفلسطيني' },
        { to: '/library', label: 'المكتبة الرقمية' },
        { to: '/practices', label: 'أفضل الممارسات' },
        { to: '/assistant', label: 'المساعد الذكي' },
      ],
    },
    {
      label: 'المشاركة والتعلّم',
      items: [
        { to: '/conference', label: 'المؤتمر الوطني' },
        { to: '/training', label: 'التدريب' },
        { to: '/community', label: 'مجتمع الباحثين' },
        { to: '/news', label: 'الأخبار والفعاليات' },
      ],
    },
    {
      label: 'البيانات والأثر',
      items: [
        { to: '/observatory', label: 'المرصد الوطني' },
        { to: '/map', label: 'خريطة المديريات والمدارس' },
        { to: '/dashboard', label: 'لوحة المؤشرات' },
        { to: '/institutions', label: 'المدارس والمديريات' },
        { to: '/excellence', label: 'قاعة التميز' },
      ],
    },
    {
      label: 'المساندة',
      items: [
        { to: '/support', label: 'الدعم الفني' },
        { to: '/login', label: 'تسجيل الدخول' },
      ],
    },
  ],
  en: [
    {
      label: 'Platform',
      items: [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About PARP' },
      ],
    },
    {
      label: 'Research & Knowledge',
      items: [
        { to: '/repository', label: 'National Repository' },
        { to: '/guide', label: 'Palestinian Guide' },
        { to: '/template', label: 'Palestinian Template' },
        { to: '/library', label: 'Digital Library' },
        { to: '/practices', label: 'Best Practices' },
        { to: '/assistant', label: 'AI Assistant' },
      ],
    },
    {
      label: 'Participation & Learning',
      items: [
        { to: '/conference', label: 'National Conference' },
        { to: '/training', label: 'Training' },
        { to: '/community', label: 'Research Community' },
        { to: '/news', label: 'News & Events' },
      ],
    },
    {
      label: 'Data & Impact',
      items: [
        { to: '/observatory', label: 'National Observatory' },
        { to: '/map', label: 'Directorates & schools map' },
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/institutions', label: 'Schools & Directorates' },
        { to: '/excellence', label: 'Hall of Excellence' },
      ],
    },
    {
      label: 'Support',
      items: [
        { to: '/support', label: 'Technical Support' },
        { to: '/login', label: 'Log in' },
      ],
    },
  ],
}

export default function Sidebar({ isOpen, onClose }) {
  const dialogRef = useRef(null)
  const pathname = usePathname()
  const { language, isArabic, dir } = useLanguage()
  const groups = NAV_GROUPS[language]

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
      aria-label={isArabic ? 'القائمة الجانبية' : 'Sidebar'}
      dir={dir}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={handleBackdropClick}
    >
      <div className="sidebar__top">
        <div>
          <span className="sidebar__brand" lang="en">PARP</span>
          <p>{isArabic ? 'استكشف المنصة' : 'Explore the platform'}</p>
        </div>
        <IconButton aria-label={isArabic ? 'إغلاق القائمة الجانبية' : 'Close sidebar'} onClick={onClose}>
          <Icon name="close" />
        </IconButton>
      </div>

      <nav className="sidebar__content" aria-label={isArabic ? 'التنقل الرئيسي' : 'Main navigation'}>
        {groups.map((group) => (
          <section className="sidebar__group" key={group.label}>
            <h2>{group.label}</h2>
            <div className="sidebar__links">
              {group.items.map((item) => {
                const isActive = pathname === item.to
                return (
                  <RouteLink
                    className={`sidebar__link${isActive ? ' is-active' : ''}`}
                    to={item.to}
                    onClick={onClose}
                    aria-current={isActive ? 'page' : undefined}
                    key={item.to}
                  >
                    <span className="sidebar__link-dot" aria-hidden="true" />
                    <span>{item.label}</span>
                    <span className="sidebar__link-arrow" aria-hidden="true">{isArabic ? '←' : '→'}</span>
                  </RouteLink>
                )
              })}
            </div>
          </section>
        ))}
      </nav>
    </dialog>
  )
}
