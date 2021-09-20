import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="home">
      <Head>
        <title>Plottr</title>
        <meta name="description" content="Plottr" />

        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <main className="home__main">
        <div className="home__left">
          <h1>Welcome to Plottr</h1>
          <p>Click &quot;Get started&quot; to start Plottr in your browser.</p>
          <div className="home__controls">
            <a className="home__button" href="/login">
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
