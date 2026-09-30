export const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] }

export function geometryBounds(geometry) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity]
  function visit(coordinates) {
    if (!Array.isArray(coordinates)) return
    if (
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      const [x, y] = coordinates
      if (!Number.isFinite(x) || !Number.isFinite(y)) return
      bounds[0] = Math.min(bounds[0], x)
      bounds[1] = Math.min(bounds[1], y)
      bounds[2] = Math.max(bounds[2], x)
      bounds[3] = Math.max(bounds[3], y)
    } else coordinates.forEach(visit)
  }
  visit(geometry?.coordinates)
  return bounds.every(Number.isFinite)
    ? [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ]
    : null
}

export function collectionBounds(geo) {
  return geometryBounds({
    coordinates: (geo?.features || []).map(
      (feature) => feature.geometry?.coordinates,
    ),
  })
}

export function hasCoordinates(item) {
  return (
    typeof item?.latitude === 'number' &&
    Number.isFinite(item.latitude) &&
    Math.abs(item.latitude) <= 90 &&
    typeof item.longitude === 'number' &&
    Number.isFinite(item.longitude) &&
    Math.abs(item.longitude) <= 180
  )
}

export function localizedName(item, language) {
  return (
    item?.[`name_${language}`] ||
    item?.name_ar ||
    item?.name_en ||
    item?.id ||
    ''
  )
}

export function withSchoolCounts(geo, governorates = []) {
  const counts = new Map(
    governorates.map((item) => [item.id, item.school_count]),
  )
  return {
    ...geo,
    features: geo.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        school_count: counts.get(feature.id) ?? null,
      },
    })),
  }
}
