import { useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import { useEducationData } from '../educationMap/application/useEducationData.js'
import MapCanvas from '../educationMap/presentation/MapCanvas.jsx'
import { mapStrings } from '../educationMap/presentation/strings.js'
import '../educationMap/presentation/EducationMap.css'

export default function ObservatoryMap() {
  const { language, dir } = useLanguage()
  const copy = mapStrings[language]
  const [revision, setRevision] = useState(0)
  const [focus, setFocus] = useState(null)
  const boundaries = useEducationData('/boundaries', revision)
  return (
    <div className="education-map education-map--observatory" dir={dir}>
      {boundaries.error ? (
        <div className="education-map__status" role="alert">
          <p>{copy.error}</p>
          <button onClick={() => setRevision((n) => n + 1)}>
            {copy.retry}
          </button>
        </div>
      ) : boundaries.loading ? (
        <div className="education-map__status" role="status">
          {copy.loading}
        </div>
      ) : !boundaries.data.features.length ? (
        <div className="education-map__status">{copy.noData}</div>
      ) : (
        <MapCanvas
          key={language}
          geography={boundaries.data}
          language={language}
          copy={copy}
          focus={focus}
          selectedGovernorate={focus?.governorateId}
          onGovernorate={(id) => setFocus({ governorateId: id })}
        />
      )}
      <div className="education-map__notice">
        <p>{copy.researchPending}</p>
        <RouteLink to="/map">{copy.directoryLink} ↗</RouteLink>
      </div>
    </div>
  )
}
