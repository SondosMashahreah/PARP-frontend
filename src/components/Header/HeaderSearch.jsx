import Icon from '../ui/Icon.jsx'
import './HeaderSearch.css'

export default function HeaderSearch() {
  return (
    <form className="header-search" role="search" dir="rtl" onSubmit={(event) => event.preventDefault()}>
      <label className="visually-hidden" htmlFor="header-search">البحث في المنصة</label>
      <Icon name="search" className="header-search__icon" />
      <input id="header-search" name="q" type="search" placeholder="ابحث في المنصة..." autoComplete="off" />
    </form>
  )
}
