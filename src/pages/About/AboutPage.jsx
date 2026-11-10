import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { content } from './AboutPage.content.js'
import ValuesNetwork from '../../features/values/presentation/ValuesNetwork.jsx'
import './AboutPage.css'

const copy = {
  ar: {
    index: 'تعرف على PARP',
    discover: 'اكتشف ما نؤمن به',
    visionLead: 'بوصلتنا نحو المستقبل',
    missionLead: 'رسالة من قلب الميدان',
    missionClosed: 'اضغط لفتح الرسالة',
    missionOpened: 'اضغط لإغلاق الرسالة',
    missionSignature: 'المنصة الفلسطينية للبحوث الإجرائية',
    valueLead: 'المبادئ التي تجمعنا',
    valueHint: 'اختر قيمة لتسليط الضوء عليها',
    valueName: 'قيمتنا المختارة',
    goalsLead: 'خارطة الأثر',
    goalsHint: 'من الفكرة إلى الأثر التربوي',
    explore: 'استكشف المستودع البحثي',
    news: 'آخر الأخبار',
    preface: 'أفكار تنمو. تجارب تُوثّق. معرفة تُشارك.',
  },
  en: {
    index: 'Discover PARP',
    discover: 'Explore what guides us',
    visionLead: 'Our compass for the future',
    missionLead: 'A letter from the field',
    missionClosed: 'Open the letter',
    missionOpened: 'Close the letter',
    missionSignature: 'Palestinian Action Research Platform',
    valueLead: 'The principles that unite us',
    valueHint: 'Choose a value to highlight',
    valueName: 'Selected principle',
    goalsLead: 'Our impact roadmap',
    goalsHint: 'From ideas to educational impact',
    explore: 'Explore the research repository',
    news: 'Latest news',
    preface: 'Ideas grow. Experiences are documented. Knowledge is shared.',
  },
}

const decorativeStars = Array.from({ length: 6 }, (_, index) => index)

function CompassArtwork() {
  return <div className="about-vision__compass" aria-hidden="true">
    <div className="about-vision__compass-halo" />
    <svg viewBox="0 0 260 260" fill="none" focusable="false">
      <circle cx="130" cy="130" r="116" stroke="currentColor" strokeOpacity=".36" strokeWidth="1" />
      <circle cx="130" cy="130" r="88" stroke="currentColor" strokeOpacity=".20" strokeWidth="1" strokeDasharray="3 11" />
      <circle cx="130" cy="130" r="53" stroke="currentColor" strokeOpacity=".26" />
      <path d="M130 22V238M22 130H238M54 54L206 206M206 54L54 206" stroke="currentColor" strokeOpacity=".23" strokeWidth="1" />
      <path d="M130 41L149 111L219 130L149 149L130 219L111 149L41 130L111 111Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M130 71L143 117L189 130L143 143L130 189L117 143L71 130L117 117Z" fill="currentColor" fillOpacity=".17" />
      <circle cx="130" cy="130" r="8" fill="currentColor" />
      <circle cx="130" cy="14" r="3" fill="currentColor" />
      <circle cx="246" cy="130" r="3" fill="currentColor" />
      <circle cx="130" cy="246" r="3" fill="currentColor" />
      <circle cx="14" cy="130" r="3" fill="currentColor" />
    </svg>
  </div>
}

function MissionEnvelope({ title, body, text, isOpen, setIsOpen }) {
  return <section className="about-mission" id="about-mission" data-about-reveal>
    <div className="about-section__heading about-section__heading--center">
      <span className="about-section__eyebrow">02 / {text.missionLead}</span>
      <h2>{title}</h2>
    </div>
    <button
      className={`about-envelope${isOpen ? ' is-open' : ''}`}
      type="button"
      onClick={() => setIsOpen(value => !value)}
      aria-expanded={isOpen}
      aria-controls="about-mission-letter"
      aria-label={`${title} — ${isOpen ? text.missionOpened : text.missionClosed}`}
    >
      <span className="about-envelope__back" aria-hidden="true" />
      <span className="about-envelope__sheet" aria-hidden="true"><span>PARP</span><i /><i /><i /></span>
      <span className="about-envelope__flap" aria-hidden="true" />
      <span className="about-envelope__front" aria-hidden="true" />
      <span className="about-envelope__seal" aria-hidden="true">P</span>
    </button>
    <p className="about-mission__instruction">{isOpen ? text.missionOpened : text.missionClosed} <span aria-hidden="true">{isOpen ? '−' : '+'}</span></p>
    <div className={`about-mission__letter${isOpen ? ' is-open' : ''}`} id="about-mission-letter" aria-hidden={!isOpen} inert={!isOpen}>
      <div className="about-mission__letter-clip">
        <div className="about-mission__letter-paper">
          <span className="about-mission__letter-mark" aria-hidden="true">PARP / 02</span>
          <h3>{title}</h3>
          <p>{body}</p>
          <span className="about-mission__signature">{text.missionSignature}</span>
        </div>
      </div>
    </div>
  </section>
}

