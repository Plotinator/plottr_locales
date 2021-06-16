import { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import Head from 'next/head'
import Image from 'next/image'

import CreateAccountForm from '../components/create-account-form'
import LoginForm from '../components/login-form'

import { serverOnlySessionCookie } from '../lib/session'
import { authentication } from '../lib/api-clients'

export default function Login({ email }) {
  useEffect(() => {
    if (email) {
      window.location.href = '/timeline'
    }
  }, [email])

  const [isCreatingAccount, setIsCreatingAccount] = useState(true)
  const [posting, setPosting] = useState(false)

  const handleClickSwitchToLogin = () => {
    if (!posting) setIsCreatingAccount(false)
  }

  const handleClickSwitchToCreate = () => {
    if (!posting) setIsCreatingAccount(true)
  }

  const SwitchToLogin = () => (
    <p>
      Create an account (or
      <button
        disabled={posting}
        onClick={handleClickSwitchToLogin}
        className="login__switch-form-type-button"
      >
        log in
      </button>
      )
    </p>
  )

  const SwitchToCreateAccount = () => (
    <p>
      Log into an account (or
      <button
        disabled={posting}
        onClick={handleClickSwitchToCreate}
        className="login__switch-form-type-button"
      >
        create an account
      </button>
      )
    </p>
  )

  const handleSubmitLoginForm = (form) => {
    if (posting) return
    setPosting(true)
    const email = form['0'].value
    const password = form['1'].value
    // TODO: if request fails then unset posting
    authentication.logIn(email, password).then((response) => {
      window.location.href = '/timeline'
    })
  }

  const handleSubmitCreateAccountForm = (form) => {
    if (posting) return
    setPosting(true)
    const firstName = form['0'].value
    const email = form['1'].value
    const password = form['2'].value
    // TODO: if request fails then unset posting
    authentication.createAccount(firstName, email, password).then((response) => {
      window.location.href = '/timeline'
    })
  }

  return (
    <div className="login">
      <Head>
        <title>Plottr</title>
        <meta name="description" content="Plottr" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="login__main">
        <div className="login__left">
          <h1>Welcome to Plottr</h1>
          {isCreatingAccount ? <SwitchToLogin /> : <SwitchToCreateAccount />}
          {isCreatingAccount ? (
            <CreateAccountForm onSubmit={handleSubmitCreateAccountForm} posting={posting} />
          ) : (
            <LoginForm onSubmit={handleSubmitLoginForm} posting={posting} />
          )}
        </div>
        <div className="login__right">
          <div className="login__logo">
            <Image src="/logo_28_500.png" alt="Plottr Logo" width="358" height="500" />
          </div>
        </div>
      </main>

      <footer className="login-footer"> </footer>
    </div>
  )
}

Login.propTypes = {
  email: PropTypes.string,
}

export async function getServerSideProps({ req }) {
  const sessionCookie = serverOnlySessionCookie(req)
  if (sessionCookie && sessionCookie.email) {
    return {
      props: {
        email: sessionCookie.email,
      },
    }
  }
  return { props: {} }
}
