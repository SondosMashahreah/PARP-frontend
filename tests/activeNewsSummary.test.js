import test from 'node:test'
import assert from 'node:assert/strict'
import { activeNewsSummary } from '../src/features/news/presentation/LatestNewsSlider/activeNewsSummary.js'

test('returns the currently selected story excerpt', () => {
  assert.equal(activeNewsSummary({ title: 'خبر', excerpt: 'نبذة عن الخبر', body: 'التفاصيل' }), 'نبذة عن الخبر')
  assert.equal(activeNewsSummary({ title: 'News', excerpt: 'English excerpt' }), 'English excerpt')
})
test('falls back to body/title and strips HTML', () => {
  assert.equal(activeNewsSummary({ title: 'خبر', body: '<p>تفاصيل <b>الخبر</b></p>' }), 'تفاصيل الخبر')
  assert.equal(activeNewsSummary({ title: 'No summary' }), 'No summary')
  assert.equal(activeNewsSummary(null), '')
})
test('truncates long excerpts', () => {
  const text = activeNewsSummary({ excerpt: 'A long news story about platform research and its impact' }, 27)
  assert.ok(text.endsWith('…'))
  assert.ok(text.length <= 28)
})
