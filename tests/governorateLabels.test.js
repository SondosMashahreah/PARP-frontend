import test from 'node:test'
import assert from 'node:assert/strict'
import { governorateLabelPoint } from '../src/features/educationMap/domain/governorateLabels.js'

test('governorate marker is derived from the polygon, not a guessed location', () => {
  const feature = { geometry: { type: 'Polygon', coordinates: [
    [[34, 31], [36, 31], [36, 33], [34, 33], [34, 31]],
  ] } }
  assert.deepEqual(governorateLabelPoint(feature), [35, 32])
})

test('multi-polygons put labels in the larger geographic area', () => {
  const feature = { geometry: { type: 'MultiPolygon', coordinates: [
    [[[0, 0], [0.1, 0], [0.1, 0.1], [0, 0.1], [0, 0]]],
    [[[10, 10], [12, 10], [12, 12], [10, 12], [10, 10]]],
  ] } }
  assert.deepEqual(governorateLabelPoint(feature), [11, 11])
})

test('missing or degenerate boundaries do not create fake map labels', () => {
  assert.equal(governorateLabelPoint(null), null)
  assert.equal(governorateLabelPoint({ geometry: { type: 'Point', coordinates: [0, 0] } }), null)
  assert.equal(governorateLabelPoint({ geometry: { type: 'Polygon', coordinates: [[[1, 2], [1, 2], [1, 2]]] } }), null)
})
