// The localized excerpt comes from displayNews; fall back to the article body.
export function activeNewsSummary(item, limit = 240) {
  const source = String(item?.excerpt || item?.body || item?.title || '')
  const plain = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (plain.length <= limit) return plain
  const prefix = plain.slice(0, limit)
  const lastWord = prefix.replace(/\s+\S*$/, '').trim()
  return `${lastWord || prefix.trim()}…`
}
