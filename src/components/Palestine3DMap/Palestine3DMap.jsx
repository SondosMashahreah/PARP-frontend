import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/useLanguage.js'
import {
  applyDirectorateLayers, applySchoolLayers, createMap,
  DEFAULT_VIEW,
  DIRECTORATE_FILL, DIRECTORATE_EXT,
  SCHOOLS_CLUSTER, SCHOOLS_POINT, SCHOOLS_SOURCE,
  setHovered, setSelected,
} from './MapEngine.js'
import { getMapTheme, valueForMetric, colorForValue } from './mapTheme.js'
import { t } from './i18n.js'
import { MapControls } from './MapControls.jsx'
import { MapLegend } from './MapLegend.jsx'
import { MetricSelector } from './MetricSelector.jsx'
import { DirectoratePanel } from './DirectoratePanel.jsx'
import { SchoolPanel } from './SchoolPanel.jsx'
import { MapTooltip } from './MapTooltip.jsx'
import { buildDirectorateFeatures, buildSchoolFeatures } from './geo.js'
import { boundsOf, flyTo } from './camera.js'
import './Palestine3DMap.css'

/**
 * Palestine3DMap
 * Reusable 3D GIS component. No backend, no global state.
 * All geographic data arrives via props so it can be replaced with API data.
 */
