import SpaceJourney from '../../components/SpaceJourney/SpaceJourney.jsx'
import { getLatestNews } from '../../features/news/application/getLatestNews.js'
import { newsRepository } from '../../features/news/data/newsRepository.js'
import LatestNewsSlider from '../../features/news/presentation/LatestNewsSlider/LatestNewsSlider.jsx'

const latestNews = getLatestNews(newsRepository, { limit: 6 })

function Home() {
  return (
    <>
      <LatestNewsSlider items={latestNews} />
      <SpaceJourney />
    </>
  )
}

export default Home
