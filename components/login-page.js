import { useEffect, useState, useRef } from 'react'
import { PropTypes } from 'prop-types'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { FunSpinner } from 'connected-components'
import { onSessionChange, firebaseUI, startUI, currentUser } from 'wired-up-firebase'
import { useProLicenseInfo, userHasPro } from '../lib/checkPro'
import { logger } from '../lib/logger'

export default function LoginPage() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [_licenseInfo, _size, _setAtKey, setLicenseInfo] = useProLicenseInfo()
  const router = useRouter()
  const { pid } = router.query

  useEffect(() => {
    if (sessionChecked) return
    onSessionChange(async (user) => {
      logger.info('Session changed', user)
      setSessionChecked(true)
      if (user) {
        logger.info('Session w/ user', router.query)
        const url = `/timeline${pid ? '?pid=' + pid : ''}`
        logger.info('url to redirect', url)
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
          window.location.href = url
        } else {
          currentUser()
            .getIdTokenResult()
            .then(async (token) => {
              logger.info('Received token')
              if (token.claims.beta || token.claims.admin) {
                setLicenseInfo({ claims: token.claims, customer: { email: user.email } })
                window.location.href = url
              } else {
                // check for Plottr Pro
                const [hasPro, info] = await userHasPro(user.email)
                if (hasPro) {
                  setLicenseInfo({ ...info, claims: token.claims })
                  window.location.href = url
                } else {
                  // display something saying
                  // the user is not authorized for the beta
                  logger.error('not authorized')
                }
              }
            })
        }
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

LoginPage.propTypes = {
  email: PropTypes.string,
}
