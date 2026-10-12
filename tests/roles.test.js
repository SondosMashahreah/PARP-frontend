import test from 'node:test'
import assert from 'node:assert/strict'
import { ROLE_OPTIONS, canAccessPath } from '../src/features/auth/roles.js'

test('PARP exposes eight authenticated roles plus the existing unauthenticated guest mode', () => {
  assert.equal(ROLE_OPTIONS.length, 8)
  assert.equal(new Set(ROLE_OPTIONS.map((item) => item.value)).size, 8)
})

test('role route guard exposes only role-relevant workspace navigation', () => {
  assert.equal(canAccessPath('researcher', '/workspace'), true)
  assert.equal(canAccessPath('researcher', '/dashboard'), false)
  assert.equal(canAccessPath('researcher', '/community'), false)
  assert.equal(canAccessPath('decision_maker', '/dashboard'), false)
  assert.equal(canAccessPath('reviewer', '/conference'), false)
  assert.equal(canAccessPath('system_admin', '/workspace'), true)
  assert.equal(canAccessPath('system_admin', '/repository'), true)
  assert.equal(canAccessPath('system_admin', '/excellence'), true)
  assert.equal(canAccessPath('system_admin', '/map'), false)
  assert.equal(canAccessPath('system_admin', '/conference'), false)
})

 test('Map is exclusive to decision makers and directorates; practices are shared', () => {
  for (const {value} of ROLE_OPTIONS) {
   assert.equal(canAccessPath(value, '/map'), ['decision_maker','directorate_manager'].includes(value))
   assert.equal(canAccessPath(value, '/practices'), true)
   assert.equal(canAccessPath(value, '/observatory/map'), false)
  }
  assert.equal(canAccessPath('supervisor', '/workspace'), false)
  assert.equal(canAccessPath('researcher', '/problems'), true)
 })
