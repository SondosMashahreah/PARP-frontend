export function getLatestNews(repository, { limit } = {}) {
  if (!repository || typeof repository.getLatest !== 'function') {
    throw new TypeError('A news repository with getLatest() is required.')
  }

  const items = repository
    .getLatest()
    .filter((item) => item.title)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  return Number.isInteger(limit) && limit > 0
    ? items.slice(0, limit)
    : items
}
