import { useEffect, useState, useRef } from 'react'
import { PropTypes } from 'prop-types'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { FunSpinner } from 'connected-components'
import { onSessionChange, firebaseUI, startUI } from 'plottr_firebase'
import PasswordForm, { passwordSet } from '../components/password-form'

export default function Login() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()
  const { projectId } = router.query

  useEffect(() => {
    if (sessionChecked) return
    onSessionChange((user) => {
      setSessionChecked(true)
      if (user) {
        const url = `/timeline${projectId ? '/' + projectId : ''}`
        window.location.href = url
      }
    })
  }, [])

  const firebaseLoginComponentRef = useRef()
  useEffect(() => {
    if (firebaseLoginComponentRef.current) {
      const ui = firebaseUI()
      startUI(ui, '#firebase-login')
    }
  }, [])

  const renderMain = () => {
    const passwordNotSet = !passwordSet()

    return (
      <>
        {passwordNotSet ? <PasswordForm /> : null}
        <div
          className="login__left"
          style={{ ...{ display: !sessionChecked || passwordNotSet ? 'none' : undefined } }}
        >
          <h1>Welcome to Plottr</h1>
          <div id="firebase-login" ref={firebaseLoginComponentRef}></div>
        </div>
        <div
          className="login__right"
          style={{ ...{ display: !sessionChecked ? 'none' : undefined } }}
        >
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
