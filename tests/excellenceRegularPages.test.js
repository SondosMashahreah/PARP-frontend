import test from 'node:test'
import assert from 'node:assert/strict'
import { ribbonSelectionForRoute } from '../src/components/RibbonButton/ribbonRoutes.js'

for (const route of ['/about', '/repository', '/excellence', '/support', '/practices']) {
  test(`${route} is a normal page without the ribbon poster`, () => {
    assert.equal(ribbonSelectionForRoute(route, true), null)
    assert.equal(ribbonSelectionForRoute(route, false), null)
  })
}

test('other supported ribbon pages and researcher sections are unchanged', () => {
  assert.equal(ribbonSelectionForRoute('/guide', true)?.to, '/guide')
  assert.equal(ribbonSelectionForRoute('/workspace#research', true)?.to, '/workspace#research')
})
