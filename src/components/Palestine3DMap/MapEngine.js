import maplibregl from 'maplibre-gl'
import { getMapTheme } from './mapTheme.js'

export const DIRECTORATE_SOURCE = 'parp-directorates-src'
export const DIRECTORATE_FILL = 'parp-directorates-fill'
export const DIRECTORATE_EXT = 'parp-directorates-extrusion'
export const DIRECTORATE_LINE = 'parp-directorates-line'
export const DIRECTORATE_LABEL = 'parp-directorates-label'

export const SCHOOLS_SOURCE = 'parp-schools-src'
export const SCHOOLS_CLUSTER = 'parp-schools-clusters'
export const SCHOOLS_CLUSTER_COUNT = 'parp-schools-cluster-count'
export const SCHOOLS_POINT = 'parp-schools-point'
export const SCHOOLS_LABEL = 'parp-schools-label'

export const DEFAULT_VIEW = {
  center: [35.2, 31.9],
  zoom: 8,
  pitch: 55,
  bearing: -18,
}

export function createMap(container, theme) {
  const map = new maplibregl.Map({
    container,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {},
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': theme.background } },
      ],
    },
    center: DEFAULT_VIEW.center,
    zoom: DEFAULT_VIEW.zoom,
    pitch: DEFAULT_VIEW.pitch,
    bearing: DEFAULT_VIEW.bearing,
    antialias: true,
    attributionControl: { compact: true },
  })
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left')
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')
  return map
}

export function applyDirectorateLayers(map, data, theme) {
  const src = map.getSource(DIRECTORATE_SOURCE)
  if (!src) map.addSource(DIRECTORATE_SOURCE, { type: 'geojson', data })
  else src.setData(data)

  if (!map.getLayer(DIRECTORATE_FILL)) {
    map.addLayer({
      id: DIRECTORATE_FILL,
      type: 'fill',
      source: DIRECTORATE_SOURCE,
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false], 0.62,
          ['boolean', ['feature-state', 'selected'], false], 0.72,
          0.42,
        ],
      },
    })
  }
  if (!map.getLayer(DIRECTORATE_EXT)) {
    map.addLayer({
      id: DIRECTORATE_EXT,
      type: 'fill-extrusion',
      source: DIRECTORATE_SOURCE,
      paint: {
        'fill-extrusion-color': ['get', 'color'],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.86,
      },
    })
  }
  if (!map.getLayer(DIRECTORATE_LINE)) {
    map.addLayer({
      id: DIRECTORATE_LINE,
      type: 'line',
      source: DIRECTORATE_SOURCE,
      paint: { 'line-color': theme.accent, 'line-width': 1.2, 'line-opacity': 0.7 },
    })
  }
  if (!map.getLayer(DIRECTORATE_LABEL)) {
    map.addLayer({
      id: DIRECTORATE_LABEL,
      type: 'symbol',
      source: DIRECTORATE_SOURCE,
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Open Sans Semibold'],
        'text-size': 13,
        'text-anchor': 'center',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': theme.textPrimary,
        'text-halo-color': theme.background,
        'text-halo-width': 1.4,
      },
    })
  }
}

export function applySchoolLayers(map, data, theme) {
  const src = map.getSource(SCHOOLS_SOURCE)
  if (!src) {
    map.addSource(SCHOOLS_SOURCE, {
      type: 'geojson',
      data,
      cluster: true,
      clusterRadius: 48,
      clusterMaxZoom: 12,
    })
  } else {
    src.setData(data)
  }

  if (!map.getLayer(SCHOOLS_CLUSTER)) {
    map.addLayer({
      id: SCHOOLS_CLUSTER,
      type: 'circle',
      source: SCHOOLS_SOURCE,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': theme.accent,
        'circle-opacity': 0.85,
        'circle-radius': ['step', ['get', 'point_count'], 14, 10, 18, 40, 24],
        'circle-stroke-color': theme.background,
        'circle-stroke-width': 1.5,
      },
    })
  }
  if (!map.getLayer(SCHOOLS_CLUSTER_COUNT)) {
    map.addLayer({
      id: SCHOOLS_CLUSTER_COUNT,
      type: 'symbol',
      source: SCHOOLS_SOURCE,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Semibold'],
        'text-size': 12,
      },
      paint: { 'text-color': theme.background },
    })
  }
  if (!map.getLayer(SCHOOLS_POINT)) {
    map.addLayer({
      id: SCHOOLS_POINT,
      type: 'circle',
      source: SCHOOLS_SOURCE,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#ffffff',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3, 14, 6],
        'circle-stroke-color': theme.accent,
        'circle-stroke-width': 1.5,
      },
    })
  }
  if (!map.getLayer(SCHOOLS_LABEL)) {
    map.addLayer({
      id: SCHOOLS_LABEL,
      type: 'symbol',
      source: SCHOOLS_SOURCE,
      filter: ['!', ['has', 'point_count']],
      minzoom: 13,
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Open Sans Regular'],
        'text-size': 11,
        'text-offset': [0, 1.2],
        'text-anchor': 'top',
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': theme.textPrimary,
        'text-halo-color': theme.background,
        'text-halo-width': 1.2,
      },
    })
  }
}

export function setSelected(map, prevId, nextId) {
  if (prevId != null) map.setFeatureState({ source: DIRECTORATE_SOURCE, id: prevId }, { selected: false })
  if (nextId != null) map.setFeatureState({ source: DIRECTORATE_SOURCE, id: nextId }, { selected: true })
}

export function setHovered(map, prevId, nextId) {
  if (prevId != null) map.setFeatureState({ source: DIRECTORATE_SOURCE, id: prevId }, { hover: false })
  if (nextId != null) map.setFeatureState({ source: DIRECTORATE_SOURCE, id: nextId }, { hover: true })
}