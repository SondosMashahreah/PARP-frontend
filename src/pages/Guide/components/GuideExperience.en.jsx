import { useState } from 'react'
import { GUIDE_CHAPTERS } from '../../../features/platform/data/platformContent.en.js'

export default function GuideExperience() {
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
