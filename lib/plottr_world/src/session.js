import { actions, selectors } from 'wired-up-pltr'
import { ActionTypes } from 'pltr/v2'

const HALF_AN_HOUR = 30 * 60 * 1000
const LICENSE_CHECK_INTERVAL = HALF_AN_HOUR

const startLicenseCheck = (store, checkForAndSaveLicense) => {
  const existingLicenseCheckInterval = selectors.licenseCheckIntervalSelector(store.getState())
  if (existingLicenseCheckInterval) {
    clearInterval(existingLicenseCheckInterval)
  }

  const check = () => {
    if (selectors.needsToCheckALicenseType(store.getState())) {
      return checkForAndSaveLicense()
    } else {
      return Promise.resolve()
    }
  }

  // First check
  const needToCheckInitially = selectors.needsToCheckALicenseType(store.getState())
  if (needToCheckInitially) {
    store.dispatch({
      type: ActionTypes.START_LOADING_A_LICENSE_TYPE,
      licenseType: 'proSubscription',
    })
    store.dispatch({
      type: ActionTypes.START_LOADING_A_LICENSE_TYPE,
      licenseType: 'license',
    })
  }
  check().then(() => {
    if (needToCheckInitially) {
      store.dispatch({
        type: ActionTypes.FINISH_LOADING_A_LICENSE_TYPE,
        licenseType: 'proSubscription',
      })
      store.dispatch({
        type: ActionTypes.FINISH_LOADING_A_LICENSE_TYPE,
        licenseType: 'license',
      })
    }
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
  // Do an initial license check, and re-check when we get a new
  // session.
  startLicenseCheck(store, theWorld.license.checkForAndSaveLicense)
  return theWorld.session.listenForSessionChange(store, ({ uid, email }) => {
    store.dispatch(setUserId(uid))
    store.dispatch(setEmailAddress(email))
    store.dispatch(finishCheckingSession())
    startLicenseCheck(store, theWorld.license.checkForAndSaveLicense)
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
