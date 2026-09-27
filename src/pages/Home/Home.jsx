import SpaceJourney from '../../components/SpaceJourney/SpaceJourney.jsx'
import { getLatestNews } from '../../features/news/application/getLatestNews.js'
import { newsRepository } from '../../features/news/data/newsRepository.js'
import LatestNewsSlider from '../../features/news/presentation/LatestNewsSlider/CompactNewsSlider.jsx'

const latestNews = getLatestNews(newsRepository)

function Home() {
  return (
    <>
      <LatestNewsSlider items={latestNews} autoplay autoplayDelay={4200} />
      <SpaceJourney />
    </>
  )
}

export default Home
