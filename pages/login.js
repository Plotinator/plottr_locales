import { useEffect, useState, useRef } from 'react'
import { PropTypes } from 'prop-types'
import Head from 'next/head'
import Image from 'next/image'

import { FunSpinner } from 'connected-components'
import { onSessionChange, firebaseUI, startUI } from '../lib/firebase'

export default function Login() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [ui, setUI] = useState(null)

  useEffect(() => {
    if (sessionChecked) return
    onSessionChange((user) => {
      setSessionChecked(true)
      if (user) {
        window.location.href = '/timeline'
      }
    })
  }, [])

  const firebaseLoginComponentRef = useRef()
  useEffect(() => {
    if (firebaseLoginComponentRef.current) {
      const _ui = firebaseUI()
      setUI(_ui)
      startUI(_ui, '#firebase-login')
    }
  }, [])

  const renderMain = () => {
    return (
      <>
        <div className="login__left" style={{ hidden: !sessionChecked }}>
          <h1>Welcome to Plottr</h1>
          <div id="firebase-login" ref={firebaseLoginComponentRef}></div>
        </div>
        <div className="login__right" style={{ hidden: !sessionChecked }}>
          <div className="login__logo">
            <Image src="/logo_28_500.png" alt="Plottr Logo" width="358" height="500" />
          </div>
        </div>
        {sessionChecked ? null : <FunSpinner />}
      </>
    )
  }

  return (
    <div className="login">
      <Head>
        <title>Plottr</title>
        <meta name="description" content="Plottr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="login__main">{renderMain()}</main>
      <footer className="login-footer"> </footer>
    </div>
  )
}

Login.propTypes = {
  email: PropTypes.string,
}
