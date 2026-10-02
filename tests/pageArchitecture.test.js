import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { platformPages } from '../src/pages/Platform/platformPages.js'
import { platformPagesEn } from '../src/pages/Platform/platformPages.en.js'

test('Every catalog route owns a screen and stylesheet; account remains a login alias', () => {
  assert.deepEqual(Object.keys(platformPages), Object.keys(platformPagesEn))
  for (const route of Object.keys(platformPages)) {
    const name = route.slice(1).split(/[/-]/).map(word => word[0].toUpperCase() + word.slice(1)).join('')
    assert.ok(existsSync(`src/pages/${name}/${name}Page.jsx`), route)
    assert.ok(existsSync(`src/pages/${name}/${name}Page.css`), route)
  }
  const registry = readFileSync('src/routing/pageRoutes.jsx', 'utf8')
  for (const route of Object.keys(platformPages).filter(route => !['/assistant', '/map', '/account'].includes(route))) {
    assert.ok(registry.includes(`'${route}':`), route)
  }
})
