import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleSections, workspaceSection, researchSections, decisionStatuses } from '../src/features/researcher/workspaceSections.js'
test('Only researcher receives the six workspace entry points', () => {
  assert.deepEqual(visibleSections('researcher').map(s => s.id), ['research', 'practices', 'tracking', 'training', 'certificates', 'conference'])
  for (const role of ['', 'reviewer', 'supervisor', 'system_admin']) assert.deepEqual(visibleSections(role), [])
})
test('Research navigation includes creation, drafts, decisions and review tracking', () => {
  assert.deepEqual(researchSections.map(s => s.id), ['new', 'drafts', 'decisions', 'tracking'])
  for (const item of researchSections) assert.equal(workspaceSection('#'+item.id), item.id)
  assert.equal(workspaceSection('#unknown'), 'home')
  assert.equal(workspaceSection(''), 'home')
  assert.ok(decisionStatuses.includes('rejected'))
  assert.ok(decisionStatuses.includes('approved'))
})
