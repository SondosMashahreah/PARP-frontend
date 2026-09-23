import logo from './img/logo.png'
import './HeaderLogo.css'

export default function HeaderLogo() {
  return (
    <a className="header-logo" href={import.meta.env.BASE_URL} aria-label="PARP — الصفحة الرئيسية">
      <span className="header-logo__image-frame">
        <img className="header-logo__image" src={logo} alt="شعار المنصة الفلسطينية للبحوث الإجرائية" width="52" height="52" />
      </span>
      <span className="header-logo__wordmark">
        <span className="header-logo__name" lang="en">PARP<span aria-hidden="true">.</span></span>
        <span className="header-logo__subtitle" lang="en">Palestinian Action Research Platform</span>
        <span className="header-logo__arabic" lang="ar" dir="rtl">المنصة الفلسطينية للبحوث الإجرائية</span>
      </span>
    </a>
  )
}
