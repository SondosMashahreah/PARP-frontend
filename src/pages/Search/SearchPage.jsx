import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { searchPlatform } from '../../features/search/application/searchPlatform.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { navigate } from '../../routing/navigation.js'
import Icon from '../../components/ui/Icon.jsx'
import './SearchPage.css'

export default function SearchPage({ query = '' }) {
  const { language, isArabic, dir } = useLanguage()
  const [input, setInput] = useState(query)
  const results = searchPlatform(query, { language })
  const types = isArabic ? { page: 'صفحة', news: 'خبر', research: 'بحث', journey: 'رحلة الباحث' } : { page: 'Page', news: 'News', research: 'Research', journey: 'Research journey' }
  function submit(event) { event.preventDefault(); navigate(`/search?q=${encodeURIComponent(input.trim())}`) }
  return <section className="search-page" dir={dir} aria-labelledby="search-title">
    <span className="search-page__eyebrow">PARP</span>
    <h1 id="search-title">{isArabic ? 'ابحث في المنصة' : 'Search PARP'}</h1>
    <p>{isArabic ? 'صفحات المنصة والأخبار والبحوث وخطوات الرحلة، بالعربية والإنجليزية.' : 'Find platform pages, news, research and journey steps in Arabic or English.'}</p>
    <form onSubmit={submit} role="search" className="search-page__form">
      <label className="visually-hidden" htmlFor="page-search">{isArabic ? 'كلمات البحث' : 'Search keywords'}</label>
      <input id="page-search" type="search" value={input} maxLength={160} onChange={(event) => setInput(event.target.value)} placeholder={isArabic ? 'ماذا تبحث عنه؟' : 'What are you looking for?'} />
      <button type="submit" aria-label={isArabic ? 'بحث' : 'Search'}><Icon name="search" /><span>{isArabic ? 'بحث' : 'Search'}</span></button>
    </form>
    {query.trim() ? <>
      <p className="search-page__count" role="status">{isArabic ? `${results.length} نتيجة لـ` : `${results.length} results for`} <bdi>“{query}”</bdi></p>
      {results.length ? <ol className="search-page__results">{results.map((result) => <li key={result.id}>
        <RouteLink to={result.to}><small>{types[result.type]}</small><h2>{result.title}</h2><p>{result.description}</p><span className="search-page__arrow" aria-hidden="true">{isArabic ? '←' : '→'}</span></RouteLink>
      </li>)}</ol> : <div className="search-page__empty"><h2>{isArabic ? 'لم نجد محتوى مطابقًا' : 'No matching content'}</h2><p>{isArabic ? 'جرّب كلمات أقصر، مثل الدليل، تدريب أو research.' : 'Try shorter keywords such as guide, training or بحث.'}</p></div>}
    </> : <div className="search-page__suggestions">{[['/guide', 'الدليل', 'Guide'], ['/repository', 'البحوث', 'Research'], ['/training', 'التدريب', 'Training']].map(([to, ar, en]) => <RouteLink key={to} to={to}>{isArabic ? ar : en}</RouteLink>)}</div>}
  </section>
}
