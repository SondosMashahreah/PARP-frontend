import { useLanguage } from '../../i18n/LanguageContext.jsx'
import Icon from '../ui/Icon.jsx'
import './HeaderSearch.css'

export default function HeaderSearch() {
  const { isArabic, dir } = useLanguage()
  const label = isArabic ? 'البحث في المنصة' : 'Search the platform'
  const placeholder = isArabic ? 'ابحث في المنصة...' : 'Search the platform...'

  return (
    <form className="header-search" role="search" dir={dir} onSubmit={(event) => event.preventDefault()}>
      <label className="visually-hidden" htmlFor="header-search">{label}</label>
      <Icon name="search" className="header-search__icon" />
      <input id="header-search" name="q" type="search" placeholder={placeholder} autoComplete="off" />
    </form>
  )
}
