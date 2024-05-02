import { onStoreChanges } from './app/store/onStoreChanges'

import { helpers } from 'pltr/v2'

import { bootFile } from './app/bootFile'
import { makeMainProcessClient } from './app/mainProcessClient'
import { whenClientIsReady } from '../shared/socket-client'
import logger from '../shared/logger'

const { onReloadFromFile, pleaseFetchState, setWindowTitle } = makeMainProcessClient()

function displayFileName(fileName, fileURL, displayFilePath) {
  const isOnCloud = helpers.file.urlPointsToPlottrCloud(fileURL)
  const withoutProtocol = helpers.file.withoutProtocol(fileURL)
  return whenClientIsReady(({ basename }) => {
    const fileNamePromise = isOnCloud
      ? Promise.resolve(fileName)
      : withoutProtocol
      ? basename(withoutProtocol)
      : Promise.resolve('')
    return fileNamePromise.then((computedFileName) => {
      const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
      const baseFileName = displayFilePath ? ` - ${computedFileName}` : ''
      const plottr = isOnCloud ? 'Plottr Pro' : 'Plottr'
      try {
        const decodedFileName = decodeURIComponent(baseFileName)
        return `${plottr}${decodedFileName}${devMessage}`
      } catch (error) {
        return `${plottr}${baseFileName}${devMessage}`
      }
    })
  })
}

