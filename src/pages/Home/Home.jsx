import SpaceJourney from '../../components/SpaceJourney/SpaceJourney.jsx'
import SpaceJourneyEn from '../../components/SpaceJourney/SpaceJourney.en.jsx'
import { getLatestNews } from '../../features/news/application/getLatestNews.js'
import { newsRepository } from '../../features/news/data/newsRepository.js'
import { newsRepositoryEn } from '../../features/news/data/newsRepository.en.js'
import LatestNewsSlider from '../../features/news/presentation/LatestNewsSlider/CompactNewsSlider.jsx'
import LatestNewsSliderEn from '../../features/news/presentation/LatestNewsSlider/CompactNewsSlider.en.jsx'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import './Home.css'

function Home() {
  const { isArabic, dir } = useLanguage()
  const latestNews = getLatestNews(isArabic ? newsRepository : newsRepositoryEn)

  const stats = isArabic
    ? [
        { value: `${latestNews.length}+`, label: 'أخبار وفعاليات' },
        { value: '126+', label: 'باحث/ة وممارس/ة' },
        { value: '30+', label: 'بحثًا ودليلًا' },
      ]
    : [
        { value: `${latestNews.length}+`, label: 'News and events' },
        { value: '126+', label: 'Researchers and practitioners' },
        { value: '30+', label: 'Research papers and guides' },
      ]

  const contact = isArabic
    ? {
        eyebrow: 'تواصل معنا',
        title: 'نحن هنا لدعم رحلتك البحثية',
        lead: 'للاستفسارات والتعاون والدعم المرتبط بالمنصة، يمكنك التواصل مع متحف الرياضيات في جامعة القدس.',
        emailLabel: 'البريد الإلكتروني',
        phoneLabel: 'الهاتف',
        locationLabel: 'الموقع',
        location: 'الحرم الجامعي الرئيسي، جامعة القدس، أبو ديس، فلسطين',
      }
    : {
        eyebrow: 'Contact Us',
        title: 'We are here to support your research journey',
        lead: 'For platform inquiries, collaboration, and support, you can contact the Meet Math Museum at Al-Quds University.',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        locationLabel: 'Location',
        location: 'Main Campus, Al-Quds University, Abu Dis, Palestine',
      }

  return (
    <>
      <div id="news">
        {isArabic
          ? <LatestNewsSlider items={latestNews} autoplay autoplayDelay={4200} />
          : <LatestNewsSliderEn items={latestNews} autoplay autoplayDelay={4200} />}
      </div>

      <section className="home-stats" id="stats" dir={dir} aria-labelledby="home-stats-title">
        <div className="home-stats__heading">
          <h2 id="home-stats-title">{isArabic ? 'أرقام من المنصة' : 'Platform Stats'}</h2>
          <p>
            {isArabic
              ? 'لقطة سريعة عن المحتوى والمجتمع البحثي المتاحين حاليًا داخل PARP.'
              : 'A quick snapshot of the content and research community currently represented in PARP.'}
          </p>
        </div>
        <div className="home-stats__grid">
          {stats.map((stat) => (
            <article className="home-stats__card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </section>

      <div id="space-journey">
        {isArabic ? <SpaceJourney /> : <SpaceJourneyEn />}
      </div>

      <section className="home-contact" id="contact" dir={dir} aria-labelledby="contact-title">
        <div className="home-contact__inner">
          <div>
            <span className="home-contact__eyebrow">{contact.eyebrow}</span>
            <h2 id="contact-title">{contact.title}</h2>
            <p className="home-contact__lead">{contact.lead}</p>
          </div>

          <div className="home-contact__details">
            <a className="home-contact__item" href="mailto:info.meetmath@alquds.edu">
              <small>{contact.emailLabel}</small>
              <strong>info.meetmath@alquds.edu</strong>
            </a>
            <a className="home-contact__item" href="tel:+97222791229">
              <small>{contact.phoneLabel}</small>
              <strong>+972 2 279 1229</strong>
            </a>
            <div className="home-contact__item">
              <small>{contact.locationLabel}</small>
              <strong>{contact.location}</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
