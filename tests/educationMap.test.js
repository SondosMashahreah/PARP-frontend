import test from 'node:test'
import assert from 'node:assert/strict'
import {
  geometryBounds,
  collectionBounds,
  hasCoordinates,
  localizedName,
  withSchoolCounts,
} from '../src/features/educationMap/domain/geography.js'

test('nested Polygon/MultiPolygon geometry yields bounds without invented points', () => {
  const polygon = {
    type: 'Polygon',
    coordinates: [
      [
        [34, 31],
        [35, 33],
        [36, 32],
        [34, 31],
      ],
    ],
  }
  assert.deepEqual(geometryBounds(polygon), [
    [34, 31],
    [36, 33],
  ])
  assert.deepEqual(
    geometryBounds({
      type: 'MultiPolygon',
      coordinates: [polygon.coordinates],
    }),
    [
      [34, 31],
      [36, 33],
    ],
  )
  assert.equal(collectionBounds({ features: [] }), null)
  assert.equal(geometryBounds(null), null)
})
test('missing coordinates cannot become markers at zero', () => {
  for (const item of [
    null,
    {},
    { latitude: null, longitude: null },
    { latitude: '31', longitude: '35' },
    { latitude: NaN, longitude: 35 },
    { latitude: 91, longitude: 35 },
  ])
    assert.equal(hasCoordinates(item), false)
  assert.equal(hasCoordinates({ latitude: 31.8, longitude: 35.2 }), true)
})
test('school counts use only API counts and retain unknown instead of inventing zero', () => {
  const geo = {
    type: 'FeatureCollection',
    features: [
      { id: 'a', properties: {} },
      { id: 'b', properties: {} },
    ],
  }
  const result = withSchoolCounts(geo, [{ id: 'a', school_count: 42 }])
  assert.equal(result.features[0].properties.school_count, 42)
  assert.equal(result.features[1].properties.school_count, null)
  assert.equal(geo.features[0].properties.school_count, undefined)
})
test('Arabic/English names and missing translations have deterministic fallback', () => {
  assert.equal(
    localizedName({ name_ar: 'القدس', name_en: 'Jerusalem' }, 'en'),
    'Jerusalem',
  )
  assert.equal(localizedName({ name_ar: 'القدس' }, 'en'), 'القدس')
  assert.equal(localizedName(null, 'ar'), '')
})
