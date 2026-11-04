import { useState } from 'react'
import RibbonButton from '../../../components/RibbonButton/RibbonButton.jsx'
import { visibleSections } from '../../../features/researcher/workspaceSections.js'
import './RibbonButtonShowcase.css'

const captions = {
  research: ['من الفكرة إلى النشر', 'From idea to publication'],
  practices: ['تجربة تستحق أن تُروى', 'A practice worth sharing'],
  tracking: ['كل قرار، خطوة للأمام', 'Every decision, a step ahead'],
  training: ['خطوة جديدة في تعلّمك', 'Your next learning step'],
}
const relatedRoutes = {
  research: ['new', 'drafts', 'decisions', 'tracking'].map(id => `/workspace#${id}`),
  practices: ['/workspace#new-practice'],
}

export default function RibbonButtonShowcase({ role, isArabic }) {
  const [paused, setPaused] = useState(false)
  const sections = visibleSections(role).slice(0, 4)
  if (!sections.length) return null
  return <section className="ribbon-showcase" aria-labelledby="ribbon-showcase-title">
    <div className="ribbon-showcase__heading">
      <div>
        <span className="ribbon-showcase__eyebrow">{isArabic ? 'تجربة جديدة' : 'A NEW EXPERIENCE'}</span>
        <h2 id="ribbon-showcase-title">{isArabic ? 'رحلتك، على شريط' : 'Your journey, unfolding'}</h2>
        <p>{isArabic ? 'اختر دائرتك، ودع التفاصيل تتفتّح.' : 'Choose a circle. Let the details unfold.'}</p>
      </div>
      <button className="ribbon-showcase__pause" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={isArabic ? 'إيقاف الحركة' : 'Pause animation'}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="currentColor">{paused ? <path d="m6 3 10 7-10 7Z" /> : <path d="M5 4h3v12H5Zm7 0h3v12h-3Z" />}</svg>
        {paused ? isArabic ? 'متابعة الحركة' : 'Resume' : isArabic ? 'إيقاف الحركة' : 'Pause motion'}
      </button>
    </div>
    <div className="ribbon-showcase__grid">
      {sections.map((section, index) => <RibbonButton key={section.id} to={`/workspace#${section.id}`} relatedRoutes={relatedRoutes[section.id]} label={isArabic ? section.ar : section.en} caption={captions[section.id][isArabic ? 0 : 1]} symbol={section.symbol} icon={section.id} isArabic={isArabic} offset={index * 700} paused={paused} />)}
    </div>
  </section>
}
