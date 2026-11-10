import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { content } from '../src/pages/About/AboutPage.content.js'

const app = readFileSync('src/App.jsx', 'utf8')
const header = readFileSync('src/components/Header/Header.jsx', 'utf8')
const about = readFileSync('src/pages/About/AboutPage.jsx', 'utf8')
const styles = readFileSync('src/pages/About/AboutPage.css', 'utf8')

test('About PARP is a genuine public route available to guests', () => {
  const publicPaths = app.match(/const PUBLIC_PATHS = new Set\(\[([\s\S]*?)\]\)/)?.[1] || ''
  assert.match(publicPaths, /["']\/about["']/)
  assert.match(header, /\["\/about", "عن المنصة", "عن المنصة"\]/)
  assert.match(header, /\["\/about", "About PARP", "About"\]/)
  assert.match(header, /\["\/about", "عن المنصة", "عن المنصة"\]/)
  assert.ok(!header.includes('["platform-values", "عن المنصة"'))
})

test('The four sections use both existing language variants without changing their content', () => {
  for (const language of ['ar', 'en']) {
    const sections = content[language].sections
    assert.equal(sections.length, 4)
    assert.ok(sections[0].body && sections[1].body)
    assert.equal(sections[2].items.length, 6)
    assert.equal(sections[3].items.length, 5)
  }
  assert.match(about, /\[vision, mission, values, goals\] = page\.sections/)
  assert.match(about, /aria-expanded=\{isOpen\}/)
  assert.match(about, /aria-pressed=\{selectedValue === index\}/)
  assert.match(about, /data-about-reveal/)
  assert.match(styles, /prefers-reduced-motion: reduce/)
})
