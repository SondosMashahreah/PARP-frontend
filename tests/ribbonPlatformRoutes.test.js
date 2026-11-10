import test from 'node:test'
import assert from 'node:assert/strict'
import { ribbonSelectionForRoute } from '../src/components/RibbonButton/ribbonRoutes.js'

const pages = ['/conference', '/guide', '/template', '/training', '/library',
  '/observatory', '/institutions', '/problems']

test('Public platform destinations use the existing reusable ribbon poster', () => {
  for (const to of pages) {
    const ar = ribbonSelectionForRoute(to, true)
    const en = ribbonSelectionForRoute(to, false)
    assert.equal(ar.to, to)
    assert.equal(en.to, to)
    assert.equal(ar.isArabic, true)
    assert.equal(en.isArabic, false)
    assert.ok(ar.label && en.label && ar.caption && en.caption)
    assert.ok(['research', 'practices', 'tracking', 'training'].includes(ar.icon))
  }
})

test('Workspace researcher cards include all six links and child routes', () => {
  for (const id of ['research', 'practices', 'tracking', 'training', 'certificates', 'conference']) {
    const result = ribbonSelectionForRoute(`/workspace#${id}`, true)
    assert.equal(result.to, `/workspace#${id}`)
    assert.ok(result.caption)
  }
  assert.equal(ribbonSelectionForRoute('/workspace#drafts', true).to, '/workspace#research')
  assert.equal(ribbonSelectionForRoute('/workspace#new-practice', true).to, '/workspace#practices')
})

test('Action forms, accounts and complex pages are not wrapped in ribbons', () => {
  for (const path of ['/', '/workspace', '/login', '/account', '/profile', '/map', '/assistant', '/dashboard', '/search?q=a',
    '/about', '/repository', '/excellence', '/news', '/support', '/practices']) {
    assert.equal(ribbonSelectionForRoute(path, true), null)
  }
  assert.equal(ribbonSelectionForRoute('/news#latest', true), null)
})
