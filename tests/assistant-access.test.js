import test from 'node:test'
import assert from 'node:assert/strict'
import { ROLE_VALUES, canAccessPath } from '../src/features/auth/roles.js'
test('All existing roles can reach the assistant without gaining access to other roles pages', () => {
  for (const role of ROLE_VALUES) assert.equal(canAccessPath(role, '/assistant'), true, role)
  assert.equal(canAccessPath('researcher', '/dashboard'), false)
  assert.equal(canAccessPath('school_manager', '/map'), false)
  assert.equal(canAccessPath('reviewer', '/dashboard'), false)
  assert.equal(canAccessPath('supervisor', '/assistant'), false)
})
