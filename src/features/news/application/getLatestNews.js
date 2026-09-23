export function getLatestNews(repository, { limit = 6 } = {}) {
  if (!repository || typeof repository.getLatest !== 'function') {
    throw new TypeError('A news repository with getLatest() is required.')
  }

  return repository
    .getLatest()
    .filter((item) => item.title)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit)
}
