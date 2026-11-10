// One neutral background for every governorate with zero registered research.
// Nonzero bands use distinct, light but clearly separated hues, not an invented metric.
export const RESEARCH_BEIGE = '#F8F3E9'
export const RESEARCH_COLORS = ['#A6DCE9', '#A6DCC0', '#F4CA80', '#F5A5BE', '#A698E7']

export function researchBands(maxCount) {
  const max = Number.isSafeInteger(maxCount) && maxCount > 0 ? maxCount : 0
  const number = Math.min(RESEARCH_COLORS.length, max)
  if (!number) return []
  return Array.from({ length: number }, (_, index) => ({
    min: Math.floor((index * max) / number) + 1,
    max: Math.floor(((index + 1) * max) / number),
    color: RESEARCH_COLORS[RESEARCH_COLORS.length - number + index],
  }))
}

export function researchColor(count, bands) {
  if (!Number.isSafeInteger(count) || count <= 0) return RESEARCH_BEIGE
  return bands.find((band) => count >= band.min && count <= band.max)?.color || RESEARCH_BEIGE
}

export function withResearchCounts(geography, rows, bands) {
  const indexed = new Map((rows || []).map((row) => [row.id, row.research_count]))
  return {
    ...geography,
    features: geography.features.map((feature) => {
      const count = indexed.has(feature.id) ? indexed.get(feature.id) : null
      return {
        ...feature,
        properties: {
          ...feature.properties,
          research_count: Number.isSafeInteger(count) && count >= 0 ? count : null,
          research_color: researchColor(count, bands),
        },
      }
    }),
  }
}

// Counts are real submissions; the coloring brackets are derived from the actual maximum.
export function researchBandTotals(rows, bands) {
  return bands.map((band) => ({
    ...band,
    research: (rows || []).filter((row) => row.research_count >= band.min && row.research_count <= band.max)
      .reduce((sum, row) => sum + row.research_count, 0),
    governorates: (rows || []).filter((row) => row.research_count >= band.min && row.research_count <= band.max).length,
  }))
}
