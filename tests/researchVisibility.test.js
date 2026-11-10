import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('repository has separate abstract and published full-file actions', () => {
  const page = readFileSync('src/pages/Repository/RepositoryPage.jsx', 'utf8')
  assert.match(page, /عرض الملخص/)
  assert.match(page, /عرض البحث كاملًا/)
  assert.match(page, /repository\/\$\{encodeURIComponent\(r.id\)\}\/file/)
  assert.match(page, /aria-expanded=\{expanded.includes\(r.id\)\}/)
})

test('institution and research map distinguish national published stats from directorate scoped records', () => {
  const institution = readFileSync('src/pages/Workspace/InstitutionWorkspace.jsx', 'utf8')
  const map = readFileSync('src/features/educationMap/presentation/ResearchStatsPanel.jsx', 'utf8')
  assert.match(institution, /institution-national-publications/)
  assert.match(map, /national_published/)
})
