import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { projectId } = router.query

  // now use projectId to redirect
  const loginURL = `/login${projectId ? '/' + projectId : ''}`

  return (
    <div className="home">
      <Head>
        <title>Plottr</title>
        <meta name="description" content="Plottr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="home__main">
        <div className="home__left">
          <h1>Welcome to Plottr</h1>
          <p>Click &quot;Get started&quot; to start Plottr in your browser.</p>
          <div className="home__controls">
            <a className="home__button" href={loginURL}>
              Get started
            </a>
          </div>
        </div>
        <div className="home__right">
          <div className="home__logo">
            <Image src="/logo_28_500.png" alt="Plottr Logo" width="358" height="500" />
          </div>
        </div>
      </main>

      <footer className="home-footer"> </footer>
    </div>
  )
}
