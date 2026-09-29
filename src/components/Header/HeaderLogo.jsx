import { RouteLink } from '../../routing/clientRouter.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import logo from './img/logo.png'
import './HeaderLogo.css'

export default function HeaderLogo() {
  const { isArabic } = useLanguage()

  return (
    <RouteLink
      className="header-logo"
      to="/"
      aria-label={isArabic ? 'PARP — الصفحة الرئيسية' : 'PARP — Home'}
    >
      <span className="header-logo__image-frame">
        <img
          className="header-logo__image"
          src={logo}
          alt={isArabic ? 'شعار المنصة الفلسطينية للبحوث الإجرائية' : 'Palestinian Action Research Platform logo'}
          width="52"
          height="52"
        />
      </span>
      <span className="header-logo__wordmark">
        <span className="header-logo__name" lang="en">PARP<span aria-hidden="true">.</span></span>
        <span className="header-logo__subtitle">
          {isArabic ? 'المنصة الفلسطينية للبحوث الإجرائية' : 'Palestinian Action Research Platform'}
        </span>
      </span>
    </RouteLink>
  )
}
