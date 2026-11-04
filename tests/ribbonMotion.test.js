import test from 'node:test'
import assert from 'node:assert/strict'
import { RIBBON_CYCLE_MS, ribbonLoopProgress, ribbonOpeningProgress, ribbonGeometry } from '../src/components/RibbonButton/ribbonMotion.js'

test('The ribbon holds, unwraps fully, holds for reading and rewinds without a cycle jump', () => {
  assert.equal(ribbonLoopProgress(0), 0)
  assert.equal(ribbonLoopProgress(900), 0)
  assert.equal(ribbonLoopProgress(3500), 1)
  assert.equal(ribbonLoopProgress(5700), 1)
  assert.equal(ribbonLoopProgress(8500), 0)
  for (let time = 0; time < RIBBON_CYCLE_MS; time += 17) {
    const p = ribbonLoopProgress(time)
    assert.ok(p >= 0 && p <= 1)
    assert.ok(Math.abs(p - ribbonLoopProgress(time + 17)) < .02)
    assert.ok(Math.abs(p - ribbonLoopProgress(time + RIBBON_CYCLE_MS)) < 1e-12)
  }
})

test('Clicking during any part of the loop continues from the current position and always finishes open', () => {
  for (const from of [0, .1, .5, .95, 1]) {
    assert.equal(ribbonOpeningProgress(from, 0), from)
    let previous = from
    for (let elapsed = 0; elapsed <= 1500; elapsed += 10) {
      const next = ribbonOpeningProgress(from, elapsed)
      assert.ok(next >= previous && next <= 1)
      previous = next
    }
    assert.equal(previous, 1)
  }
})

test('The connected strip, rim and label coordinates remain inside narrow and wide layouts', () => {
  for (const width of [288, 358, 540, 1180]) {
    let previousX = 0
    for (let step = 0; step <= 100; step++) {
      const geometry = ribbonGeometry(step / 100, width)
      assert.ok(geometry.cx >= previousX)
      assert.ok(geometry.cx - geometry.outer >= 0)
      assert.ok(geometry.cx + geometry.outer <= width)
      assert.ok(geometry.cy + geometry.outer < geometry.height)
      assert.ok(!/NaN|Infinity/.test(geometry.path))
      previousX = geometry.cx
    }
    assert.equal(ribbonGeometry(0, width).cx, ribbonGeometry(1, width).start)
    assert.equal(ribbonGeometry(1, width).cx, ribbonGeometry(1, width).end)
  }
})

test('The page ribbon extends its tail without scaling or moving the circle', () => {
  for (const width of [288, 358, 540, 1180]) {
    const button = ribbonGeometry(1, width)
    const page = ribbonGeometry(1, width, 1)
    assert.equal(page.cx, button.cx)
    assert.equal(page.radius, button.radius)
    assert.ok(page.start < button.start)
    assert.ok(page.start > 0)
    assert.equal(page.end, button.end)
  }
})
