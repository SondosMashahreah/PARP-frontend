import { normalizeNewsItem } from '../domain/news.js'

const MOCK_NEWS_EN = [
  {
    id: 'news-1',
    category: 'Platform News',
    publishedAt: '2026-09-20',
    title: 'A new space launches for sharing action-research experiences',
    excerpt: 'Sample news content that can later be replaced with data coming from the API.',
    image: 'https://www.alquds.edu/wp-content/uploads/2025/01/Exhibition.jpg',
    imageAlt: 'Sample image for a story about action research',
    href: null,
  },
  {
    id: 'news-2',
    category: 'Events',
    publishedAt: '2026-09-17',
    title: 'Research session on documenting field experience and turning it into shareable knowledge',
    excerpt: 'Sample content used to validate the layout and slider behavior before connecting the final data source.',
    image: 'https://www.alquds.edu/wp-content/uploads/2025/11/AQU00076.jpg',
    imageAlt: 'Sample image for an event and workshop',
    href: null,
  },
  {
    id: 'news-3',
    category: 'Research',
    publishedAt: '2026-09-12',
    title: 'New ways to present action-research findings inside the platform',
    excerpt: 'These sample records can later be replaced by real backend data without changing the presentation layer.',
    image: 'https://www.alquds.edu/wp-content/uploads/2025/04/super-pi1-1024x683.jpg',
    imageAlt: 'Sample image for research findings and studies',
    href: null,
  },
  {
    id: 'news-4',
    category: 'Partnerships',
    publishedAt: '2026-09-08',
    title: 'Expanding cooperation with institutions that support research and education',
    excerpt: 'This content is a placeholder while the repository structure remains ready for a real data source.',
    image: 'https://www.moe.edu.ps/uploads/20241201112609_2.jpeg',
    imageAlt: 'Sample image for partnerships and cooperation',
    href: null,
  },
]

export const newsRepositoryEn = {
  getLatest() {
    return MOCK_NEWS_EN.map(normalizeNewsItem)
  },
}
