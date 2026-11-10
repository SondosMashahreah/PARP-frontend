import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = (path) => readFileSync(path, 'utf8')

test('both registration and admin create accounts have two names and selected institution IDs', () => {
  const login = read('src/pages/Login/LoginPage.jsx')
  const admin = read('src/pages/Dashboard/components/PlatformAdmin.jsx')
  const edit = read('src/pages/Dashboard/sections/AdminUsers.jsx')
  const selector = read('src/components/institutions/InstitutionFields.jsx')
  assert.match(login, /full_name_en/)
  assert.match(admin, /full_name_en/)
  assert.match(edit, /InstitutionFields/)
  assert.match(selector, /name="school_id"/)
  assert.match(selector, /name="directorate_id"/)
  assert.match(selector, /api\/education\/public\/schools/)
  assert.doesNotMatch(edit, /\["school_id", "معرّف المدرسة"/)
})
