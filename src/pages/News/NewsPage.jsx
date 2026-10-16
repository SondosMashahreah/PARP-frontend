import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { useLocation } from '../../routing/useLocation.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { useNews } from '../../features/news/useNews.js'
import { displayNews } from '../../features/news/newsApi.js'
import './NewsPage.css'
import './LiveNews.css'

export default function NewsPage() {
  const { isArabic: ar, dir } = useLanguage()
  const { search } = useLocation()
  const id = new URLSearchParams(search).get('article')
  const [offset, setOffset] = useState(0)
  const [revision, setRevision] = useState(0)
  const { data, error, loading } = useNews({ id, offset, revision })
  const date = value => value ? new Date(value).toLocaleDateString(ar ? 'ar-PS' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const article = id && data ? displayNews(data, ar) : null
  return <section className="live-news" dir={dir}>
    <RouteLink to={id ? '/news' : '/'}>{ar ? (id ? '← جميع الأخبار' : '← الرئيسية') : (id ? '← All news' : '← Home')}</RouteLink>
    {loading && <p role="status">{ar ? 'جاري تحميل الخبر…' : 'Loading news…'}</p>}
    {error && <div role="alert"><p>{ar ? 'تعذر عرض الخبر. قد يكون غير منشور أو غير متاح حالياً.' : 'News is unavailable. It may be unpublished or temporarily unavailable.'}</p><button onClick={() => setRevision(x => x + 1)}>{ar ? 'إعادة المحاولة' : 'Retry'}</button></div>}
    {article && <article className="live-news__article">
      <span className="live-news__category">{article.category}</span><h1>{article.title}</h1>
      <time dateTime={article.publishedAt}>{date(article.publishedAt)}</time>
      {article.image && <img className="live-news__hero" src={article.image} alt={article.imageAlt} />}
      {article.excerpt && <p className="live-news__intro">{article.excerpt}</p>}
      <div className="live-news__body">{article.body}</div>
    </article>}
    {!id && data && <><h1>{ar ? 'أخبار المنصة' : 'Platform news'}</h1>
      {!data.total && <p>{ar ? 'لا توجد أخبار منشورة حالياً.' : 'No news has been published yet.'}</p>}
      <div className="live-news__grid">{data.items.map(row => { const item = displayNews(row, ar); return <article key={item.id}>
        {item.image && <RouteLink to={item.href}><img src={item.image} alt={item.imageAlt} loading="lazy" /></RouteLink>}
        <div><span className="live-news__category">{item.category}</span><time dateTime={item.publishedAt}>{date(item.publishedAt)}</time>
          <h2><RouteLink to={item.href}>{item.title}</RouteLink></h2><p>{item.excerpt}</p><RouteLink to={item.href}>{ar ? 'عرض التفاصيل ←' : 'Read more →'}</RouteLink></div>
      </article> })}</div>
      <nav className="live-news__pagination" aria-label={ar ? 'صفحات الأخبار' : 'News pages'}><button disabled={!offset} onClick={() => setOffset(Math.max(0, offset - 12))}>{ar ? 'السابق' : 'Previous'}</button><span>{Math.floor(offset / 12) + 1}</span><button disabled={offset + 12 >= data.total} onClick={() => setOffset(offset + 12)}>{ar ? 'التالي' : 'Next'}</button></nav>
    </>}
  </section>
}
