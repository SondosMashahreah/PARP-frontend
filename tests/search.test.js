import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeSearch, searchPlatform } from '../src/features/search/application/searchPlatform.js'
import { searchIndex } from '../src/features/search/data/searchIndex.js'

test('Arabic variants, diacritics and case normalize consistently', () => {
  assert.equal(normalizeSearch(' إِجْرَائِيّ ـ ٠٨ '), normalizeSearch('اجرائي 08'))
  assert.equal(normalizeSearch('GUIDE'), 'guide')
})
test('Arabic and English queries both find the guide in either interface', () => {
  for (const language of ['ar', 'en']) for (const query of ['الدَّلِيل', 'guide']) {
    assert.ok(searchPlatform(query, { language }).some((item) => item.to === '/guide'))
  }
})
test('Opposite-language research query opens the corresponding research record', () => {
  const ar = searchPlatform('formative assessment', { language: 'ar' }).find((item) => item.id === 'r3')
  const en = searchPlatform('التقويم التكويني', { language: 'en' }).find((item) => item.id === 'r3')
  assert.ok(ar && en)
  assert.equal(ar.to, '/repository#r3')
  assert.notEqual(ar.title, en.title)
})
test('News and all eight journey results have distinct destinations', () => {
  const steps = searchIndex.filter((item) => item.type === 'journey')
  assert.equal(new Set(steps.map((item) => item.to)).size, 8)
  assert.equal(steps[7].to, '/#journey-step-8')
  assert.ok(searchPlatform('شراكات').some((item) => item.to === '/news#news-4'))
  assert.equal(new Set(searchIndex.map((item) => item.id)).size, searchIndex.length)
})
test('Empty, punctuation-only and unmatched searches return no invented results', () => {
  for (const query of ['', '  ', '!!!', 'unfindablexyz199234']) assert.deepEqual(searchPlatform(query), [])
  assert.ok(searchPlatform('research', { limit: 3 }).length <= 3)
})

test('Repository search shares bilingual matching and preserves field filters', async () => {
  const { filterResearch } = await import('../src/features/platform/application/filterResearch.js')
  assert.equal(filterResearch('formative assessment', { language: 'ar' })[0].id, 'r3')
  assert.equal(filterResearch('التقويم التكويني', { language: 'en' })[0].id, 'r3')
  assert.equal(filterResearch('formative assessment', { language: 'ar', field: 'الرياضيات' }).length, 0)
})
