import { newsRepository } from "../../../features/news/data/newsRepository.js";
import { newsRepositoryEn } from "../../../features/news/data/newsRepository.en.js";
import { getLatestNews } from "../../../features/news/application/getLatestNews.js";
import { AdminPanel } from "../components/AdminUi.jsx";
export default function AdminNews({ ar }) {
  const items = getLatestNews(ar ? newsRepository : newsRepositoryEn, {
    limit: 100,
  });
  return (
    <AdminPanel
      title={ar ? "أخبار المنصة" : "Platform news"}
      eyebrow={ar ? "معاينة المحتوى الحالي" : "CURRENT CONTENT PREVIEW"}
    >
      <p className="ac-note">
        {ar
          ? "معاينة الأخبار التجريبية الحالية. أدوات إضافة الأخبار وتحريرها غير متاحة حالياً."
          : "Preview of the current demo news. News creation and editing tools are not available yet."}
      </p>
      <div className="ac-news-grid">
        {items.map((item) => (
          <article key={item.id}>
            <span className="ac-badge">{item.category}</span>
            <h3>{item.title}</h3>
            <p>{item.excerpt}</p>
            <small>{item.publishedAt}</small>
          </article>
        ))}
      </div>
    </AdminPanel>
  );
}
