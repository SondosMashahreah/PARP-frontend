import test from 'node:test'
import assert from 'node:assert/strict'
import { requiredMissing, prepareContent } from '../src/features/researcher/actionResearchStandard.js'

test('linked researchers require selected platform accounts and approved affiliations', () => {
  const base = prepareContent({
    researchers_mode: 'linked', title: 'Action research', research_field: 'Math',
    problem: 'Learning gap', abstract: 'Research summary',
    research_question: 'What changes?', research_objectives: ['Improve learning'],
    sample_size: 35, intervention: 'Teaching intervention',
    action_plan_steps: [{ activity: 'Classroom activities' }],
    research_instruments: [{ name: 'Teacher journal' }],
    key_findings: 'Changed understanding', researcher_reflection: 'Teacher reflections',
    conclusions: 'Important outcome', recommendations: 'Repeat intervention',
    researchers: [{ full_name: 'Researcher', school: 'School', directorate: 'Directorate' }],
  })
  assert.ok(requiredMissing(base).some((field) => field.key === 'researchers'))
  base.researchers[0].user_id = 7
  assert.equal(requiredMissing(base).length, 0)
  base.researchers.push({ user_id: 7, full_name: 'Repeat', school: 'School', directorate: 'Directorate' })
  assert.ok(requiredMissing(base).some((field) => field.key === 'researchers'))
})
