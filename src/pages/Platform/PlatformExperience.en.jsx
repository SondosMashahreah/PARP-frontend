import { useMemo, useState } from 'react'
import { newsRepositoryEn } from '../../features/news/data/newsRepository.en.js'
import './PlatformExperience.css'

const RESEARCH_ITEMS = [
  {
    id: 'r1',
    title: 'The impact of problem-based learning on mathematical thinking skills',
    field: 'Mathematics',
    author: 'Researcher from the PARP community',
    year: '2026',
    summary: 'An action-research example testing a classroom intervention and measuring its effect on student participation and conceptual understanding.',
  },
  {
    id: 'r2',
    title: 'Classroom strategies for strengthening active student participation',
    field: 'Humanities',
    author: 'Researcher from the PARP community',
    year: '2026',
    summary: 'A practice-based study focused on improving classroom interaction and documenting change during the action-research cycle.',
  },
  {
    id: 'r3',
    title: 'Using formative assessment tools to improve learning',
    field: 'Assessment',
    author: 'Researcher from the PARP community',
    year: '2025',
    summary: 'An applied study on using formative assessment to guide teaching and improve the quality of feedback.',
  },
  {
    id: 'r4',
    title: 'Building a research culture in schools through professional learning communities',
    field: 'Educational Leadership',
    author: 'Researcher from the PARP community',
    year: '2025',
    summary: 'A school-based experience documenting how regular collaborative work can strengthen professional practice.',
  },
]

const CONFERENCE_STEPS = [
  { title: 'Registration', text: 'Create a participation record and confirm researcher and institution information.' },
  { title: 'Proposal submission', text: 'Submit the proposal using the approved template and complete the requirements.' },
  { title: 'Peer review', text: 'Track feedback, decisions, and required revisions.' },
  { title: 'Final research', text: 'Upload the final version after implementing the intervention and analyzing the findings.' },
  { title: 'Results and certificates', text: 'Follow the final decision, certificates, and archiving process.' },
]

const GUIDE_CHAPTERS = [
  ['The nature and ethics of action research', 'A practical introduction to action research, its role, and its ethical boundaries.'],
  ['Problem, question, and objectives', 'Turn a field observation into a research problem and an investigable question.'],
  ['Intervention and data collection tools', 'Design the intervention and choose appropriate tools for gathering evidence.'],
  ['Findings and reflection', 'Organize and analyze data, then connect the findings with changes in practice.'],
  ['Recommendations, writing, and publication', 'Write usable recommendations and prepare the research in a consistent format.'],
]

const TEMPLATE_STEPS = [
  'Researcher and institution information',
  'Research title and keywords',
  'Problem and context',
  'Question and objectives',
  'Target group',
  'Intervention and action plan',
  'Data collection tools',
  'Findings and analysis',
  'Professional reflection',
  'Recommendations',
  'References',
  'Appendices and ethics',
]

const FAQS = [
  ['How do I start an action-research project?', 'Start with a real problem from the field, then use the guide and template to build the question, intervention, and evidence-collection plan.'],
  ['Can I edit the proposal after submitting it?', 'In the full version, editing will depend on the request status and the current review stage.'],
  ['How can I track the research status?', 'The status will appear in your profile with a clear record of stages, feedback, and decisions.'],
]

function RepositoryExperience() {
  const [query, setQuery] = useState('')
  const [field, setField] = useState('All')
  const [selected, setSelected] = useState(null)
  const fields = ['All', ...new Set(RESEARCH_ITEMS.map((item) => item.field))]
  const results = RESEARCH_ITEMS.filter((item) => {
    const matchesField = field === 'All' || item.field === field
    const haystack = `${item.title} ${item.author} ${item.field}`.toLowerCase()
    return matchesField && haystack.includes(query.trim().toLowerCase())
  })

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
          <article className="platform-experience__research-card" key={item.id}>
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
          <article key={item.id} className="platform-experience__news-card">
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
  const [submitted, setSubmitted] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

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

      <form className="platform-experience__support-form" onSubmit={submit}>
        <span>Support ticket</span>
        <h2>How can we help?</h2>
        <input required type="text" placeholder="Name" aria-label="Name" />
        <input required type="email" placeholder="Email" aria-label="Email" />
        <select required defaultValue="" aria-label="Issue type">
          <option value="" disabled>Issue type</option>
          <option>Account and login</option>
          <option>File uploads</option>
          <option>Conference and review</option>
          <option>Other technical issue</option>
        </select>
        <textarea required rows="5" placeholder="Write the details..." aria-label="Issue details" />
        <button type="submit">Submit ticket</button>
        {submitted && <p className="platform-experience__prototype-note">The form has been validated. Server submission will be connected when the backend is ready.</p>}
      </form>
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
  return null
}
