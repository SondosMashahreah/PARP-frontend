import test from 'node:test'
import assert from 'node:assert/strict'
import { validateContact, contactMailto, submitContact } from '../src/features/contact/application/contactMessage.js'

const message = { name: '  سُندس  ', email: 'test@example.com', subject: 'سؤال & تعاون', message: 'أرغب بالتواصل مع فريق المنصة.' }
test('Validation trims fields and rejects blank names, invalid email and oversized messages', () => {
  const result = validateContact(message)
  assert.equal(result.data.name, 'سُندس')
  assert.deepEqual(result.errors, {})
  const invalid = validateContact({ name: '   ', email: 'invalid', subject: '', message: 'a'.repeat(2001) })
  assert.deepEqual(Object.keys(invalid.errors), ['name', 'email', 'subject', 'message'])
})
test('Draft encodes Arabic, ampersands and line breaks without adding recipients', () => {
  const data = validateContact(message).data
  const url = new URL(contactMailto(data))
  assert.equal(url.pathname, 'info.meetmath@alquds.edu')
  assert.equal(url.searchParams.get('subject'), data.subject)
  assert.ok(url.searchParams.get('body').includes(data.message))
  assert.ok(url.searchParams.get('body').includes('\n'))
  assert.equal(url.searchParams.size, 2)
})
test('Contact request uses the configured endpoint and only succeeds for an accepted response', async () => {
  const data = validateContact(message).data
  let captured
  await submitContact(data, '/contact', async (url, options) => { captured = { url, ...options }; return { ok: true } })
  assert.equal(captured.url, '/contact')
  assert.equal(captured.method, 'POST')
  assert.deepEqual(JSON.parse(captured.body), data)
  await assert.rejects(submitContact(data, '/contact', async () => ({ ok: false })), /CONTACT_REQUEST_FAILED/)
  await assert.rejects(submitContact(data, '/contact', async () => { throw new Error('offline') }), /offline/)
})
