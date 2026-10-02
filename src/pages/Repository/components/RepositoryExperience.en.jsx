import { useState } from 'react'
import { filterResearch } from '../../../features/platform/application/filterResearch.js'
import { RESEARCH_ITEMS } from '../../../features/platform/data/platformContent.en.js'

export default function RepositoryExperience() {
  const [query, setQuery] = useState('')
  const [field, setField] = useState('All')
  const [selected, setSelected] = useState(null)
  const fields = ['All', ...new Set(RESEARCH_ITEMS.map((item) => item.field))]
  const results = filterResearch(query, { language: 'en', field: field === 'All' ? '' : field })

  return (
    <div className="platform-experience">
      <div className="platform-experience__toolbar">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search research..."
          aria-label="Search the repository"
        />
        <select value={field} onChange={(event) => setField(event.target.value)} aria-label="Filter by field">
          {fields.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>

      <div className="platform-experience__result-count">{results.length} results</div>

      <div className="platform-experience__research-grid">
        {results.map((item) => (
          <article className="platform-experience__research-card" key={item.id} id={item.id}>
            <div className="platform-experience__meta"><span>{item.field}</span><span>{item.year}</span></div>
            <h2>{item.title}</h2>
            <p>{item.author}</p>
            <button type="button" onClick={() => setSelected(item)}>View summary</button>
          </article>
        ))}
      </div>

      {selected && (
        <div className="platform-experience__modal" role="presentation" onClick={() => setSelected(null)}>
          <article role="dialog" aria-modal="true" aria-labelledby="research-modal-title-en" onClick={(event) => event.stopPropagation()}>
            <button className="platform-experience__modal-close" type="button" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <span>{selected.field} · {selected.year}</span>
            <h2 id="research-modal-title-en">{selected.title}</h2>
            <p>{selected.summary}</p>
          </article>
        </div>
      )}
    </div>
  )
}
