import { useState } from 'react'
import { TEMPLATE_STEPS } from '../../../features/platform/data/platformContent.js'

export default function TemplateExperience() {
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
          <span>اكتمال القالب</span>
          <strong>{percent}%</strong>
          <small>{completed} من {TEMPLATE_STEPS.length} خطوة</small>
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
