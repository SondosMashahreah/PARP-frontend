import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareContent, requiredMissing, STANDARD_VERSION } from '../src/features/researcher/actionResearchStandard.js'

test('every ARDS submission requires researchers with individual affiliations', () => {
  const content = prepareContent({
    title: 'Action research', research_field: 'Mathematics', problem: 'Learning issue',
    abstract: 'Abstract', research_question: 'What changed?',
    researchers: [{ full_name: 'Researcher A', school: 'School A', directorate: 'Directorate A' },
      { full_name: 'Researcher B', school: 'School B', directorate: 'Directorate B' }],
    research_objectives: ['Improve learning'], sample_size: 35,
    intervention: 'Use drama', action_plan_steps: [{ activity: 'Class activity' }],
    research_instruments: [{ name: 'Observation' }], key_findings: 'Improvement',
    researcher_reflection: 'Teacher reflections', conclusions: 'Positive impact',
    recommendations: 'Continue',
  })
  assert.equal(STANDARD_VERSION, 'ARDS-1.0')
  assert.deepEqual(requiredMissing(content), [])
  assert.equal(content.researchers[1].directorate, 'Directorate B')
  content.researchers[1].directorate = ''
  assert.ok(requiredMissing(content).some((field) => field.key === 'researchers'))
})

test('new draft can be incomplete', () => {
  const draft = prepareContent()
  assert.ok(requiredMissing(draft).length > 0)
})
