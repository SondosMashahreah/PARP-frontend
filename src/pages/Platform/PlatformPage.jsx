import { useLanguage } from '../../i18n/useLanguage.js'
import PlatformExperience from './PlatformExperience.jsx'
import PlatformExperienceEn from './PlatformExperience.en.jsx'
import './PlatformPage.css'

export default function PlatformPage({ page }) {
  const { isArabic, dir } = useLanguage()
  const hasExperience = Boolean(page.kind)

  return (
    <section className="platform-page" dir={dir} aria-labelledby="platform-page-title">
      <div className="platform-page__glow" aria-hidden="true" />

      <header className="platform-page__hero">
        <div className="platform-page__hero-copy">
          <span className="platform-page__eyebrow">{page.eyebrow}</span>
          <h1 id="platform-page-title">{page.title}</h1>
          <p>{page.description}</p>
        </div>

        <div className="platform-page__hero-mark" aria-hidden="true">
          <span>PARP</span>
          <i />
          <small>Action Research</small>
        </div>
      </header>

      <div className="platform-page__intro-line">
        <span>{page.primary}</span>
        <i aria-hidden="true" />
      </div>

      {hasExperience && (
        isArabic
          ? <PlatformExperience kind={page.kind} />
          : <PlatformExperienceEn kind={page.kind} />
      )}

      {!hasExperience && (
        <div className="platform-page__grid">
          {page.sections.map((section, index) => (
            <article className="platform-page__card" key={section.title}>
              <span className="platform-page__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2>{section.title}</h2>
              {section.body && <p>{section.body}</p>}
              {section.items && (
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
