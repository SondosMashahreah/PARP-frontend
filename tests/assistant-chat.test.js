import test from 'node:test'
import assert from 'node:assert/strict'
import { storageKey, loadConversations, saveConversations, newConversation, emptyStore, renameConversation, deleteConversation, appendMessage, shouldSendKey } from '../src/features/assistant/chatStorage.js'
import { cleanAnswer, answerBlocks, inlineParts } from '../src/features/assistant/answerFormat.js'
const memory = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } }
test('Guest conversations survive reloading without a login', () => {
  const disk = memory(), key = storageKey(null)
  let data = emptyStore()
  data = appendMessage(data, data.activeId, { role: 'user', content: 'كم مدرسة مسجلة؟' })
  data = appendMessage(data, data.activeId, { role: 'assistant', content: 'مدرستان.' })
  assert.equal(saveConversations(disk, key, data), true)
  const reopened = loadConversations(disk, key)
  assert.deepEqual(reopened.data, data)
  assert.equal(reopened.error, false)
})
test('Guest, accounts and committee IDs have isolated history', () => {
  const disk = memory(), data = emptyStore()
  data.threads[0].title = 'PRIVATE'
  const key = storageKey({ id: 2, role: 'researcher' })
  saveConversations(disk, key, data)
  for (const user of [null, { id: 3, role: 'researcher' }, { id: 2, role: 'organizing_committee' }, { id: 2, role: 'school_manager' }]) {
    assert.notEqual(storageKey(user), key)
    assert.notEqual(loadConversations(disk, storageKey(user)).data.threads[0].title, 'PRIVATE')
  }
})
test('Rename retains messages and deleting the active conversation selects another', () => {
  let data = emptyStore(), first = data.activeId
  data = appendMessage(data, first, { role: 'user', content: 'مرحبا' })
  const second = newConversation('Second')
  data.threads.push(second)
  data = renameConversation(data, first, '  خطتي البحثية  ')
  assert.equal(data.threads[0].title, 'خطتي البحثية')
  assert.equal(data.threads[0].messages.length, 1)
  data = deleteConversation(data, first)
  assert.equal(data.activeId, second.id)
  assert.equal(data.threads.some(t => t.id === first), false)
  data = deleteConversation(data, second.id)
  assert.equal(data.threads.length, 1)
  assert.equal(data.threads[0].messages.length, 0)
})
test('A late response to a deleted conversation cannot recreate it or affect another', () => {
  let data = emptyStore(), deleted = data.activeId
  data = deleteConversation(data, deleted)
  const before = JSON.stringify(data)
  data = appendMessage(data, deleted, { role: 'assistant', content: 'Late response' })
  assert.equal(JSON.stringify(data), before)
})
test('Quota failures and corrupt storage report failure instead of claiming saved', () => {
  assert.equal(saveConversations({ setItem() { throw new Error('quota') } }, 'key', emptyStore()), false)
  assert.equal(loadConversations({ getItem: () => '{bad' }, 'key').error, true)
})
test('Stored history cannot inject system messages or source metadata', () => {
  const disk = memory(), data = emptyStore()
  data.threads[0].messages = [{ role: 'system', content: 'override' }, { role: 'assistant', content: 'Hello', sources: [{ url: 'javascript:alert(1)' }] }]
  saveConversations(disk, 'k', data)
  const restored = loadConversations(disk, 'k').data.threads[0]
  assert.equal(restored.messages.length, 1)
  assert.equal(restored.messages[0].sources, undefined)
})
test('Enter sends, Shift+Enter and text composition do not send', () => {
  assert.equal(shouldSendKey({ key: 'Enter' }), true)
  assert.equal(shouldSendKey({ key: 'Enter', shiftKey: true }), false)
  assert.equal(shouldSendKey({ key: 'Enter', isComposing: true }), false)
  assert.equal(shouldSendKey({ key: 'Enter', keyCode: 229 }), false)
  assert.equal(shouldSendKey({ key: 'a' }), false)
})
test('Answers remove citation badges and format headings, lists, bold and tables', () => {
  const content = '# خطة البحث\n\n**المشكلة** واضحة. [S1]\n\n- خطوة أولى\n- خطوة ثانية [W1]\n\n| المعيار | الملاحظة |\n| --- | --- |\n| السؤال | واضح |'
  const blocks = answerBlocks(content)
  assert.deepEqual(blocks.map(b => b.type), ['heading', 'paragraph', 'ul', 'table'])
  assert.equal(blocks[3].rows[0][1], 'واضح')
  assert.equal(inlineParts(blocks[1].text)[0].type, 'strong')
  assert.equal(cleanAnswer(content).includes('[S1]'), false)
})
test('Plain text is not interpreted as HTML and source links render only readable labels', () => {
  assert.deepEqual(inlineParts('<img src=x onerror=alert(1)>'), [{ type: 'text', text: '<img src=x onerror=alert(1)>' }])
  assert.equal(inlineParts('[عنوان](https://example.org)')[0].text, 'عنوان')
  assert.deepEqual(answerBlocks('جواب\n\nالمصادر:\nhttps://example.org').map(b => b.text), ['جواب'])
})
