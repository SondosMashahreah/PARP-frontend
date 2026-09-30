import { filterResearch } from '../../features/platform/application/filterResearch.js'
import ContactForm from '../../features/contact/presentation/ContactForm.jsx'
import { useMemo, useState } from 'react'
import { newsRepositoryEn } from '../../features/news/data/newsRepository.en.js'
import './PlatformExperience.css'

import { RESEARCH_ITEMS, CONFERENCE_STEPS, GUIDE_CHAPTERS, TEMPLATE_STEPS, FAQS } from '../../features/platform/data/platformContent.en.js'

import ObservatoryMap from '../../features/observatory/ObservatoryMap.jsx'

function RepositoryExperience() {
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

function ConferenceExperience() {
  const [active, setActive] = useState(0)
  return (
    <div className="platform-experience platform-experience--split">
      <div className="platform-experience__steps">
        {CONFERENCE_STEPS.map((step, index) => (
          <button
            type="button"
            key={step.title}
            className={index === active ? 'is-active' : ''}
            onClick={() => setActive(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {step.title}
          </button>
        ))}
      </div>
      <article className="platform-experience__focus-card">
        <small>Stage {String(active + 1).padStart(2, '0')}</small>
        <h2>{CONFERENCE_STEPS[active].title}</h2>
        <p>{CONFERENCE_STEPS[active].text}</p>
        <div className="platform-experience__status">Prototype interface — account and request integration will be connected later.</div>
      </article>
    </div>
  )
}

function GuideExperience() {
  const [active, setActive] = useState(0)
  return (
    <div className="platform-experience platform-experience--split">
      <div className="platform-experience__steps">
        {GUIDE_CHAPTERS.map(([title], index) => (
          <button
            type="button"
            key={title}
            className={index === active ? 'is-active' : ''}
            onClick={() => setActive(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {title}
          </button>
        ))}
      </div>
      <article className="platform-experience__focus-card">
        <small>Palestinian Guide</small>
        <h2>{GUIDE_CHAPTERS[active][0]}</h2>
        <p>{GUIDE_CHAPTERS[active][1]}</p>
        <button type="button" className="platform-experience__primary-action">Continue chapter</button>
      </article>
    </div>
  )
}

function TemplateExperience() {
  const [done, setDone] = useState(() => new Set())
  const completed = done.size
  const percent = Math.round((completed / TEMPLATE_STEPS.length) * 100)

  const toggle = (index) => {
    setDone((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="platform-experience">
      <div className="platform-experience__progress-card">
        <div>
          <span>Template completion</span>
          <strong>{percent}%</strong>
          <small>{completed} of {TEMPLATE_STEPS.length} steps</small>
        </div>
        <div className="platform-experience__progress"><span style={{ width: `${percent}%` }} /></div>
      </div>
      <div className="platform-experience__checklist">
        {TEMPLATE_STEPS.map((title, index) => (
          <label key={title} className={done.has(index) ? 'is-done' : ''}>
            <input type="checkbox" checked={done.has(index)} onChange={() => toggle(index)} />
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{title}</strong>
          </label>
        ))}
      </div>
    </div>
  )
}

function NewsExperience() {
  const items = useMemo(() => newsRepositoryEn.getLatest().filter((item) => item.title), [])
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
              {item.href && <a href={item.href}>Read story →</a>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function SupportExperience() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="platform-experience platform-experience--support">
      <div>
        <h2 className="platform-experience__section-title">Frequently Asked Questions</h2>
        <div className="platform-experience__faq">
          {FAQS.map(([question, answer], index) => (
            <div key={question}>
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <span>{question}</span><span>{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="platform-experience__support-form"><h2>How can we help?</h2><ContactForm /></div>
    </div>
  )
}

export default function PlatformExperienceEn({ kind }) {
  if (kind === 'repository') return <RepositoryExperience />
  if (kind === 'conference') return <ConferenceExperience />
  if (kind === 'guide') return <GuideExperience />
  if (kind === 'template') return <TemplateExperience />
  if (kind === 'news') return <NewsExperience />
  if (kind === 'support') return <SupportExperience />
  if (kind === 'observatory-map') return <ObservatoryMap />
  return null
}