export const startupStateMachine = (getStore, selectors, actions, saveBackupOnFirebase) => {
  const saveBackup = (filePath, file) => {
    const state = getStore().getState()
    const onCloud = selectors.isCloudFileSelector(state)
    const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
    const userId = selectors.userIdSelector(state)
    const localBackupsEnabled = selectors.localBackupsEnabledSelector(state)

    const result =
      isInProMode && onCloud ? saveBackupOnFirebase(userId, file) : Promise.resolve(true)

    return result.then(() => {
      return whenClientIsReady(({ saveBackup }) => {
        if (!onCloud || (onCloud && localBackupsEnabled)) {
          return saveBackup(filePath, file)
        }
        return Promise.resolve(false)
      })
    })
  }

  const closeDashboard = () => {
    getStore().dispatch(actions.applicationState.dashboardClosed())
    getStore().dispatch(actions.client.setCurrentAppStateToApplication())
  }

  const load = (fileURL, options, numOpenFiles, windowOpenedWithKnownPath) => {
    const showDashboard = selectors.showDashboardOnBootSelector(getStore().getState())
    const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(getStore().getState())
    const isInOfflineMode = selectors.isInOfflineModeSelector(getStore().getState())

    // We wont load a file at all on boot if this is supposed to be
    // the dashboard.
    if (!windowOpenedWithKnownPath && showDashboard && numOpenFiles <= 1) {
      getStore().dispatch(actions.applicationState.finishCheckingFileToLoad())
      return Promise.resolve()
    } else {
      getStore().dispatch(actions.applicationState.setPathToProject(fileURL))

      // We only want to obey the setting to show the dashboard on
      // start-up for the first file opened.  All files opened after
      // that shouldn't have the dashboard opened.
      if (
        windowOpenedWithKnownPath ||
        numOpenFiles > 1 ||
        (!showDashboard && fileURL && typeof fileURL === 'string')
      ) {
        // To boot the file automatically: we must either be running pro
        // and it's a cloud file, we must be running classic mode and
        // it's not a cloud file, or we must be running pro with offline
        // mode enabled, in which case we use convention to determine
        // the offline file counterpart.
        if (!!isInProMode === !!helpers.file.urlPointsToPlottrCloud(fileURL)) {
          return bootFile(whenClientIsReady, fileURL, options, numOpenFiles, saveBackup)
            .then(() => {
              getStore().dispatch(actions.applicationState.finishCheckingFileToLoad())
            })
            .then(closeDashboard)
        } else if (isInOfflineMode && helpers.file.urlPointsToPlottrCloud(fileURL)) {
          return bootFile(whenClientIsReady, fileURL, options, numOpenFiles, saveBackup, true)
            .then(() => {
              getStore().dispatch(actions.applicationState.finishCheckingFileToLoad())
            })
            .then(closeDashboard)
        } else {
          return Promise.resolve()
        }
      } else {
        getStore().dispatch(actions.applicationState.finishCheckingFileToLoad())
        return Promise.resolve()
      }
    }
  }

  const stateFetchedListener = (
    fileURL,
    options,
    numOpenFiles,
    windowOpenedWithKnownPath,
    processSwitches
  ) => {
    const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(getStore().getState())
    const lastFileIsClassicAndWeAreInPro = isInProMode && helpers.file.isDeviceFileURL(fileURL)

    // Conditionally enable testing utilities
    if (processSwitches.testUtilitiesEnabled) {
      getStore().dispatch(actions.testingAndDiagnosis.enableTestUtilities())
    }

    // There are valid possibilities for fileURL to be null.
    //
    // i.e. no file has ever been opened or the last opened file was
    // in a mode that doesn't match current. e.g. it's a pro file
    // and we're in classic mode.
    if (lastFileIsClassicAndWeAreInPro) {
      getStore().dispatch(actions.applicationState.promptToUploadFile(fileURL))
    } else if (fileURL) {
      load(fileURL, options, numOpenFiles, windowOpenedWithKnownPath)
    } else {
      getStore().dispatch(actions.client.setCurrentAppStateToDashboard())
      getStore().dispatch(actions.applicationState.noFileToShow())
      getStore().dispatch(actions.applicationState.finishCheckingFileToLoad())
    }
  }

  onStoreChanges(
    getStore,
    [
      selectors.applicationSettingsAreLoadedSelector,
      selectors.trialLoadedSelector,
      selectors.plottrLicenseLoadedSelector,
      selectors.proLicenseLoadedSelector,
      selectors.hasNoLicensesSelector,
      selectors.hasNoPurchasedLicenseSelector,
      selectors.sessionCheckedSelector,
      selectors.userNeedsToLoginSelector,
      selectors.isInOfflineModeSelector,
      selectors.needToCheckProSubscriptionSelector,
      selectors.hasActiveProLicenseSelector,
      selectors.hasActivePlottrLicenseSelector,
      selectors.isInTrialModeSelector,
      selectors.isLoggedInSelector,
      selectors.shouldBeInProSelector,
      selectors.displayChoiceViewSelector,
      selectors.displayTrialExpiredSelector,
      selectors.displayExpiredPlottrLicenseSelector,
      selectors.displayExpiredProLicenseSelector,
      selectors.displayConnectToTheInternetSelector,
      selectors.displayLoginSelector,
      selectors.displayDashboardSelector,
    ],
    (
      applicationSettingsAreLoaded,
      trialLoaded,
      plottrLicenseLoaded,
      proLicenseLoaded,
      hasNoLicenses,
      hasNoPurchasedLicense,
      sessionChecked,
      userNeedsToLogin,
      isInOfflineMode,
      needToCheckProSubscription,
      hasActiveProLicense,
      hasActivePlottrLicense,
      isInTrialMode,
      isLoggedIn,
      shouldBeInPro,
      displayChoiceView,
      displayTrialExpired,
      displayExpiredPlottrLicense,
      displayExpiredProLicense,
      displayConnectToTheInternet,
      displayLogin,
      displayDashboard
    ) => {
      // applicationSettingsAreLoaded,trialLoaded,plottrLicenseLoaded,proLicenseLoaded,hasNoLicenses,hasNoPurchasedLicense,sessionChecked,userNeedsToLogin,isInOfflineMode,needToCheckProSubscription,hasActiveProLicense,hasActivePlottrLicense,isInTrialMode,isLoggedIn,shouldBeInPro,displayChoiceView,displayTrialExpired,displayExpiredPlottrLicense,displayExpiredProLicense,displayConnectToTheInternet,displayLogin,displayDashboard
      logger.info(
        `H: ${applicationSettingsAreLoaded},${trialLoaded},${plottrLicenseLoaded},${proLicenseLoaded},${hasNoLicenses},${hasNoPurchasedLicense},${sessionChecked},${userNeedsToLogin},${isInOfflineMode},${needToCheckProSubscription},${hasActiveProLicense},${hasActivePlottrLicense},${isInTrialMode},${isLoggedIn},${shouldBeInPro},${displayChoiceView},${displayTrialExpired},${displayExpiredPlottrLicense},${displayExpiredProLicense},${displayConnectToTheInternet},${displayLogin},${displayDashboard}`
      )
    }
  )

  const stopListeningToDashboardState = onStoreChanges(
    getStore,
    [
      selectors.showDashboardOnBootSelector,
      selectors.fileNameSelector,
      selectors.fileURLSelector,
      selectors.dashboardClosedSelector,
    ],
    (showDashboard, fileName, fileURL, dashboardClosed) => {
      if (showDashboard && !dashboardClosed) {
        if (fileName && fileName.length > 0) {
          displayFileName(fileName, fileURL, false).then((fileName) => {
            setWindowTitle(fileName)
          })
        }
        getStore().dispatch(actions.client.setCurrentAppStateToDashboard())
      } else {
        if (fileName && fileName.length > 0) {
          displayFileName(fileName, fileURL, true).then((fileName) => {
            setWindowTitle(fileName)
          })
        }
      }
    }
  )

  const unsubscribeFromReloadFromFile = onReloadFromFile(
    (fileURL, options, numOpenFiles, windowOpenedWithKnownPath) => {
      const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(getStore().getState())
      const lastFileIsClassicAndWeAreInPro = isInProMode && helpers.file.isDeviceFileURL(fileURL)
      if (lastFileIsClassicAndWeAreInPro) {
        getStore().dispatch(actions.applicationState.promptToUploadFile(fileURL))
      } else {
        load(fileURL, options, numOpenFiles, windowOpenedWithKnownPath)
      }
    }
  )

  let checkingWhetherToBootAfileLatch = false
  const stopCheckingWhetherToBootAfile = onStoreChanges(
    getStore,
    [selectors.readyToCheckFileToLoadSelector, selectors.isLoggedIntoProWithActiveLicenseSelector],
    (readyToCheckFileToLoad, isInProMode) => {
      if (!checkingWhetherToBootAfileLatch && readyToCheckFileToLoad) {
        checkingWhetherToBootAfileLatch = true
        getStore().dispatch(actions.applicationState.startCheckingFileToLoad())
        pleaseFetchState(isInProMode).then(
          ([fileURL, options, numOpenFiles, windowOpenedWithKnownPath, processSwitches]) => {
            return stateFetchedListener(
              fileURL,
              options,
              numOpenFiles,
              windowOpenedWithKnownPath,
              processSwitches
            )
          }
        )
      }
    }
  )

  let listeningForFirstBootLatch = false
  // A latch so that we only show initial loading splash once.
  const stopListeningForFirstBoot = onStoreChanges(
    getStore,
    [selectors.notBootingForTheFirstTimeSelector],
    (notBootingForTheFirstTime) => {
      if (!listeningForFirstBootLatch && notBootingForTheFirstTime) {
        listeningForFirstBootLatch = true
        getStore().dispatch(actions.applicationState.finishFirstTimeBooting())
      }
    }
  )

  let listeningForSwitchToDashboardOnStartupLatch = false
  // If we opened a file then don't show the dashboard all of a sudden
  // when the user changes the always show dashboard setting.
  const stopListeningForSwitchToDashboardOnStartup = onStoreChanges(
    getStore,
    [selectors.shouldSwitchToDashboardOnStartupSelector],
    (shouldSwitchToDashboardOnStartup) => {
      if (!listeningForSwitchToDashboardOnStartupLatch && shouldSwitchToDashboardOnStartup) {
        listeningForSwitchToDashboardOnStartupLatch = true
        // Condition is that it passes by all the other root views and
        // hits `App`.
        getStore().dispatch(actions.client.setCurrentAppStateToDashboard())
        closeDashboard()
      }
    }
  )

  return () => {
    stopCheckingWhetherToBootAfile()
    stopListeningForSwitchToDashboardOnStartup()
    stopListeningForFirstBoot()
    unsubscribeFromReloadFromFile()
    stopListeningToDashboardState()
  }
}
