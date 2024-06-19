import { actions, selectors } from 'wired-up-pltr'
import { ActionTypes } from 'pltr'

const HALF_AN_HOUR = 30 * 60 * 1000
const LICENSE_CHECK_INTERVAL = HALF_AN_HOUR

const asyncNop = () => {
  return Promise.resolve()
}

const startLicenseCheck = (store, checkForAndSaveLicense, persistLicenseMode, logger) => {
  const existingLicenseCheckInterval = selectors.licenseCheckIntervalSelector(store.getState())
  if (existingLicenseCheckInterval) {
    logger.info('Cancelling prior license check interval with id', existingLicenseCheckInterval)
    clearInterval(existingLicenseCheckInterval)
  }

  const check = () => {
    if (selectors.needsToCheckALicenseType(store.getState())) {
      return checkForAndSaveLicense(persistLicenseMode)
        .then(() => {
          logger.info('Connected to licensing API and successfully adjudicated license')
          store.dispatch({ type: ActionTypes.RECONNECTED_TO_LICENSING_API })
        })
        .catch((_error) => {
          logger.info('Cannot connect to license API')
          store.dispatch({ type: ActionTypes.DIFFICULTY_CONTACTING_LICENSING_API })
        })
    } else {
      return Promise.resolve()
    }
  }

  logger.info('Start fetching pro and plottr licenses...')
  store.dispatch({
    type: ActionTypes.START_FETCHING_A_LICENSE_TYPE,
    licenseType: 'proSubscription',
  })
  store.dispatch({
    type: ActionTypes.START_FETCHING_A_LICENSE_TYPE,
    licenseType: 'license',
  })
  check()
    .then(() => {
      logger.info('Finish fetching pro and plottr licenses...')
      store.dispatch({
        type: ActionTypes.FINISH_FETCHING_A_LICENSE_TYPE,
        licenseType: 'proSubscription',
      })
      store.dispatch({
        type: ActionTypes.FINISH_FETCHING_A_LICENSE_TYPE,
        licenseType: 'license',
      })
    })
    .catch((error) => {
      // Ignore here.  Something else went wrong.
    })

  const intervalId = setInterval(check, LICENSE_CHECK_INTERVAL)
  logger.info(
    `Starting regular license check every ${LICENSE_CHECK_INTERVAL}ms.  New interval id: ${intervalId}`
  )
  store.dispatch({
    type: ActionTypes.SET_LICENSE_CHECK_INTERVAL_ID,
    intervalId,
  })
}

const publishSessionChangesToStore = (theWorld, logger) => (store) => {
  const setUserId = actions.client.setUserId
  const setEmailAddress = actions.client.setEmailAddress
  const finishCheckingSession = actions.applicationState.finishCheckingSession
  const finishLoggingIn = actions.applicationState.finishLoggingIn
  // Do an initial license check, and re-check when we get a new
  // session.
  startLicenseCheck(store, theWorld.license.checkForAndSaveLicense, asyncNop, logger)
  logger.info('About to start listening for Pro session')
  return theWorld.session.listenForSessionChange(store, ({ uid, email }) => {
    logger.info(`Session listening responded with uid: ${uid} and email: ${email}`)
    store.dispatch(setEmailAddress(email))
    store.dispatch(setUserId(uid))
    store.dispatch(finishCheckingSession())
    return new Promise((resolve, reject) => {
      if (email && typeof email === 'string') {
        logger.info(`Persisting email: ${email}`)
        theWorld.license.persistEmailAddress(email).then(resolve, reject)
      } else {
        resolve(null)
      }
    })
      .then(() => {
        return new Promise((resolve, reject) => {
          if (uid && typeof uid === 'string') {
            logger.info(`Persisting uid: ${uid}`)
            theWorld.license.persistUserId(uid).then(resolve, reject)
          } else {
            resolve(null)
          }
        })
      })
      .then(() => {
        if (uid && typeof uid === 'string' && email && typeof email === 'string') {
          logger.info("We're logged in.  Restarting license check")
          store.dispatch(finishLoggingIn())
          return startLicenseCheck(store, theWorld.license.checkForAndSaveLicense, asyncNop, logger)
        } else {
          return null
        }
      })
  })
}

const publishChangesToStore = (theWorld, logger) => (store) => {
  store.dispatch(actions.applicationState.startCheckingSession())
  const unsubscribeToSessionChanges = publishSessionChangesToStore(theWorld, logger)(store)

  return () => {
    unsubscribeToSessionChanges()
  }
}

export default publishChangesToStore
