/**
 * GeoJSON helpers — pure functions, no DOM, no MapLibre.
 * Kept in the component folder so the map stays self-contained.
 */

export function normalize(values) {
  if (!values.length) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  return values.map((v) => (v - min) / span)
}

export function buildDirectorateFeatures(geo, directorates, valueOf, colorOf, language) {
  if (!geo || !Array.isArray(geo.features)) {
    return { type: 'FeatureCollection', features: [] }
  }
  const byId = new Map(directorates.map((d) => [d.id, d]))
  const values = directorates.map(valueOf)
  const norms = normalize(values)
  const normById = new Map(directorates.map((d, i) => [d.id, norms[i]]))

  return {
    type: 'FeatureCollection',
    features: geo.features.map((f) => {
      const id = f.properties?.id
      const d = id ? byId.get(id) : undefined
      const t = id ? (normById.get(id) ?? 0) : 0
      const label = d
        ? (language === 'ar' ? d.nameAr : d.nameEn)
        : (f.properties?.nameEn || '')
      return {
        ...f,
        properties: {
          ...f.properties,
          value: d ? valueOf(d) : 0,
          norm: t,
          color: colorOf(t),
          height: 20000 + t * 180000,
          label,
        },
      }
    }),
  }
}

export function buildSchoolFeatures(schools, language) {
  return {
    type: 'FeatureCollection',
    features: schools
      .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .map((s) => ({
        type: 'Feature',
        id: s.id,
        geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
        properties: {
          ...s,
          label: language === 'ar' ? s.nameAr : s.nameEn,
        },
      })),
  }
}