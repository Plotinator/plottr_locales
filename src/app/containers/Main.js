import React, { useState, useEffect, useCallback } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { helpers } from 'pltr/v2'
import { actions, selectors } from 'wired-up-pltr'
import { ProLicenseExpired } from 'connected-components'

import { bootFile } from '../bootFile'

import MainIntegrationContext from '../../mainIntegrationContext'
import App from './App'
import Choice from './Choice'
import Login from './Login'
import Expired from './Expired'
import Dashboard from './Dashboard'
import ProOnboarding from './ProOnboarding'
import SettingsWizard from './SettingsWizard'
import UploadLastOpenedFileToPro from '../components/UploadLastOpenedFileToPro'
import ErrorLoadingFile from '../components/ErrorLoadingFile'

import { makeMainProcessClient } from '../mainProcessClient'
import { whenClientIsReady } from '../../../shared/socket-client'

const { onReloadFromFile, pleaseFetchState } = makeMainProcessClient()

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

const Main = ({
  isFirstTime,
  busyBooting,
  setOffline,
  needsToLogin,
  isInProMode,
  isInTrialModeWithExpiredTrial,
  showDashboard,
  checkingFileToLoad,
  checkedFileToLoad,
  readyToCheckFileToLoad,
  cantShowFile,
  loadingState,
  errorLoadingFile,
  startCheckingFileToLoad,
  finishCheckingFileToLoad,
  loadingProgress,
  fileToUpload,
  darkMode,
  isInOfflineMode,
  currentAppStateIsDashboard,
  fileName,
  fileURL,
  isOnboardingFromRoot,
  isOnboarding,
  setCurrentAppStateToDashboard,
  setCurrentAppStateToApplication,
  promptToUploadFile,
  enableTestUtilities,
  saveBackup,
  settings,
  setWindowTitle,
  isInSettingsWizard,
  isInSomeValidLicenseState,
  licenseExpired,
  needsToConnectToInternet,
}) => {
  // The user needs a way to dismiss the files dashboard and continue
  // to the file that's open.
  const [dashboardClosed, setDashboardClosed] = useState(false)
  const [firstTimeBooting, setFirstTimeBooting] = useState(busyBooting)
  const [openDashboardTo, setOpenDashboardTo] = useState(null)
  const [pathToProject, setPathToProject] = useState('')

  useEffect(() => {
    if (showDashboard && !dashboardClosed) {
      if (fileName && fileName.length > 0) {
        displayFileName(fileName, fileURL, false).then((fileName) => {
          setWindowTitle(fileName)
        })
      }
      setCurrentAppStateToDashboard()
    } else {
      if (fileName && fileName.length > 0) {
        displayFileName(fileName, fileURL, true).then((fileName) => {
          setWindowTitle(fileName)
        })
      }
    }
  }, [fileName, fileURL, dashboardClosed, setCurrentAppStateToDashboard, showDashboard])

  useEffect(() => {
    if (!readyToCheckFileToLoad) return () => {}

    const load = (fileURL, options, numOpenFiles, windowOpenedWithKnownPath) => {
      // We wont load a file at all on boot if this is supposed to be
      // the dashboard.
      if (!windowOpenedWithKnownPath && showDashboard && numOpenFiles <= 1) {
        finishCheckingFileToLoad()
        return
      }

      setPathToProject(fileURL)

      // To boot the file automatically: we must either be running pro
      // and it's a cloud file, we must be running classic mode and
      // it's not a cloud file, or we must be running pro with offline
      // mode enabled, in which case we use convention to determine
      // the offline file counterpart.
      if (!!isInProMode === !!helpers.file.urlPointsToPlottrCloud(fileURL)) {
        bootFile(whenClientIsReady, fileURL, options, numOpenFiles, saveBackup).then(closeDashboard)
      } else if (isInOfflineMode && helpers.file.urlPointsToPlottrCloud(fileURL)) {
        bootFile(whenClientIsReady, fileURL, options, numOpenFiles, saveBackup, true).then(
          closeDashboard
        )
      }
      // We only want to obey the setting to show the dashboard on
      // start-up for the first file opened.  All files opened after
      // that shouldn't have the dashboard opened.
      if (windowOpenedWithKnownPath || numOpenFiles > 1) {
        setDashboardClosed(true)
        setCurrentAppStateToApplication()
      }
      finishCheckingFileToLoad()
    }

    // This might look like unnecessary lambda wrapping, but I've done
    // it to make sure that we have destinct lambdas to de-register
    // later.
    const reloadListener = (fileURL, options, numOpenFiles, windowOpenedWithKnownPath) => {
      const lastFileIsClassicAndWeAreInPro = isInProMode && helpers.file.isDeviceFileURL(fileURL)
      if (lastFileIsClassicAndWeAreInPro) {
        promptToUploadFile(fileURL)
      } else {
        load(fileURL, options, numOpenFiles, windowOpenedWithKnownPath)
      }
    }
    const unsubscribeFromReloadFromFile = onReloadFromFile(reloadListener)

    if (checkedFileToLoad || checkingFileToLoad || !isInSomeValidLicenseState) {
      return () => {
        unsubscribeFromReloadFromFile()
      }
    }

    const stateFetchedListener = (
      fileURL,
      options,
      numOpenFiles,
      windowOpenedWithKnownPath,
      processSwitches
    ) => {
      const lastFileIsClassicAndWeAreInPro = isInProMode && helpers.file.isDeviceFileURL(fileURL)
      // There are valid possibilities for fileURL to be null.
      //
      // i.e. no file has ever been opened or the last opened file was
      // in a mode that doesn't match current. e.g. it's a pro file
      // and we're in classic mode.
      if (lastFileIsClassicAndWeAreInPro) {
        promptToUploadFile(fileURL)
      } else if (fileURL) {
        load(fileURL, options, numOpenFiles, windowOpenedWithKnownPath)
      } else {
        finishCheckingFileToLoad()
      }
      if (processSwitches.testUtilitiesEnabled) {
        enableTestUtilities()
      }
    }
    startCheckingFileToLoad()
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

    return () => {
      unsubscribeFromReloadFromFile()
    }
  }, [
    isInOfflineMode,
    isInProMode,
    readyToCheckFileToLoad,
    checkingFileToLoad,
    checkedFileToLoad,
    isInSomeValidLicenseState,
    promptToUploadFile,
  ])

  // A latch so that we only show initial loading splash once.
  useEffect(() => {
    if (!busyBooting && firstTimeBooting) {
      setFirstTimeBooting(false)
    }
  }, [busyBooting])

  useEffect(() => {
    setOffline(!window.navigator.onLine)
    const onlineListener = window.addEventListener('online', () => {
      setOffline(false)
    })
    const offlineListener = window.addEventListener('offline', () => {
      setOffline(true)
    })
    return () => {
      window.removeEventListener('online', onlineListener)
      window.removeEventListener('offline', offlineListener)
    }
  }, [setOffline])

  useEffect(() => {
    if (settings.user?.fonts?.global?.headingFont) {
      window.document.documentElement.style.setProperty(
        '--global-header-font',
        settings.user.fonts.global.headingFont
      )
    }
    if (settings.user?.fonts?.global?.bodyFont) {
      window.document.documentElement.style.setProperty(
        '--global-body-font',
        settings.user.fonts.global.bodyFont
      )
    }
    if (settings.user?.fonts?.timeline?.headings?.font) {
      window.document.documentElement.style.setProperty(
        '--timeline-header-font',
        settings.user.fonts.timeline.headings.font
      )
    }
    if (settings.user?.fonts?.timeline?.headings?.fontSize) {
      window.document.documentElement.style.setProperty(
        '--timeline-header-font-size',
        settings.user.fonts.timeline.headings.fontSize
      )
    }
    if (settings.user?.fonts?.timeline?.plotlines?.font) {
      window.document.documentElement.style.setProperty(
        '--plotline-font',
        settings.user.fonts.timeline.plotlines.font
      )
    }
    if (settings.user?.fonts?.timeline?.plotlines?.fontSize) {
      window.document.documentElement.style.setProperty(
        '--plotline-font-size',
        settings.user.fonts.timeline.plotlines.fontSize
      )
    }
    if (settings.user?.fonts?.timeline?.sceneCardTitles?.font) {
      window.document.documentElement.style.setProperty(
        '--scenecard-title-font',
        settings.user.fonts.timeline.sceneCardTitles.font
      )
    }
    if (settings.user?.fonts?.timeline?.sceneCardTitles?.fontSize) {
      window.document.documentElement.style.setProperty(
        '--scenecard-title-font-size',
        settings.user.fonts.timeline.sceneCardTitles.fontSize
      )
    }
    if (settings.user?.fonts?.rce?.defaultFont) {
      window.document.documentElement.style.setProperty(
        '--rce-default-font',
        settings.user.fonts.rce.defaultFont
      )
    }
    if (settings.user?.fonts?.rce?.defaultFontSize) {
      window.document.documentElement.style.setProperty(
        '--rce-default-font-size',
        settings.user.fonts.rce.defaultFontSize
      )
    }
    if (settings.user?.fonts?.rce?.defaultFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-default-font-color',
        settings.user.fonts.rce.defaultFontColor
      )
    }
    if (settings.user?.fonts?.rce?.defaultDarkModeFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-default-darkmode-font-color',
        settings.user.fonts.rce.defaultDarkModeFontColor
      )
    }
    if (settings.user?.fonts?.rce?.titleFont) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font',
        settings.user.fonts.rce.titleFont
      )
    }
    if (settings.user?.fonts?.rce?.titleFontSize) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font-size',
        settings.user.fonts.rce.titleFontSize
      )
    }
    if (settings.user?.fonts?.rce?.titleFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font-color',
        settings.user.fonts.rce.titleFontColor
      )
    }
    if (settings.user?.fonts?.rce?.titleDarkModeFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-title-darkmode-font-color',
        settings.user.fonts.rce.titleDarkModeFontColor
      )
    }
    if (settings.user?.fonts?.rce?.titleFontWeight) {
      window.document.documentElement.style.setProperty(
        '--rce-title-font-weight',
        settings.user.fonts.rce.titleFontWeight
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFont) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font',
        settings.user.fonts.rce.subtitleFont
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFontSize) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font-size',
        settings.user.fonts.rce.subtitleFontSize
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font-color',
        settings.user.fonts.rce.subtitleFontColor
      )
    }
    if (settings.user?.fonts?.rce?.subtitleDarkModeFontColor) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-darkmode-font-color',
        settings.user.fonts.rce.subtitleDarkModeFontColor
      )
    }
    if (settings.user?.fonts?.rce?.subtitleFontWeight) {
      window.document.documentElement.style.setProperty(
        '--rce-subtitle-font-weight',
        settings.user.fonts.rce.subtitleFontWeight
      )
    }
  }, [settings.user])

  useEffect(() => {
    window.document.body.className = darkMode ? 'darkmode' : ''
  }, [darkMode])

  const closeDashboard = useCallback(() => {
    setDashboardClosed(true)
    setCurrentAppStateToApplication()
  }, [])

  // If we opened a file then don't show the dashboard all of a sudden
  // when the user changes the always show dashboard setting.
  useEffect(() => {
    // Condition is that it passes by all the other root views and
    // hits `App`.
    if (
      !firstTimeBooting &&
      !needsToLogin &&
      !isFirstTime &&
      !isInTrialModeWithExpiredTrial &&
      !(cantShowFile || ((currentAppStateIsDashboard || showDashboard) && !dashboardClosed))
    ) {
      closeDashboard()
      setCurrentAppStateToDashboard()
    }
  }, [
    firstTimeBooting,
    needsToLogin,
    isFirstTime,
    isInTrialModeWithExpiredTrial,
    cantShowFile,
    showDashboard,
    dashboardClosed,
  ])

  // IMPORTANT: the order of these return statements is significant.
  // We'll exit at the earliest one that evaluates true for it's
  // guarding if.
  //
  // This matters because the further we make it down the chain, the
  // more assumptions hold true about the app.  e.g. if we make it
  // past `firstTimeBooting` then we know that settings etc. are
  // loaded and we can check things like the user's local and pro
  // licenses.

  if (isOnboardingFromRoot || (cantShowFile && isOnboarding)) {
    return <ProOnboarding />
  }

  if (needsToLogin || needsToConnectToInternet) {
    return <Login darkMode={darkMode} />
  }

  if (fileToUpload) {
    return <UploadLastOpenedFileToPro saveBackup={saveBackup} />
  }

  if (errorLoadingFile) {
    return (
      <ErrorLoadingFile
        setCurrentAppStateToDashboard={setCurrentAppStateToDashboard}
        pathToProject={pathToProject}
        setOpenDashboardTo={setOpenDashboardTo}
      />
    )
  }

  if (firstTimeBooting) {
    const body = (
      <>
        {darkMode ? (
          <img src="../icons/logo_dark_28_500.png" height="375" />
        ) : (
          <img src="../icons/logo_light_28_500.png" height="375" />
        )}
        <h3>{loadingState}</h3>
        <div className="loading-splash__progress">
          <div className="loading-splash__progress__bar" style={{ width: `${loadingProgress}%` }} />
        </div>
      </>
    )

    return (
      <div id="temporary-inner">
        <div className="loading-splash">{body}</div>
      </div>
    )
  }

  if (isFirstTime) {
    return <Choice />
  }

  if (isInTrialModeWithExpiredTrial) {
    return <Expired />
  }

  if (licenseExpired) {
    return <ProLicenseExpired />
  }

  if (isInSettingsWizard) {
    return <SettingsWizard />
  }

  if (cantShowFile || ((currentAppStateIsDashboard || showDashboard) && !dashboardClosed)) {
    return (
      <Dashboard
        closeDashboard={closeDashboard}
        cantShowFile={cantShowFile}
        openTo={openDashboardTo}
      />
    )
  }

  return (
    <MainIntegrationContext.Consumer>
      {({ showErrorBox }) => {
        return <App forceProjectDashboard={showDashboard} showErrorBox={showErrorBox} />
      }}
    </MainIntegrationContext.Consumer>
  )
}

