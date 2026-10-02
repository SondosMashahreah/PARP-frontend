import assert from 'node:assert/strict'
import test from 'node:test'
import { filterPractices, practices } from '../src/features/practices/practices.js'
test('Practices can be found in either language and combined with a category', () => {
  assert.equal(filterPractices(practices, 'EXIT', 'all')[0].id, 'exit-ticket')
  assert.equal(filterPractices(practices, 'بِطاقة', 'assessment')[0].id, 'exit-ticket')
  assert.equal(filterPractices(practices, 'exit', 'learning').length, 0)
  assert.equal(filterPractices(practices, 'unknown', 'all').length, 0)
  assert.equal(filterPractices(practices, ' ', 'all').length, 3)
})
