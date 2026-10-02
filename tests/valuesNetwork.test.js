import test from 'node:test'
import assert from 'node:assert/strict'
import { spring, confine, NETWORK_POSITIONS, MOBILE_POSITIONS, NETWORK_EDGES } from '../src/features/values/domain/network.js'
import { platformPages } from '../src/pages/Platform/platformPages.js'
import { platformPagesEn } from '../src/pages/Platform/platformPages.en.js'

test('Spring returns a dragged node without divergence at different frame rates', () => {
  for (const fps of [30, 60, 120]) {
    let x = 450, velocity = 0
    for (let frame = 0; frame < fps * 5; frame++) {
      ;[x, velocity] = spring(x, velocity, 120, 1 / fps)
      assert.ok(Number.isFinite(x) && Math.abs(x) < 1000)
    }
    assert.ok(Math.abs(x - 120) < 0.01)
  }
})
test('Dragged labels remain within the stage, including a narrow viewport', () => {
  assert.equal(confine(-100, 320, 140), 80)
  assert.equal(confine(1000, 320, 140), 240)
  assert.equal(confine(0, 20, 100), 10)
})
test('Both translations have six values and every network edge has a valid endpoint', () => {
  assert.equal(platformPages['/about'].sections.find(s => s.title === 'قيم المنصة').items.length, 6)
  assert.equal(platformPagesEn['/about'].sections.find(s => s.title === 'Platform values').items.length, 6)
  for (const positions of [NETWORK_POSITIONS, MOBILE_POSITIONS]) {
    assert.equal(positions.length, 6)
    positions.flat().forEach(n => assert.ok(n > 0 && n < 1))
  }
  NETWORK_EDGES.flat().forEach(n => assert.ok(n >= 0 && n < 6))
})
