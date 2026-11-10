import test from 'node:test'
import assert from 'node:assert/strict'
import { isSupportedNewsImage, mergeNewsImages, MAX_NEWS_IMAGE_BYTES } from '../src/features/news/newsUploadRules.js'
const file = (name, size = 30000, lastModified = 1) => ({ name, size, lastModified })
test('news accepts HEIC/HEIF and usual image formats without trusting MIME', () => {
  for (const ext of ['HEIC','heif','jpg','jpeg','png','webp','gif','bmp','tiff','tif','avif'])
    assert.ok(isSupportedNewsImage(file(`photo.${ext}`)), ext)
  assert.equal(isSupportedNewsImage(file('document.pdf')), false)
  assert.equal(isSupportedNewsImage(file('too-big.heic', MAX_NEWS_IMAGE_BYTES + 1)), false)
  assert.equal(isSupportedNewsImage(file('empty.png', 0)), false)
})
test('adding from picker or drop retains existing images and avoids duplicates', () => {
  const a = file('a.heic'), b = file('b.png')
  assert.deepEqual(mergeNewsImages([a], [a,b,b]), [a,b])
})
