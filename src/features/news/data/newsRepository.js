import { normalizeNewsItem } from '../domain/news.js'

const MOCK_NEWS = [
  {
    id: 'news-1',
    category: 'أخبار المنصة',
    publishedAt: '2026-09-20',
    title: 'إطلاق مساحة جديدة لمشاركة تجارب البحث الإجرائي',
    excerpt: 'نص تجريبي للخبر، وسيتم استبداله لاحقاً بالبيانات القادمة من الـ API.',
    image: 'https://www.alquds.edu/wp-content/uploads/2025/01/Exhibition.jpg',
    imageAlt: 'صورة تجريبية لخبر عن البحث الإجرائي',
    href: null,
  },
  {
    id: 'news-2',
    category: 'فعاليات',
    publishedAt: '2026-09-17',
    title: 'لقاء بحثي حول توثيق الخبرة الميدانية وتحويلها إلى معرفة قابلة للمشاركة',
    excerpt: 'خبر تجريبي يساعدنا حالياً في تثبيت التصميم وتجربة السلايدر قبل ربطه بالمصدر الحقيقي.',
    image: 'https://www.alquds.edu/wp-content/uploads/2025/11/AQU00076.jpg',
    imageAlt: 'صورة تجريبية لفعالية وورشة عمل',
    href: null,
  },
  {
    id: 'news-3',
    category: 'بحوث',
    publishedAt: '2026-09-12',
    title: 'نماذج جديدة لعرض نتائج البحوث الإجرائية داخل المنصة',
    excerpt: 'سيتم لاحقاً استبدال هذه البيانات بنتائج حقيقية قادمة من الـ backend بدون تعديل واجهة العرض.',
    image: 'https://www.alquds.edu/wp-content/uploads/2025/04/super-pi1-1024x683.jpg',
    imageAlt: 'صورة تجريبية لنتائج ودراسة بحثية',
    href: null,
  },
  {
    id: 'news-4',
    category: 'شراكات',
    publishedAt: '2026-09-08',
    title: 'توسيع التعاون مع المؤسسات الداعمة للبحث والتعليم',
    excerpt: 'المحتوى هنا placeholder فقط، بينما بنية الكود جاهزة لاستقبال بيانات حقيقية من repository مختلف.',
    image: 'https://www.moe.edu.ps/uploads/20241201112609_2.jpeg',
    imageAlt: 'صورة تجريبية للشراكات والتعاون',
    href: null,
  },
]

export const newsRepository = {
  getLatest() {
    return MOCK_NEWS.map(normalizeNewsItem)
  },
}
