import React from 'react'
import Head from 'next/head'

export default function Beat1() {
  return (
    <div>
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

      <main style={{ padding: '16px' }}>
        <h1 style={{ textAlign: 'center' }}>BEAT 1</h1>
        <h2 style={{ textAlign: 'center' }}>The Ordinary World</h2>
        <p>Bob, the Sea Otter, lived in Otterton with lots of sisters.</p>
        <p>
          Instead of doing his chores, he spent his days relaxing by the sea, eating the urchins
          from the kelp.
        </p>
      </main>
    </div>
  )
}
