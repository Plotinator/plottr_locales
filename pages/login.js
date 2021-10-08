import { useEffect, useState, useRef } from 'react'
import { PropTypes } from 'prop-types'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { FunSpinner } from 'connected-components'
import { onSessionChange, firebaseUI, startUI, currentUser } from 'plottr_firebase'
import { setSubscriptionInfo, userHasPro } from '../lib/checkPro'

export default function Login() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()
  const { pid } = router.query

  useEffect(() => {
    if (sessionChecked) return
    onSessionChange(async (user) => {
      console.log('session changed', user)
      setSessionChecked(true)
      if (user) {
        console.log('session w/ user', router.query)
        const url = `/timeline${pid ? '?pid=' + pid : ''}`
        console.log('url to redirect', url)
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
          window.location.href = url
        }
        currentUser()
          .getIdTokenResult()
          .then(async (token) => {
            console.log('token', token.claims)
            if (token.claims.beta || token.claims.admin) {
              setSubscriptionInfo({ ...token.claims, customer: { email: user.email } })
              window.location.href = url
            } else {
              // check for Plottr Pro
              const hasPro = await userHasPro(user.email)
              if (hasPro) {
                window.location.href = url
              } else {
                // display something saying
                // the user is not authorized for the beta
                console.log('not authorized')
              }
            }
          })
      }
    })
  }, [])

  const firebaseLoginComponentRef = useRef()
  useEffect(() => {
    if (!sessionChecked) return
    if (firebaseLoginComponentRef.current) {
      const ui = firebaseUI()
      startUI(ui, '#firebase-login')
    }
  }, [sessionChecked])

  const renderMain = () => {
    if (!sessionChecked) return <FunSpinner />

    return (
      <>
        <div className="login__left">
          <h1>Welcome to Plottr</h1>
          <div id="firebase-login" ref={firebaseLoginComponentRef}></div>
        </div>
        <div className="login__right">
          <div className="login__logo">
            <Image src="/logo_28_500.png" alt="Plottr Logo" width="358" height="500" />
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="login">
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
      <main className="login__main">{renderMain()}</main>
      <footer className="login-footer"> </footer>
    </div>
  )
}

Login.propTypes = {
  email: PropTypes.string,
}
