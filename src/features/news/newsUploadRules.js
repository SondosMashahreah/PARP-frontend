export const MAX_NEWS_IMAGE_MB = 15
export const MAX_NEWS_IMAGE_BYTES = MAX_NEWS_IMAGE_MB * 1024 * 1024
export const NEWS_IMAGE_ACCEPT = 'image/*,.heic,.heif,.avif,.tif,.tiff,.bmp'
export const isSupportedNewsImage = file =>
  /\.(png|jpe?g|webp|heic|heif|gif|bmp|tiff?|avif)$/i.test(file?.name || '') &&
  file.size > 0 && file.size <= MAX_NEWS_IMAGE_BYTES
export const newsImageKey = file => `${file.name}:${file.size}:${file.lastModified}`
export function mergeNewsImages(existing, incoming) {
  const known = new Set(existing.map(newsImageKey))
  return [...existing, ...incoming.filter(file => {
    const key = newsImageKey(file)
    if (known.has(key)) return false
    known.add(key)
    return true
  })]
}
