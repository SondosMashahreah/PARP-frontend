import { useMemo } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import { Palestine3DMap } from '../../components/Palestine3DMap/Palestine3DMap.jsx'
import { demoSchools } from './data/schools.js'
import directoratesGeo from './data/directorates.json'
import { DEMO_MODE } from './data/demoMetrics.js'
import './ObservatoryMap.css'

export default function ObservatoryMap() {
  const { language } = useLanguage()

  const directorates = useMemo(
    () => directoratesGeo.features.map((f) => ({
      id: f.properties.id,
      nameAr: f.properties.nameAr,
      nameEn: f.properties.nameEn,
      schoolCount: f.properties.schoolCount,
      teacherCount: f.properties.teacherCount,
      researchCount: f.properties.researchCount,
      interactionCount: f.properties.interactionCount,
      problemCount: f.properties.problemCount,
    })),
    [],
  )

  return (
    <div className="observatory-map" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Palestine3DMap
        directorates={directorates}
        schools={demoSchools}
        directoratesGeoJSON={directoratesGeo}
        demoMode={DEMO_MODE}
      />
    </div>
  )
}