Main.propTypes = {
  forceProjectDashboard: PropTypes.bool,
  busyBooting: PropTypes.bool,
  isFirstTime: PropTypes.bool,
  needsToLogin: PropTypes.bool,
  isInProMode: PropTypes.bool,
  isInTrialModeWithExpiredTrial: PropTypes.bool,
  showDashboard: PropTypes.bool,
  checkingFileToLoad: PropTypes.bool,
  checkedFileToLoad: PropTypes.bool,
  readyToCheckFileToLoad: PropTypes.bool,
  cantShowFile: PropTypes.bool,
  loadingState: PropTypes.string.isRequired,
  loadingProgress: PropTypes.number.isRequired,
  fileToUpload: PropTypes.string,
  errorLoadingFile: PropTypes.bool.isRequired,
  setOffline: PropTypes.func.isRequired,
  startCheckingFileToLoad: PropTypes.func.isRequired,
  finishCheckingFileToLoad: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isInOfflineMode: PropTypes.bool,
  currentAppStateIsDashboard: PropTypes.bool.isRequired,
  fileName: PropTypes.string,
  fileURL: PropTypes.string,
  isOnboardingFromRoot: PropTypes.bool,
  isOnboarding: PropTypes.bool,
  setCurrentAppStateToDashboard: PropTypes.func.isRequired,
  setCurrentAppStateToApplication: PropTypes.func.isRequired,
  promptToUploadFile: PropTypes.func.isRequired,
  enableTestUtilities: PropTypes.func.isRequired,
  saveBackup: PropTypes.func.isRequired,
  settings: PropTypes.object,
  setWindowTitle: PropTypes.func.isRequired,
  isInSettingsWizard: PropTypes.bool,
  isInSomeValidLicenseState: PropTypes.bool,
  licenseExpired: PropTypes.bool,
  needsToConnectToInternet: PropTypes.bool,
}

