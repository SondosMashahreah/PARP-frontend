import test from 'node:test'
import assert from 'node:assert/strict'
import { ribbonSelectionForRoute } from '../src/components/RibbonButton/ribbonRoutes.js'
import { RIBBON_CYCLE_MS, ribbonLoopProgress, ribbonOpeningProgress, ribbonGeometry, ribbonNextPhase } from '../src/components/RibbonButton/ribbonMotion.js'

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

test('The circle stays in place while only the continuous ribbon extends and rewinds', () => {
  for (const width of [288, 358, 540, 1180]) {
    const closed = ribbonGeometry(0, width)
    const opened = ribbonGeometry(1, width)
    let previousStart = closed.cx
    for (let step = 0; step <= 100; step++) {
      const geometry = ribbonGeometry(step / 100, width)
      assert.equal(geometry.cx, closed.cx)
      assert.equal(geometry.end, closed.cx)
      assert.ok(geometry.start <= previousStart + 1e-10)
      assert.ok(geometry.start >= opened.start - 1e-10)
      assert.ok(geometry.cx - geometry.outer >= 0)
      assert.ok(geometry.cx + geometry.outer <= width)
      assert.ok(geometry.cy + geometry.outer < geometry.height)
      assert.ok(!/NaN|Infinity/.test(geometry.path))
      previousStart = geometry.start
    }
    assert.equal(closed.start, closed.cx)
    assert.ok(opened.start < closed.start)
    assert.notEqual(closed.path, opened.path)
  }
})

test('Arabic keeps the stationary circle on the right; English mirrors it to the left', () => {
  for (const width of [288, 358, 540, 1180]) {
    const geometry = ribbonGeometry(.5, width)
    const arabicCircleX = geometry.cx
    const englishCircleX = geometry.width - geometry.cx
    assert.ok(arabicCircleX > geometry.width / 2)
    assert.ok(englishCircleX < geometry.width / 2)
    assert.equal(arabicCircleX + englishCircleX, geometry.width)
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

test('Ribbon frame is available for direct URLs, refresh and old workspace shortcuts', () => {
  assert.equal(ribbonSelectionForRoute('/workspace', true), null)
  assert.equal(ribbonSelectionForRoute('/workspace#certificates', true)?.to, '/workspace#certificates')
  assert.equal(ribbonSelectionForRoute('/other#research', true), null)
  const sections = {
    research: 'research',
    new: 'research',
    drafts: 'research',
    decisions: 'research',
    tracking: 'tracking',
    practices: 'practices',
    'new-practice': 'practices',
    training: 'training',
  }
  for (const [hash, owner] of Object.entries(sections)) {
    const arabic = ribbonSelectionForRoute(`/workspace#${hash}`, true)
    const english = ribbonSelectionForRoute(`/workspace#${hash}`, false)
    assert.equal(arabic.to, `/workspace#${owner}`)
    assert.equal(english.to, arabic.to)
    assert.ok(arabic.isArabic)
    assert.equal(english.isArabic, false)
    assert.ok(arabic.label && arabic.caption && arabic.symbol)
    assert.ok(english.label && english.caption && english.symbol)
    assert.ok(arabic.icon === owner)
    if (hash !== owner) assert.ok(arabic.relatedRoutes.includes(`/workspace#${hash}`))
  }
})


test('Poster and ribbon open and close repeatedly in place without navigation', () => {
  const phases = ['ribbon-opening', 'unrolling', 'ready', 'closing', 'ribbon-closing', 'closed', 'ribbon-opening']
  for (let i = 0; i < phases.length - 1; i++) {
    assert.equal(ribbonNextPhase(phases[i]), phases[i + 1])
  }
  assert.equal(ribbonNextPhase('unrecognized'), undefined)
})
