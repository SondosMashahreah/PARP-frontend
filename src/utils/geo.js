/** Normalize an array of numbers to 0..1. */
export function normalize(values) {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => (v - min) / span);
}

/**
 * Merge directorate business records onto their geographic features.
 * Adds: value, norm, color, height, label (language-aware).
 */
export function buildDirectorateFeatures(geo, directorates, valueOf, colorOf, language) {
  const byId = new Map(directorates.map((d) => [d.id, d]));
  const values = directorates.map(valueOf);
  const norm = normalize(values);
  const normById = new Map(directorates.map((d, i) => [d.id, norm[i]]));

  return {
    type: 'FeatureCollection',
    features: geo.features.map((f) => {
      const id = f.properties?.id;
      const d = id ? byId.get(id) : undefined;
      const tt = id ? normById.get(id) ?? 0 : 0;
      const label = d ? (language === 'ar' ? d.nameAr : d.nameEn) : (f.properties?.nameEn || '');
      return {
        ...f,
        properties: {
          ...f.properties,
          value: d ? valueOf(d) : 0,
          norm: tt,
          color: colorOf(tt),
          height: 20000 + tt * 180000,
          label,
        },
      };
    }),
  };
}

/** Schools → GeoJSON FeatureCollection. */
export function buildSchoolFeatures(schools, language) {
  return {
    type: 'FeatureCollection',
    features: schools.map((s) => ({
      type: 'Feature',
      id: s.id,
      geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
      properties: {
        ...s,
        label: language === 'ar' ? s.nameAr : s.nameEn,
      },
    })),
  };
}