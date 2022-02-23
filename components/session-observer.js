import { PropTypes } from 'prop-types'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { listenToFiles, onSessionChange, logOut, currentUser } from 'wired-up-firebase'
import { useRouter } from 'next/router'

import { licenseServerAPIs } from '../lib/api'
import { logger } from '../lib/logger'

const SessionObserver = ({
  setUserId,
  setKnownFiles,
  setEmailAddress,
  generalError,
  setHasPro,
  setProLicenseInfo,
  finishLoadingALicenseType,
  startLoadingALicenseType,
  checkedSession,
  isLoggedIn,
  hasPro,
  userId,
  emailAddress,
}) => {
  const router = useRouter()
  const { pid } = router.query

  useEffect(() => {
    let fileListener = null
    const sessionListener = onSessionChange(
      (user) => {
        if (!user) {
          const url = `/login${pid ? '?pid=' + pid : ''}`
          window.location.href = url
        } else {
          setUserId(user.uid)
          setEmailAddress(user.email)
          fileListener = listenToFiles(
            user.uid,
            (files) => {
              const activeFiles = files.filter(({ deleted }) => !deleted)
              setKnownFiles(activeFiles)
            },
            (error) => {
              logger.error('Error listening to files list.', error)
              generalError('There seems to be a problem with your network.')
            }
          )
        }
      },
      (error) => {
        logger.error('Error while trying to listen for session changes.', error)
        generalError('There seems to be a problem with your network.')
      }
    )
    return () => {
      if (fileListener) fileListener()
      sessionListener()
    }
  }, [])

  const handleCheckPro = (uid, email, isLifetime, isAdmin) => (hasPro, info) => {
    if (hasPro) {
      setHasPro(hasPro)
      setUserId(uid)
      setEmailAddress(email)
      setProLicenseInfo({
        ...info,
        expiration: isLifetime ? 'lifetime' : info.expiration,
        admin: isAdmin,
      })
      finishLoadingALicenseType('proSubscription')
    } else {
      logOut().then(() => {
        setUserId(null)
        setEmailAddress(null)
      })
    }
  }

  useEffect(() => {
    if (checkedSession && isLoggedIn && !hasPro) {
      startLoadingALicenseType('proSubscription')
      currentUser()
        ?.getIdTokenResult()
        .then((token) => {
          if (token.claims.beta || token.claims.admin || token.claims.lifetime) {
            handleCheckPro(
              userId,
              emailAddress,
              token.claims.lifeTime || token.claims.admin,
              token.claims.admin
            )(true, { expiration: 'lifetime', admin: true })
          } else {
            if (emailAddress) {
              licenseServerAPIs
                .checkForPro(
                  emailAddress,
                  handleCheckPro(
                    userId,
                    emailAddress,
                    token.claims.lifeTime || token.claims.admin,
                    token.claims.admin
                  )
                )
                .catch((error) => {
                  // TODO: maybe retry?
                  logger.error('Failed to check for pro', error)
                  finishLoadingALicenseType('proSubscription')
                  logOut()
                })
            }
          }
        })
    }
  }, [isLoggedIn, checkedSession, userId, emailAddress, hasPro])

  return null
}

SessionObserver.propTypes = {
  setUserId: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    checkedSession: selectors.sessionCheckedSelector(state.present),
    isLoggedIn: selectors.isLoggedInSelector(state.present),
    hasPro: selectors.hasProSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    emailAddress: selectors.emailAddressSelector(state.present),
  }),
  {
    setKnownFiles: actions.knownFiles.setKnownFiles,
    setUserId: actions.client.setUserId,
    setEmailAddress: actions.client.setEmailAddress,
    generalError: actions.error.generalError,
    setHasPro: actions.client.setHasPro,
    setProLicenseInfo: actions.license.setProLicenseInfo,
    finishLoadingALicenseType: actions.applicationState.finishLoadingALicenseType,
    startLoadingALicenseType: actions.applicationState.startLoadingALicenseType,
  }
)(SessionObserver)