export default function AboutPage() {
  const { isArabic, dir } = useLanguage()
  const language = isArabic ? 'ar' : 'en'
  const page = content[language]
  const text = copy[language]
  const [vision, mission, values, goals] = page.sections
  const [missionOpen, setMissionOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(0)
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return undefined
    const nodes = root.querySelectorAll('[data-about-reveal]')
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 25px 0px' })
    nodes.forEach(node => observer.observe(node))
    root.classList.add('about-page--motion-ready')
    return () => { observer.disconnect(); root.classList.remove('about-page--motion-ready') }
  }, [])

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }

  return <section className="about-page" dir={dir} ref={rootRef} aria-labelledby="about-page-title">
    <div className="about-page__grain" aria-hidden="true" />
    <header className="about-hero">
      <div className="about-hero__copy" data-about-reveal>
        <span className="about-hero__eyebrow"><span aria-hidden="true" />{page.eyebrow} <span className="about-hero__eyebrow-en">/ ABOUT PARP</span></span>
        <h1 id="about-page-title">{page.title}</h1>
        <p>{page.description}</p>
        <div className="about-hero__actions">
          <button type="button" className="about-hero__primary" onClick={() => scrollToSection('about-mission')}>{text.discover}<span aria-hidden="true">↗</span></button>
          <button type="button" className="about-hero__ghost" onClick={() => scrollToSection('about-vision')}>{vision.title}<span aria-hidden="true">↓</span></button>
        </div>
      </div>
      <div className="about-hero__art" aria-hidden="true" data-about-reveal>
        <div className="about-hero__orbit about-hero__orbit--outer" />
        <div className="about-hero__orbit about-hero__orbit--inner" />
        {decorativeStars.map(index => <span className={`about-hero__star about-hero__star--${index + 1}`} key={index}>✦</span>)}
        <div className="about-hero__medallion"><small>PALESTINIAN</small><strong>PARP</strong><i /><small>ACTION RESEARCH</small></div>
        <span className="about-hero__art-caption">RESEARCH · REFLECT · IMPROVE</span>
      </div>
    </header>

    <div className="about-page__folio" aria-hidden="true"><span>PARP — 01 / 04</span><span>•</span><span>{text.preface}</span></div>

    <section className="about-vision" id="about-vision" data-about-reveal aria-labelledby="about-vision-title">
      <div className="about-vision__visual"><CompassArtwork /><span className="about-vision__visual-caption" aria-hidden="true">VISION / 01</span></div>
      <div className="about-vision__copy">
        <div className="about-section__heading"><span className="about-section__eyebrow">01 / {text.visionLead}</span><h2 id="about-vision-title">{vision.title}</h2></div>
        <p>{vision.body}</p>
        <span className="about-vision__rule" aria-hidden="true"><i /></span>
      </div>
    </section>

    <MissionEnvelope title={mission.title} body={mission.body} text={text} isOpen={missionOpen} setIsOpen={setMissionOpen} />

    <section className="about-values" id="about-values" aria-labelledby="about-values-title" data-about-reveal>
      <div className="about-section__heading"><span className="about-section__eyebrow">03 / {text.valueLead}</span><h2 id="about-values-title">{values.title}</h2><p>{text.valueHint}</p></div>
      <ValuesNetwork embedded items={values.items} selectedIndex={selectedValue} onSelect={setSelectedValue} />
    </section>

    <section className="about-goals" id="about-goals" aria-labelledby="about-goals-title" data-about-reveal>
      <div className="about-section__heading about-section__heading--center"><span className="about-section__eyebrow">04 / {text.goalsLead}</span><h2 id="about-goals-title">{goals.title}</h2><p>{text.goalsHint}</p></div>
      <ol className="about-goals__list">
        {goals.items.map((goal, index) => <li key={goal} className="about-goals__step" style={{ '--step-index': index }}>
          <span className="about-goals__step-node" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="about-goals__step-card"><span className="about-goals__step-label">PARP / {String(index + 1).padStart(2, '0')}</span><h3>{goal}</h3><span className="about-goals__step-arrow" aria-hidden="true">↗</span></div>
        </li>)}
      </ol>
    </section>

    <footer className="about-footer" data-about-reveal>
      <div><span className="about-footer__mark" aria-hidden="true">✦</span><p>{text.preface}</p></div>
      <nav aria-label={text.index}><RouteLink to="/repository">{text.explore} <span aria-hidden="true">↗</span></RouteLink><RouteLink to="/news">{text.news} <span aria-hidden="true">↗</span></RouteLink></nav>
    </footer>
  </section>
}
