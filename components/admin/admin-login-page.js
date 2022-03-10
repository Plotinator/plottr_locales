import { useEffect, useState, useRef } from 'react'
import { PropTypes } from 'prop-types'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { FunSpinner } from 'connected-components'
import { onSessionChange, firebaseUI, startUI, currentUser, logOut } from 'wired-up-firebase'
import { logger } from '../../lib/logger'

export default function AdminLoginPage() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (sessionChecked) return
    onSessionChange((user) => {
      logger.info('Session changed', user)
      setSessionChecked(true)
      if (user) {
        logger.info('Session w/ user', router.query)
        const url = `/admin`
        logger.info('url to redirect', url)
        currentUser()
          .getIdTokenResult(true)
          .then((token) => {
            logger.info('Received token')
            if (token.claims.admin) {
              window.location.href = url
            } else {
              logOut().then(() => {
                alert('You dont have the admin claim.')
                window.location.reload()
              })
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

  return <main className="login__main">{renderMain()}</main>
}

AdminLoginPage.propTypes = {
  email: PropTypes.string,
}
