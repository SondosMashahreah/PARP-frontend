import { useState } from 'react'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import { CONFERENCE_STEPS } from '../../../features/platform/data/platformContent.js'

export default function ConferenceExperience() {
  const [active, setActive] = useState(0)
  return (
    <div className="platform-experience platform-experience--split">
      <div className="platform-experience__steps">
        {CONFERENCE_STEPS.map((step, index) => (
          <button type="button" key={step.title} className={index === active ? 'is-active' : ''} onClick={() => setActive(index)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{step.title}
          </button>
        ))}
      </div>
      <article className="platform-experience__focus-card">
        <small>المرحلة {String(active + 1).padStart(2, '0')}</small>
        <h2>{CONFERENCE_STEPS[active].title}</h2>
        <p>{CONFERENCE_STEPS[active].text}</p>
        <div className="platform-experience__status">المسار التشغيلي الفعلي للرفع والتحكيم والقرارات مرتبط بمساحة العمل وصلاحية الحساب.</div>
        <RouteLink className="platform-page__back" to="/workspace">فتح مساحة العمل ←</RouteLink>
      </article>
    </div>
  )
}