export function Palestine3DMap({
  directorates,
  schools,
  directoratesGeoJSON,
  demoMode = true,
  initialView = DEFAULT_VIEW,
  initialMetric = 'research',
  onDirectorateClick,
  onSchoolClick,
}) {
  const { language } = useLanguage()
  const s = t(language)

  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const hoverIdRef = useRef(null)
  const selectedIdRef = useRef(null)
  const directoratesRef = useRef(directorates)
  const schoolsRef = useRef(schools)
  const metricRef = useRef(initialMetric)
  const languageRef = useRef(language)

  const [is3D, setIs3D] = useState(true)
  const [metric, setMetric] = useState(initialMetric)
  const [selectedDirectorate, setSelectedDirectorate] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [ready, setReady] = useState(false)

  // Keep latest props in refs for stable MapLibre event handlers.
  useEffect(() => { directoratesRef.current = directorates }, [directorates])
  useEffect(() => { schoolsRef.current = schools }, [schools])
  useEffect(() => { metricRef.current = metric }, [metric])
  useEffect(() => { languageRef.current = language }, [language])

  const theme = useMemo(() => getMapTheme(), [])

  const directorateFeatures = useMemo(
    () => buildDirectorateFeatures(
      directoratesGeoJSON,
      directorates,
      (d) => valueForMetric(d, metric),
      (v) => colorForValue(v, theme),
      language,
    ),
    [directoratesGeoJSON, directorates, metric, language, theme],
  )

  const schoolFeatures = useMemo(
    () => buildSchoolFeatures(schools, language),
    [schools, language],
  )

  function attachInteractions(map) {
    map.on('mousemove', DIRECTORATE_FILL, (e) => {
      if (!e.features || !e.features.length) return
      const f = e.features[0]
      map.getCanvas().style.cursor = 'pointer'
      if (hoverIdRef.current !== f.id) {
        setHovered(map, hoverIdRef.current, f.id)
        hoverIdRef.current = f.id
      }
      const p = f.properties
      const d = directoratesRef.current.find((x) => x.id === p.id)
      if (d) {
        const m = metricRef.current
        const labels = {
          schools: 'schools', teachers: 'teachers', research: 'research',
          interactions: 'interactions', problems: 'problems',
        }
        const l = labels[m] || m
        setTooltip({
          x: e.point.x,
          y: e.point.y,
          title: languageRef.current === 'ar' ? d.nameAr : d.nameEn,
          rows: [{
            label: t(languageRef.current)[l],
            value: valueForMetric(d, m),
          }],
        })
      }
    })

    map.on('mouseleave', DIRECTORATE_FILL, () => {
      map.getCanvas().style.cursor = ''
      setHovered(map, hoverIdRef.current, null)
      hoverIdRef.current = null
      setTooltip(null)
    })

    map.on('click', DIRECTORATE_FILL, (e) => {
      if (!e.features || !e.features.length) return
      const f = e.features[0]
      const id = f.properties.id
      const d = directoratesRef.current.find((x) => x.id === id)
      if (!d) return
      setSelected(map, selectedIdRef.current, f.id)
      selectedIdRef.current = f.id
      setSelectedDirectorate(d)
      setSelectedSchool(null)
      const [[minX, minY], [maxX, maxY]] = boundsOf(f.geometry)
      flyTo(map, {
        center: [(minX + maxX) / 2, (minY + maxY) / 2],
        zoom: Math.max(map.getZoom(), 10),
        pitch: 62,
        bearing: map.getBearing(),
        duration: 1500,
      })
      if (onDirectorateClick) onDirectorateClick(d)
    })

    map.on('mouseenter', SCHOOLS_POINT, () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', SCHOOLS_POINT, () => { map.getCanvas().style.cursor = '' })

    map.on('click', SCHOOLS_POINT, (e) => {
      if (!e.features || !e.features.length) return
      const f = e.features[0]
      const p = f.properties
      const sc = schoolsRef.current.find((x) => x.id === p.id)
      if (!sc) return
      setSelectedSchool(sc)
      setSelectedDirectorate(null)
      if (Number.isFinite(sc.latitude) && Number.isFinite(sc.longitude)) {
        flyTo(map, { center: [sc.longitude, sc.latitude], zoom: 15, pitch: 60, duration: 1200 })
      }
      if (onSchoolClick) onSchoolClick(sc)
    })

    map.on('click', SCHOOLS_CLUSTER, (e) => {
      if (!e.features || !e.features.length) return
      const f = e.features[0]
      const clusterId = f.properties.cluster_id
      const src = map.getSource(SCHOOLS_SOURCE)
      src.getClusterExpansionZoom(clusterId).then((z) => {
        flyTo(map, { center: f.geometry.coordinates, zoom: z + 0.5, duration: 900 })
      })
    })
  }

  // Create the map exactly once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = createMap(containerRef.current, theme)
    mapRef.current = map

    function onLoad() {
      applyDirectorateLayers(map, directorateFeatures, theme)
      applySchoolLayers(map, schoolFeatures, theme)
      attachInteractions(map)
      setReady(true)
    }

    map.on('load', onLoad)
    return () => {
      map.off('load', onLoad)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update directorate layer when metric / language / data change.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    applyDirectorateLayers(map, directorateFeatures, theme)
  }, [directorateFeatures, ready, theme])

  // Update school layer when data / language change.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    applySchoolLayers(map, schoolFeatures, theme)
  }, [schoolFeatures, ready, theme])

  // 2D / 3D toggle.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setLayoutProperty(DIRECTORATE_EXT, 'visibility', is3D ? 'visible' : 'none')
    map.easeTo({ pitch: is3D ? DEFAULT_VIEW.pitch : 0, duration: 600 })
  }, [is3D, ready])

  function handleReset() {
    const map = mapRef.current
    if (!map) return
    setSelected(map, selectedIdRef.current, null)
    selectedIdRef.current = null
    setSelectedDirectorate(null)
    setSelectedSchool(null)
    flyTo(map, { ...initialView, duration: 1400 })
  }

  function handleFullscreen() {
    const el = containerRef.current?.parentElement || containerRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const metricMeta = theme.metrics[metric]
  const metricLabel = language === 'ar' ? metricMeta.labelAr : metricMeta.labelEn

  return (
    <div
      className={`parp-map ${language === 'ar' ? 'parp-map--rtl' : 'parp-map--ltr'}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <header className="parp-map__topbar">
        <div className="parp-map__brand">
          <strong>{s.title}</strong>
          <span>{s.subtitle}</span>
        </div>
        <MetricSelector language={language} value={metric} onChange={setMetric} />
      </header>

      {demoMode && <div className="parp-map__demo-badge" role="note">{s.demoBadge}</div>}

      <div ref={containerRef} className="parp-map__canvas" aria-label={s.title} />

      {!ready && <div className="parp-map__loading">{s.loading}</div>}

      <MapControls
        language={language}
        is3D={is3D}
        onToggle3D={() => setIs3D((v) => !v)}
        onReset={handleReset}
        onFullscreen={handleFullscreen}
      />

      <MapLegend language={language} metric={metric} theme={theme} metricLabel={metricLabel} />

      {tooltip && <MapTooltip {...tooltip} />}

      {selectedDirectorate && (
        <DirectoratePanel
          language={language}
          directorate={selectedDirectorate}
          onClose={() => setSelectedDirectorate(null)}
          onViewSchools={() => {
            const map = mapRef.current
            if (map) flyTo(map, { center: map.getCenter().toArray(), zoom: 12.5, pitch: 55, duration: 900 })
          }}
        />
      )}

      {selectedSchool && (
        <SchoolPanel
          language={language}
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
        />
      )}
    </div>
  )
}