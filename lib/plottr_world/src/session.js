import { actions, selectors } from 'wired-up-pltr'
import { ActionTypes } from 'pltr/v2'

const HALF_AN_HOUR = 30 * 60 * 1000
const LICENSE_CHECK_INTERVAL = HALF_AN_HOUR

const asyncNop = () => {
  return Promise.resolve()
}

const startLicenseCheck = (store, checkForAndSaveLicense, persistLicenseMode) => {
  const existingLicenseCheckInterval = selectors.licenseCheckIntervalSelector(store.getState())
  if (existingLicenseCheckInterval) {
    clearInterval(existingLicenseCheckInterval)
  }

  const check = () => {
    if (selectors.needsToCheckALicenseType(store.getState())) {
      return checkForAndSaveLicense(persistLicenseMode)
        .then(() => {
          store.dispatch({ type: ActionTypes.RECONNECTED_TO_LICENSING_API })
        })
        .catch((_error) => {
          store.dispatch({ type: ActionTypes.DIFFICULTY_CONTACTING_LICENSING_API })
        })
    } else {
      return Promise.resolve()
    }
  }

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
  store.dispatch({
    type: ActionTypes.SET_LICENSE_CHECK_INTERVAL_ID,
    intervalId,
  })
}

const publishSessionChangesToStore = (theWorld) => (store) => {
  const setUserId = actions.client.setUserId
  const setEmailAddress = actions.client.setEmailAddress
  const finishCheckingSession = actions.applicationState.finishCheckingSession
  const finishLoggingIn = actions.applicationState.finishLoggingIn
  // Do an initial license check, and re-check when we get a new
  // session.
  startLicenseCheck(store, theWorld.license.checkForAndSaveLicense, asyncNop)
  return theWorld.session.listenForSessionChange(store, ({ uid, email }) => {
    store.dispatch(setEmailAddress(email))
    store.dispatch(setUserId(uid))
    store.dispatch(finishCheckingSession())
    return new Promise((resolve, reject) => {
      if (email && typeof email === 'string') {
        theWorld.license.persistEmailAddress(email).then(resolve, reject)
      } else {
        resolve()
      }
    })
      .then(() => {
        return new Promise((resolve, reject) => {
          if (uid && typeof uid === 'string') {
            theWorld.license.persistUserId(uid).then(resolve, reject)
          } else {
            resolve()
          }
        })
      })
      .then(() => {
        if (uid && typeof uid === 'string' && email && typeof email === 'string') {
          store.dispatch(finishLoggingIn())
          return startLicenseCheck(store, theWorld.license.checkForAndSaveLicense, asyncNop)
        } else {
          return null
        }
      })
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  store.dispatch(actions.applicationState.startCheckingSession())
  const unsubscribeToSessionChanges = publishSessionChangesToStore(theWorld)(store)

  return () => {
    unsubscribeToSessionChanges()
  }
}

export default publishChangesToStore
