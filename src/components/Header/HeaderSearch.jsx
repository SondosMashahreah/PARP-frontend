import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { navigate } from '../../routing/navigation.js'
import { searchPlatform } from '../../features/search/application/searchPlatform.js'
import Icon from '../ui/Icon.jsx'
import './HeaderSearch.css'

export default function HeaderSearch() {
  const { language, isArabic, dir } = useLanguage()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const results = searchPlatform(query, { language, limit: 5 })
  const active = open && query.trim().length > 0
  const label = isArabic ? 'البحث في المنصة' : 'Search the platform'
  const close = () => setOpen(false)
  function submit(event) {
    event.preventDefault()
    if (!query.trim()) return
    close()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }
  return (
    <div className="header-search-wrap" dir={dir} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) close()
    }} onKeyDown={(event) => {
      if (event.key === 'Escape') { close(); event.stopPropagation() }
      if (event.key === 'ArrowDown' && event.target.tagName === 'INPUT') {
        const first = event.currentTarget.querySelector('.header-search__results a')
        if (first) { event.preventDefault(); first.focus() }
      }
    }}>
      <form className="header-search" role="search" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="header-search-input">{label}</label>
        <input id="header-search-input" name="q" type="search" value={query} maxLength={160}
          placeholder={isArabic ? 'ابحث بالعربية أو الإنجليزية…' : 'Search in Arabic or English…'}
          autoComplete="off" onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true) }}
          aria-controls={active ? 'header-search-results' : undefined} />
        <button className="header-search__submit" type="submit" aria-label={label} disabled={!query.trim()}><Icon name="search" /></button>
      </form>
      {active && <div className="header-search__results" id="header-search-results">
        <p role="status">{results.length ? (isArabic ? 'نتائج مقترحة' : 'Suggested results') : (isArabic ? 'لا توجد نتائج. جرّب كلمة أخرى.' : 'No matches. Try another keyword.')}</p>
        <ul>{results.map((result) => <li key={result.id}>
          <RouteLink to={result.to} onClick={close}><span>{result.title}</span><small>{result.description}</small></RouteLink>
        </li>)}</ul>
        <RouteLink className="header-search__all" to={`/search?q=${encodeURIComponent(query.trim())}`} onClick={close}>
          {isArabic ? 'عرض نتائج البحث' : 'View search results'} <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
        </RouteLink>
      </div>}
    </div>
  )
}
