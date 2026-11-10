import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const src = (path) => readFileSync(path, 'utf8')

test('Homepage contact is an accessible collapsible one-line heading', () => {
  const home = src('src/pages/Home/Home.jsx')
  assert.match(home, /<details className="home-contact"/)
  assert.match(home, /<summary className="home-contact__toggle"/)
  assert.match(home, /hash === '#contact'/)
})
test('The editor screen does not repeat research hub ribbon buttons', () => {
  const researcher = src('src/pages/Workspace/ResearcherWorkspace.jsx')
  assert.match(researcher, /\{section === 'research' && \(/)
  assert.match(researcher, /\{section === 'new' && \(/)
  assert.doesNotMatch(researcher, /\{researching && \(/)
})
test('Active header location persists and directorate opens institutions', () => {
  const header = src('src/components/Header/Header.jsx')
  const css = src('src/components/Header/Header.css')
  const login = src('src/pages/Login/LoginPage.jsx')
  const sidebar = src('src/components/Header/Sidebar.jsx')
  assert.match(header, /aria-current=\{isCurrentLink\(id\)/)
  assert.match(css, /aria-current="page"/)
  assert.match(login, /loggedUser\?\.role === 'directorate_manager' \? '\/institutions'/)
  assert.match(sidebar, /item\.to === '\/training' && user\?\.role === 'directorate_manager'/)
})
test('Directorate view has scoped search and recomputes metrics', () => {
  const workspace = src('src/pages/Workspace/WorkspacePage.jsx')
  const view = src('src/pages/Workspace/InstitutionWorkspace.jsx')
  assert.match(workspace, /if \(data\.role === 'directorate_manager'\) return/)
  assert.match(view, /usePlatformData\('\/statistics'\)/)
  assert.match(view, /data\.research \|\| \[\]/)
  assert.match(view, /const research = .*\.filter\(matchRecord\)/)
  assert.match(view, /schools\.length/)
})
