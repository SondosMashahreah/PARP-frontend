import { useState } from 'react'
import { useLanguage } from '../../../i18n/useLanguage.js'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import { platformPages } from '../../../pages/Platform/platformPages.js'
import { platformPagesEn } from '../../../pages/Platform/platformPages.en.js'
import logo from '../../../components/Header/img/logo.png'
import { MOBILE_POSITIONS, NETWORK_EDGES, NETWORK_POSITIONS } from '../domain/network.js'
import { useValuesNetwork } from './useValuesNetwork.js'
import './ValuesNetwork.css'

export default function ValuesNetwork() {
  const { language, isArabic, dir } = useLanguage()
  const [paused, setPaused] = useState(false)
  const stage = useValuesNetwork(paused, language)
  const page = (isArabic ? platformPages : platformPagesEn)['/about']
  const values = page.sections.find((section) => section.title === (isArabic ? 'قيم المنصة' : 'Platform values')).items
  return (
    <section className="values-network" id="platform-values" dir={dir} aria-labelledby="values-network-title">
      <header className="values-network__heading">
        <div>
          <span className="home-section-eyebrow">{isArabic ? 'ما يجمعنا، وما يقودنا' : 'What connects us. What guides us.'}</span>
          <h2 id="values-network-title">{isArabic ? 'قيمنا… صِلات تصنع الأثر' : 'Our values. Connected by purpose.'}</h2>
          <p>{isArabic ? 'ست قيم تلتقي في قلب المنصة، وترافق كل خطوة في رحلة البحث.' : 'Six shared values at the heart of PARP, guiding every step of the research journey.'}</p>
        </div>
        <RouteLink className="values-network__about" to="/about">{isArabic ? 'عن المنصة' : 'About PARP'} <span aria-hidden="true">↗</span></RouteLink>
      </header>
      <div className="values-network__stage" ref={stage}>
        <svg className="values-network__threads" aria-hidden="true">
          {Array.from({ length: values.length + NETWORK_EDGES.length }, (_, i) => <line key={i} className={i < values.length ? 'values-network__spoke' : ''} />)}
        </svg>
        <div className="values-network__hub" aria-hidden="true">
          <div className="values-network__seal"><img src={logo} alt="" draggable="false" /></div>
          <strong>PARP</strong>
          <span>{isArabic ? 'معرفة تجمعنا' : 'Knowledge connects us'}</span>
        </div>
        <ul className="values-network__nodes" aria-label={isArabic ? 'قيم المنصة' : 'Platform values'}>
          {values.map((value, index) => <li key={index}>
            <RouteLink to="/about" className="values-network__node" data-value-node="" draggable="false"
              style={{ '--nx': `${NETWORK_POSITIONS[index][0] * 100}%`, '--ny': `${NETWORK_POSITIONS[index][1] * 100}%`, '--mx': `${MOBILE_POSITIONS[index][0] * 100}%`, '--my': `${MOBILE_POSITIONS[index][1] * 100}%` }}>
              <span className="values-network__dot" aria-hidden="true" /><span>{value}</span>
            </RouteLink>
          </li>)}
        </ul>
      </div>
      <footer className="values-network__footer">
        <p>{isArabic ? 'اسحب قيمة برفق وشاهدها تعود… أو اضغط لتعرف أكثر عن المنصة.' : 'Drag a value and watch it spring back. Select it to discover PARP.'}</p>
        <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
          <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span> {isArabic ? (paused ? 'تشغيل الحركة' : 'إيقاف الحركة') : (paused ? 'Resume motion' : 'Pause motion')}
        </button>
      </footer>
    </section>
  )
}
