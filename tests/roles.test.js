import test from 'node:test'
import assert from 'node:assert/strict'
import { ROLE_OPTIONS, canAccessPath } from '../src/features/auth/roles.js'

test('PARP exposes nine authenticated roles plus the existing unauthenticated guest mode', () => {
  assert.equal(ROLE_OPTIONS.length, 9)
  assert.equal(new Set(ROLE_OPTIONS.map((item) => item.value)).size, 9)
})

test('role route guard exposes only role-relevant workspace navigation', () => {
  assert.equal(canAccessPath('researcher', '/workspace'), true)
  assert.equal(canAccessPath('researcher', '/dashboard'), false)
  assert.equal(canAccessPath('researcher', '/community'), false)
  assert.equal(canAccessPath('decision_maker', '/dashboard'), true)
  assert.equal(canAccessPath('reviewer', '/conference'), false)
  assert.equal(canAccessPath('system_admin', '/workspace'), true)
  assert.equal(canAccessPath('system_admin', '/repository'), true)
  assert.equal(canAccessPath('system_admin', '/excellence'), true)
  assert.equal(canAccessPath('system_admin', '/map'), true)
  assert.equal(canAccessPath('system_admin', '/conference'), false)
})