export default connect(
  (state) => ({
    busyBooting: selectors.applicationIsBusyButFileCouldBeUnloadedSelector(state),
    isFirstTime: selectors.isFirstTimeSelector(state),
    needsToLogin: selectors.userNeedsToLoginSelector(state),
    isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
    isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state),
    showDashboard: selectors.showDashboardOnBootSelector(state),
    checkingFileToLoad: selectors.checkingFileToLoadSelector(state),
    checkedFileToLoad: selectors.checkedFileToLoadSelector(state),
    readyToCheckFileToLoad: selectors.readyToCheckFileToLoadSelector(state),
    cantShowFile: selectors.cantShowFileSelector(state),
    loadingState: selectors.loadingStateSelector(state),
    errorLoadingFile: selectors.errorLoadingFileSelector(state) || false,
    loadingProgress: selectors.loadingProgressSelector(state),
    darkMode: selectors.isDarkModeSelector(state),
    isInOfflineMode: selectors.isInOfflineModeSelector(state),
    currentAppStateIsDashboard: selectors.currentAppStateIsDashboardSelector(state),
    fileName: selectors.fileNameSelector(state),
    fileURL: selectors.fileURLSelector(state),
    isOnboardingFromRoot: selectors.isOnboardingToProFromRootSelector(state),
    isOnboarding: selectors.isOnboardingToProSelector(state),
    fileToUpload: selectors.filePathToUploadSelector(state),
    settings: selectors.appSettingsSelector(state),
    isInSettingsWizard: selectors.isInSettingsWizardSelector(state),
    isInSomeValidLicenseState: selectors.isInSomeValidLicenseStateSelector(state),
    licenseExpired: selectors.licenseExpiredSelector(state),
    needsToConnectToInternet: selectors.needsToConnectToInternetSelector(state),
  }),
  {
    setOffline: actions.project.setOffline,
    startCheckingFileToLoad: actions.applicationState.startCheckingFileToLoad,
    finishCheckingFileToLoad: actions.applicationState.finishCheckingFileToLoad,
    setCurrentAppStateToDashboard: actions.client.setCurrentAppStateToDashboard,
    setCurrentAppStateToApplication: actions.client.setCurrentAppStateToApplication,
    promptToUploadFile: actions.applicationState.promptToUploadFile,
    enableTestUtilities: actions.testingAndDiagnosis.enableTestUtilities,
  }
)(Main)
