import SpaceJourney from '../../components/SpaceJourney/SpaceJourney.jsx'
import SpaceJourneyEn from '../../components/SpaceJourney/SpaceJourney.en.jsx'
import { getLatestNews } from '../../features/news/application/getLatestNews.js'
import { newsRepository } from '../../features/news/data/newsRepository.js'
import { newsRepositoryEn } from '../../features/news/data/newsRepository.en.js'
import LatestNewsSlider from '../../features/news/presentation/LatestNewsSlider/CompactNewsSlider.jsx'
import LatestNewsSliderEn from '../../features/news/presentation/LatestNewsSlider/CompactNewsSlider.en.jsx'
import { getPlatformStats } from '../../features/platform/data/platformStats.js'
import ContactForm from '../../features/contact/presentation/ContactForm.jsx'
import { useLanguage } from '../../i18n/useLanguage.js'
import { RouteLink } from '../../routing/clientRouter.jsx'
import Icon from '../../components/ui/Icon.jsx'
import ValuesNetwork from '../../features/values/presentation/ValuesNetwork.jsx'
import './Home.css'

export default function Home() {
  const { language, isArabic, dir } = useLanguage()
  const latestNews = getLatestNews(isArabic ? newsRepository : newsRepositoryEn)
  const stats = getPlatformStats(language)
  return (
    <>
      <div id="news">
        {isArabic ? <LatestNewsSlider items={latestNews} autoplay autoplayDelay={4200} /> : <LatestNewsSliderEn items={latestNews} autoplay autoplayDelay={4200} />}
      </div>
      <section className="home-stats" id="stats" dir={dir} aria-labelledby="home-stats-title">
        <div className="home-stats__heading">
          <div><span className="home-section-eyebrow">{isArabic ? 'مساحة للمعرفة' : 'A space for knowledge'}</span><h2 id="home-stats-title">{isArabic ? 'اكتشف ما ينتظرك' : 'Discover what awaits'}</h2></div>
          <p>{isArabic ? 'نقطة بداية واضحة لرحلتك. هذه أعداد المحتوى المتاح حاليًا في النسخة التجريبية.' : 'A clear starting point for your journey. These counts reflect content currently available in the demo.'}</p>
        </div>
        <div className="home-stats__grid">
          {stats.map((stat) => <RouteLink className="home-stats__card" key={stat.id} to={stat.to}>
            <span className="home-stats__icon"><Icon name={stat.icon} /></span>
            <strong>{String(stat.value).padStart(2, '0')}</strong><h3>{stat.label}</h3>
            <p>{stat.description}<span aria-hidden="true">{isArabic ? '←' : '→'}</span></p>
          </RouteLink>)}
        </div>
      </section>
      <div id="space-journey">{isArabic ? <SpaceJourney /> : <SpaceJourneyEn />}</div>
      <ValuesNetwork />
      <section className="home-contact" id="contact" dir={dir} aria-labelledby="contact-title">
        <div className="home-contact__intro">
          <span className="home-section-eyebrow">{isArabic ? 'لنبقَ على تواصل' : 'Let’s stay connected'}</span>
          <h2 id="contact-title">{isArabic ? 'كل فكرة تبدأ بمحادثة.' : 'Every idea starts with a conversation.'}</h2>
          <p>{isArabic ? 'عندك سؤال، اقتراح أو فكرة للتعاون؟ اكتب لنا، ويسعد فريق المنصة بمساعدتك في خطوتك القادمة.' : 'Have a question, a suggestion, or an idea for collaboration? Write to us. The platform team is here to help with your next step.'}</p>
          <a className="home-contact__email" href="mailto:info.meetmath@alquds.edu"><Icon name="mail" /><span dir="ltr">info.meetmath@alquds.edu</span></a>
          <small>{isArabic ? 'متحف الرياضيات · جامعة القدس · أبو ديس، فلسطين' : 'Meet Math Museum · Al-Quds University · Abu Dis, Palestine'}</small>
        </div>
        <div className="home-contact__form"><ContactForm /></div>
      </section>
    </>
  )
}
