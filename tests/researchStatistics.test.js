import test from 'node:test'
import assert from 'node:assert/strict'
import { RESEARCH_BEIGE, RESEARCH_COLORS, researchBands, researchColor, withResearchCounts, researchBandTotals } from '../src/features/educationMap/domain/researchStatistics.js'

test('Zero and unreported research are always beige, never a colored band', () => {
  assert.deepEqual(researchBands(0), [])
  assert.equal(researchColor(0, researchBands(99)), RESEARCH_BEIGE)
  assert.equal(researchColor(null, researchBands(99)), RESEARCH_BEIGE)
  assert.equal(researchColor(undefined, researchBands(99)), RESEARCH_BEIGE)
  assert.equal(researchColor(-1, researchBands(99)), RESEARCH_BEIGE)
})

test('Nonzero bands are actual integer ranges with distinct light hues', () => {
  for (const max of [1, 2, 3, 5, 8, 25, 100]) {
    const bands = researchBands(max)
    assert.equal(bands[0].min, 1)
    assert.equal(bands.at(-1).max, max)
    assert.equal(new Set(bands.map((band) => band.color)).size, bands.length)
    for (let count = 1; count <= max; count++) {
      assert.equal(bands.filter((band) => count >= band.min && count <= band.max).length, 1)
      assert.ok(RESEARCH_COLORS.includes(researchColor(count, bands)))
    }
  }
})

test('Geography is not mutated and missing statistics are not invented', () => {
  const input = { type: 'FeatureCollection', features: [
    { id: 'g1', properties: { school_count: 7 } },
    { id: 'g2', properties: {} },
  ] }
  const output = withResearchCounts(input, [{ id: 'g1', research_count: 8 }], researchBands(8))
  assert.equal(output.features[0].properties.research_count, 8)
  assert.equal(output.features[1].properties.research_count, null)
  assert.equal(output.features[1].properties.research_color, RESEARCH_BEIGE)
  assert.equal(input.features[0].properties.research_count, undefined)
  assert.equal(output.features[0].properties.school_count, 7)
  const totals = researchBandTotals([{ research_count: 0 }, { research_count: 8 }], researchBands(8))
  assert.equal(totals.reduce((sum, b) => sum + b.research, 0), 8)
})
