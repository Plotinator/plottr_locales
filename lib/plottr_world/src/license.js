import { actions } from 'wired-up-pltr'

const publishTrialChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setTrialInfo
  theWorld.license
    .currentTrial()
    .then((currentTrial) => {
      store.dispatch(action(currentTrial))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current trial`, error)
    })
  store.dispatch(actions.applicationState.finishLoadingALicenseType('trial'))
  return theWorld.license.listenToTrialChanges(store, (error, newValue) => {
    if (error) {
      if (error.code === 'ECONNABORTED') {
        theWorld.logger.warn(`Failed to receive trial (ECONNABORTED likely a timeout)`)
      } else {
        theWorld.logger.warn(`Failed to receive trial`, error)
      }
    } else {
      store.dispatch(action(newValue))
    }
  })
}

const publishLicenseChangesToStore = (theWorld) => (store) => {
  const action = actions.license.setLicenseInfo
  theWorld.license
    .currentLicense()
    .then((currentLicense) => {
      store.dispatch(action(currentLicense))
      store.dispatch(actions.applicationState.finishLoadingALicenseType('license'))
      store.dispatch(actions.applicationState.finishLoadingALicenseType('proSubscription'))
    })
    .catch((error) => {
      // TODO: retry?
      theWorld.logger.error(`Failed to read current license`, error)
    })

  return theWorld.license.listenToLicenseChanges(store, (error, newValue) => {
    if (error) {
      if (error.code === 'ECONNABORTED') {
        theWorld.logger.warn(`Failed to receive license changes (ECONNABORTED likely a timeout)`)
      } else {
        theWorld.logger.warn(`Failed to receive license changes`, error)
      }
    } else {
      store.dispatch(action(newValue))
    }
  })
}

const publishChangesToStore = (theWorld) => (store) => {
  store.dispatch(actions.applicationState.startLoadingALicenseType('trial'))
  const unsubscribeToTrialChanges = publishTrialChangesToStore(theWorld)(store)
  store.dispatch(actions.applicationState.startLoadingALicenseType('license'))
  store.dispatch(actions.applicationState.startLoadingALicenseType('proSubscription'))
  const unsubscribeToLicenseChanges = publishLicenseChangesToStore(theWorld)(store)

  return () => {
    unsubscribeToTrialChanges()
    unsubscribeToLicenseChanges()
  }
}

export default publishChangesToStore
