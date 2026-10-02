import { useMemo } from 'react'
import { newsRepository } from '../../../features/news/data/newsRepository.js'

export default function NewsExperience() {
  const items = useMemo(() => newsRepository.getLatest().filter((item) => item.title), [])
  return (
    <div className="platform-experience">
      <div className="platform-experience__news-grid">
        {items.map((item) => (
          <article key={item.id} id={item.id} className="platform-experience__news-card">
            <div className="platform-experience__news-media">
              {item.image ? <img src={item.image} alt={item.imageAlt || ''} /> : <span>PARP</span>}
            </div>
            <div>
              <div className="platform-experience__meta"><span>{item.category}</span><span>{item.publishedAt}</span></div>
              <h2>{item.title}</h2>
              {item.excerpt && <p>{item.excerpt}</p>}
              {item.href && <a href={item.href}>اقرأ الخبر ←</a>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
