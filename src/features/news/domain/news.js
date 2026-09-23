export function normalizeNewsItem(item) {
  return {
    id: String(item.id),
    category: item.category?.trim() || 'أخبار المنصة',
    publishedAt: item.publishedAt || '',
    title: item.title?.trim() || '',
    excerpt: item.excerpt?.trim() || '',
    image: item.image || '',
    imageAlt: item.imageAlt?.trim() || '',
    href: item.href || null,
  }
}
