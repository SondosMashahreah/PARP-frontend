import Header from '../../components/Header/Header.jsx'
import SpaceJourney from '../../components/SpaceJourney/SpaceJourney.jsx'

function Home() {
  return (
    <>
      <Header />
      <main id="main-content" className="app-main" tabIndex={-1} aria-label="محتوى المنصة">
        <SpaceJourney />
      </main>
    </>
  )
}

export default Home
