import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { historicalPalestineUrl, historicalPalestineBounds, historicalPalestineSource } from '../data/historicalPalestine.js'
import {
  geometryBounds,
  hasCoordinates,
  localizedName,
  EMPTY_GEOJSON,
} from '../domain/geography.js'

export default function MapCanvas({
  geography,
  directorateGeography = EMPTY_GEOJSON,
  points = EMPTY_GEOJSON,
  language,
  copy,
  counts = false,
  focus,
  selectedGovernorate = '',
  selectedDirectorate = '',
  selectedSchool = '',
  onGovernorate,
  onDirectorate,
  onSchool,
  onViewport,
}) {
  const host = useRef(null)
  const mapRef = useRef(null)
  const handlers = useRef({
    onGovernorate,
    onDirectorate,
    onSchool,
    onViewport,
    language,
    copy,
  })
  const [phase, setPhase] = useState('loading')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    handlers.current = {
      onGovernorate,
      onDirectorate,
      onSchool,
      onViewport,
      language,
      copy,
    }
  }, [onGovernorate, onDirectorate, onSchool, onViewport, language, copy])

  useEffect(() => {
    let disposed = false
    let map, observer, popup
    try {
      const theme = getComputedStyle(document.documentElement)
      map = new maplibregl.Map({
        container: host.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color':
                  theme.getPropertyValue('--color-background').trim() ||
                  '#0d0914',
              },
            },
          ],
        },
        center: [35, 31.9],
        zoom: 7,
        minZoom: 5.5,
        maxZoom: 18,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        cooperativeGestures: true,
        locale: {
          'CooperativeGesturesHandler.WindowsHelpText':
            language === 'ar'
              ? 'اضغط Ctrl أثناء التمرير لتكبير الخريطة'
              : 'Use Ctrl + scroll to zoom the map',
          'CooperativeGesturesHandler.MacHelpText':
            language === 'ar'
              ? 'اضغط ⌘ أثناء التمرير لتكبير الخريطة'
              : 'Use ⌘ + scroll to zoom the map',
          'CooperativeGesturesHandler.MobileHelpText':
            language === 'ar'
              ? 'استخدم إصبعين لتحريك الخريطة'
              : 'Use two fingers to move the map',
        },
      })
      mapRef.current = map
      map.getCanvas().setAttribute('aria-label', handlers.current.copy.mapLabel)
      popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: 'education-map-tooltip',
      })
      map.on('error', () => {
        if (!disposed) setPhase('error')
      })
      map.on('load', () => {
        if (disposed) return
        // Context layer below all governorate/data layers. Source geometry is not used for statistics.
        map.addSource('historical-palestine', {
          type: 'geojson',
          data: historicalPalestineUrl,
        })
        map.addLayer({
          id: 'historical-palestine-fill', type: 'fill', source: 'historical-palestine',
          paint: { 'fill-color': '#352343', 'fill-opacity': 0.88 },
        })
        map.addLayer({
          id: 'historical-palestine-glow', type: 'line', source: 'historical-palestine',
          paint: { 'line-color': '#cab1df', 'line-width': 7, 'line-opacity': 0.12, 'line-blur': 3 },
        })
        map.addLayer({
          id: 'historical-palestine-outline', type: 'line', source: 'historical-palestine',
          paint: { 'line-color': '#cab1df', 'line-width': 1.5, 'line-opacity': 0.9 },
        })
        map.addSource('governorates', { type: 'geojson', data: EMPTY_GEOJSON })
        map.addLayer({
          id: 'governorate-fill',
          type: 'fill',
          source: 'governorates',
          paint: { 'fill-color': '#4a2c64', 'fill-opacity': 0.82 },
        })
        map.addLayer({
          id: 'governorate-lines',
          type: 'line',
          source: 'governorates',
          paint: {
            'line-color': '#a780c0',
            'line-width': 1.2,
            'line-opacity': 0.85,
          },
        })
        map.addLayer({
          id: 'selected-governorate',
          type: 'line',
          source: 'governorates',
          filter: ['==', ['get', 'id'], ''],
          paint: { 'line-color': '#78d4cd', 'line-width': 3 },
        })
        map.addSource('directorates', { type: 'geojson', data: EMPTY_GEOJSON })
        map.addLayer({
          id: 'directorate-fill',
          type: 'fill',
          source: 'directorates',
          minzoom: 9,
          paint: { 'fill-color': '#78d4cd', 'fill-opacity': 0.06 },
        })
        map.addLayer({
          id: 'selected-directorate',
          type: 'line',
          source: 'directorates',
          minzoom: 9,
          filter: ['==', ['get', 'id'], ''],
          paint: { 'line-color': '#f1deae', 'line-width': 3 },
        })
        map.addLayer({
          id: 'directorate-lines',
          type: 'line',
          source: 'directorates',
          minzoom: 9,
          paint: {
            'line-color': '#78d4cd',
            'line-width': 1.5,
            'line-dasharray': [3, 2],
          },
        })
        map.addSource('schools', {
          type: 'geojson',
          data: EMPTY_GEOJSON,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 45,
        })
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'schools',
          minzoom: 10,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#78d4cd',
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              14,
              20,
              20,
              100,
              26,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#142c30',
          },
        })
        map.addLayer({
          id: 'schools',
          type: 'circle',
          source: 'schools',
          minzoom: 10,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#f1deae',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#241a30',
          },
        })
        map.on('click', 'governorate-fill', (event) => {
          if (
            map.queryRenderedFeatures(event.point, {
              layers: ['schools', 'clusters', 'directorate-fill'],
            }).length
          )
            return
          handlers.current.onGovernorate?.(event.features[0].properties.id)
        })
        map.on('click', 'directorate-fill', (event) => {
          if (
            map.queryRenderedFeatures(event.point, {
              layers: ['schools', 'clusters'],
            }).length
          )
            return
          handlers.current.onDirectorate?.(event.features[0].properties.id)
        })
        map.on('click', 'schools', (event) =>
          handlers.current.onSchool?.(event.features[0].properties.id),
        )
        map.on('click', 'clusters', async (event) => {
          try {
            const feature = event.features[0]
            const zoom = await map
              .getSource('schools')
              .getClusterExpansionZoom(feature.properties.cluster_id)
            if (!disposed)
              map.easeTo({
                center: feature.geometry.coordinates,
                zoom,
                duration: window.matchMedia('(prefers-reduced-motion: reduce)')
                  .matches
                  ? 0
                  : 450,
              })
          } catch {
            if (!disposed) setPhase('error')
          }
        })
        for (const layer of [
          'governorate-fill',
          'directorate-fill',
          'schools',
          'clusters',
        ]) {
          map.on('mousemove', layer, (event) => {
            map.getCanvas().style.cursor = 'pointer'
            const feature = event.features[0]
            const label = document.createElement('span')
            label.dir = handlers.current.language === 'ar' ? 'rtl' : 'ltr'
            label.textContent =
              layer === 'clusters'
                ? `${feature.properties.point_count} · ${handlers.current.copy.cluster}`
                : localizedName(feature.properties, handlers.current.language)
            popup.setLngLat(event.lngLat).setDOMContent(label).addTo(map)
          })
          map.on('mouseleave', layer, () => {
            map.getCanvas().style.cursor = ''
            popup.remove()
          })
        }
        const bounds = historicalPalestineBounds
        if (bounds) map.fitBounds(bounds, { padding: 42, duration: 0 })
        function notifyViewport() {
          const b = map.getBounds()
          handlers.current.onViewport?.({
            zoom: map.getZoom(),
            bbox: [
              Math.max(-180, b.getWest()),
              Math.max(-90, b.getSouth()),
              Math.min(180, b.getEast()),
              Math.min(90, b.getNorth()),
            ].join(','),
          })
        }
        map.on('moveend', notifyViewport)
        notifyViewport()
        setReady(true)
        setPhase('ready')
      })
      observer = new ResizeObserver(() => map.resize())
      observer.observe(host.current)
    } catch {
      // The directory remains fully usable when WebGL is unavailable.
      Promise.resolve().then(() => {
        if (!disposed) setPhase('error')
      })
    }
    return () => {
      disposed = true
      observer?.disconnect()
      popup?.remove()
      map?.remove()
      mapRef.current = null
    }
    // The map instance lives for this component's lifetime. Subsequent data/language changes use the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready) return
    const map = mapRef.current
    map.getSource('governorates').setData(geography)
    map.getSource('directorates').setData(directorateGeography)
    const max = Math.max(
      1,
      ...geography.features.map(
        (feature) => feature.properties.school_count || 0,
      ),
    )
    map.setPaintProperty(
      'governorate-fill',
      'fill-color',
      counts
        ? [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'school_count'], 0],
            0,
            '#2d213d',
            max / 2,
            '#75509a',
            max,
            '#bc95d8',
          ]
        : '#4a2c64',
    )
  }, [ready, geography, directorateGeography, counts])
  useEffect(() => {
    if (ready) mapRef.current.getSource('schools').setData(points)
  }, [ready, points])
  useEffect(() => {
    if (ready)
      mapRef.current.setFilter('selected-governorate', [
        '==',
        ['get', 'id'],
        selectedGovernorate || '',
      ])
  }, [ready, selectedGovernorate])
  useEffect(() => {
    if (!ready) return
    mapRef.current.setFilter('selected-directorate', [
      '==',
      ['get', 'id'],
      selectedDirectorate || '',
    ])
    mapRef.current.setPaintProperty('schools', 'circle-radius', [
      'case',
      ['==', ['get', 'id'], selectedSchool || ''],
      10,
      6,
    ])
  }, [ready, selectedDirectorate, selectedSchool])
  useEffect(() => {
    if (!ready || !focus) return
    const map = mapRef.current
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : 650
    if (hasCoordinates(focus.school))
      map.easeTo({
        center: [focus.school.longitude, focus.school.latitude],
        zoom: 15,
        duration,
      })
    else {
      const feature =
        directorateGeography.features.find(
          (item) => item.id === focus.directorateId,
        ) || geography.features.find((item) => item.id === focus.governorateId)
      const bounds = feature
        ? geometryBounds(feature.geometry)
        : focus.reset
          ? historicalPalestineBounds
          : null
      if (bounds) map.fitBounds(bounds, { padding: 55, maxZoom: 12, duration })
    }
  }, [ready, focus, geography, directorateGeography])
  useEffect(() => {
    mapRef.current?.getCanvas().setAttribute('aria-label', copy.mapLabel)
  }, [copy])

  return (
    <>
    <div className="education-map__canvas-shell" dir="ltr">
      <div className="education-map__canvas" ref={host} />
      {phase !== 'ready' && (
        <div
          className="education-map__canvas-status"
          role={phase === 'error' ? 'alert' : 'status'}
        >
          {phase === 'error' ? copy.mapFailure : copy.mapLoading}
        </div>
      )}
      {phase === 'ready' && (
        <div className="education-map__zoom">
          <button
            type="button"
            aria-label={copy.zoomIn}
            title={copy.zoomIn}
            onClick={() =>
              mapRef.current.zoomIn({
                duration: window.matchMedia('(prefers-reduced-motion: reduce)')
                  .matches
                  ? 0
                  : 180,
              })
            }
          >
            +
          </button>
          <button
            type="button"
            aria-label={copy.zoomOut}
            title={copy.zoomOut}
            onClick={() =>
              mapRef.current.zoomOut({
                duration: window.matchMedia('(prefers-reduced-motion: reduce)')
                  .matches
                  ? 0
                  : 180,
              })
            }
          >
            −
          </button>
          <button
            type="button"
            aria-label={copy.reset}
            title={copy.reset}
            onClick={() => {
              const b = historicalPalestineBounds
              if (b) mapRef.current.fitBounds(b, { padding: 42, duration: 0 })
            }}
          >
            ⌂
          </button>
        </div>
      )}
      <span
        className="education-map__boundary-tag"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {copy.historicalContext}
      </span>
    </div>
    <div className="education-map__context-note" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <span>{copy.historicalContextNote}</span>
      <a href={historicalPalestineSource} target="_blank" rel="noreferrer">{copy.contextSource} ↗</a>
    </div>
    </>
  )
}
