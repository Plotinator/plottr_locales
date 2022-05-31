import React, { useState, useEffect, useCallback } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer, shell } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import path from 'path'

import { actions, selectors } from 'pltr/v2'

import { bootFile } from '../bootFile'
import { isOfflineFile } from '../../common/utils/files'

import App from './App'
import Choice from './Choice'
import Login from './Login'
import Expired from './Expired'
import Dashboard from './Dashboard'
import ProOnboarding from './ProOnboarding'
import { t } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { IoIosAlert } from 'react-icons/io'

const win = getCurrentWindow()

const isCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

function displayFileName(filePath, isCloudFile, displayFilePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = displayFilePath ? ` - ${path.basename(filePath)}` : ''
  const plottr = isCloudFile ? 'Plottr Pro' : 'Plottr'
  return `${plottr}${baseFileName}${devMessage}`
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
  selectedFileIsCloudFile,
  startCheckingFileToLoad,
  finishCheckingFileToLoad,
  loadingProgress,
  darkMode,
  isInOfflineMode,
  currentAppStateIsDashboard,
  fileName,
  isOnboarding,
  setCurrentAppStateToDashboard,
  setCurrentAppStateToApplication,
}) => {
  // The user needs a way to dismiss the files dashboard and continue
  // to the file that's open.
  const [dashboardClosed, setDashboardClosed] = useState(false)
  const [firstTimeBooting, setFirstTimeBooting] = useState(busyBooting)
  const [openDashboardTo, setOpenDashboardTo] = useState(null)

  useEffect(() => {
    if (showDashboard && !dashboardClosed) {
      if (fileName && fileName.length > 0) {
        win.setTitle(displayFileName(fileName, isInProMode, false))
      }
      setCurrentAppStateToDashboard()
    } else {
      if (fileName && fileName.length > 0) {
        win.setTitle(displayFileName(fileName, isInProMode, true))
      }
    }
  }, [fileName, dashboardClosed, setCurrentAppStateToDashboard, showDashboard])

  useEffect(() => {
    if (!readyToCheckFileToLoad) return () => {}

    const load = (event, filePath, options, numOpenFiles, windowOpenedWithKnownPath) => {
      // We wont load a file at all on boot if this is supposed to be
      // the dashboard.
      if (!windowOpenedWithKnownPath && showDashboard && numOpenFiles <= 1) {
        finishCheckingFileToLoad()
        return
      }

      // To boot the file automatically: we must either be running pro
      // and it's a cloud file, or we must be running classic mode and
      // it's not a cloud file.
      if (
        !!isInProMode === !!isCloudFile(filePath) ||
        (isInOfflineMode && isOfflineFile(filePath))
      ) {
        bootFile(filePath, options, numOpenFiles)
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
    const reloadListener = (event, filePath, options, numOpenFiles, windowOpenedWithKnownPath) =>
      load(event, filePath, options, numOpenFiles, windowOpenedWithKnownPath)
    ipcRenderer.on('reload-from-file', reloadListener)

    if (checkedFileToLoad || checkingFileToLoad || needsToLogin) {
      return () => {
        ipcRenderer.removeListener('reload-from-file', reloadListener)
      }
    }

    startCheckingFileToLoad()
    ipcRenderer.send('pls-fetch-state', win.id, isInProMode)
    const stateFetchedListener = (
      event,
      filePath,
      options,
      numOpenFiles,
      windowOpenedWithKnownPath
    ) => {
      // There are valid possibilities for filePath to be null.
      //
      // i.e. no file has ever been opened or the last opened file was
      // in a mode that doesn't match current. e.g. it's a pro file
      // and we're in classic mode.
      if (filePath) {
        load(event, filePath, options, numOpenFiles, windowOpenedWithKnownPath)
      } else {
        finishCheckingFileToLoad()
      }
      ipcRenderer.removeListener('state-fetched', stateFetchedListener)
    }
    ipcRenderer.on('state-fetched', stateFetchedListener)

    return () => {
      ipcRenderer.removeListener('reload-from-file', reloadListener)
    }
  }, [isInOfflineMode, readyToCheckFileToLoad, checkingFileToLoad, checkedFileToLoad, needsToLogin])

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

  const goToSupport = () => {
    shell.openExternal('https://plottr.com/support/')
  }

  const viewBackups = () => {
    setFirstTimeBooting(false)
    setOpenDashboardTo('backups')
    setCurrentAppStateToDashboard()
  }

  // IMPORTANT: the order of these return statements is significant.
  // We'll exit at the earliest one that evaluates true for it's
  // guarding if.
  //
  // This matters because the further we make it down the chain, the
  // more assumptions hold true about the app.  e.g. if we make it
  // past `firstTimeBooting` then we know that settings etc. are
  // loaded and we can check things like the user's local and pro
  // licenses.

  if (isOnboarding) {
    return <ProOnboarding />
  }

  if (needsToLogin) {
    return <Login />
  }

  if (firstTimeBooting) {
    // TODO: @cameron, @jeana, this is where we can put a more
    // interesting loading component for users and let them know what
    // we're loading based on the `applicationState` key in Redux ^_^

    const errorMessage = isInProMode
      ? t(
          'Oops! Plottr ran into an issue opening your project. Please check your backups or contact support about this project and we will get it running for you quickly.'
        )
      : t(
          'Oops! Plottr ran into an issue opening your project. Please check your backups or contact support with this file and we will get it running for you quickly.'
        )

    const body = errorLoadingFile ? (
      <>
        <div className="error-boundary">
          <div className="text-center">
            <IoIosAlert />
            <h1>{t('Something went wrong,')}</h1>
            <h2>{t("but don't worry!")}</h2>
          </div>
          <div className="error-boundary__view-error well">
            <h3 className="error-boundary-title">{errorMessage}</h3>
          </div>
          <div className="error-boundary__options">
            <Button onClick={goToSupport}>{t('Contact Support')}</Button>
            <Button onClick={viewBackups}>{t('View Backups')}</Button>
          </div>
        </div>
      </>
    ) : (
      <>
        <img src="../icons/logo_28_500.png" height="500" />
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

  if (cantShowFile || ((currentAppStateIsDashboard || showDashboard) && !dashboardClosed)) {
    return (
      <Dashboard
        closeDashboard={closeDashboard}
        cantShowFile={cantShowFile}
        openTo={openDashboardTo}
      />
    )
  }

  return <App forceProjectDashboard={showDashboard} />
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
  selectedFileIsCloudFile: PropTypes.bool,
  loadingState: PropTypes.string.isRequired,
  loadingProgress: PropTypes.number.isRequired,
  errorLoadingFile: PropTypes.bool.isRequired,
  setOffline: PropTypes.func.isRequired,
  startCheckingFileToLoad: PropTypes.func.isRequired,
  finishCheckingFileToLoad: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isInOfflineMode: PropTypes.bool,
  currentAppStateIsDashboard: PropTypes.bool.isRequired,
  fileName: PropTypes.string,
  isOnboarding: PropTypes.bool,
  setCurrentAppStateToDashboard: PropTypes.func.isRequired,
  setCurrentAppStateToApplication: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    busyBooting: selectors.applicationIsBusyButFileCouldBeUnloadedSelector(state.present),
    isFirstTime: selectors.isFirstTimeSelector(state.present),
    needsToLogin: selectors.userNeedsToLoginSelector(state.present),
    isInProMode: selectors.hasProSelector(state.present),
    isInTrialModeWithExpiredTrial: selectors.isInTrialModeWithExpiredTrialSelector(state.present),
    showDashboard: selectors.showDashboardOnBootSelector(state.present),
    checkingFileToLoad: selectors.checkingFileToLoadSelector(state.present),
    checkedFileToLoad: selectors.checkedFileToLoadSelector(state.present),
    readyToCheckFileToLoad: selectors.isInSomeValidLicenseStateSelector(state.present),
    cantShowFile: selectors.cantShowFileSelector(state.present),
    selectedFileIsCloudFile: selectors.isCloudFileSelector(state.present),
    loadingState: selectors.loadingStateSelector(state.present),
    errorLoadingFile: selectors.errorLoadingFileSelector(state.present) || false,
    loadingProgress: selectors.loadingProgressSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
    isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
    currentAppStateIsDashboard: selectors.currentAppStateIsDashboardSelector(state.present),
    fileName: selectors.fileNameSelector(state.present),
    isOnboarding: selectors.isOnboardingToProFromRootSelector(state.present),
  }),
  {
    setOffline: actions.project.setOffline,
    startCheckingFileToLoad: actions.applicationState.startCheckingFileToLoad,
    finishCheckingFileToLoad: actions.applicationState.finishCheckingFileToLoad,
    setCurrentAppStateToDashboard: actions.client.setCurrentAppStateToDashboard,
    setCurrentAppStateToApplication: actions.client.setCurrentAppStateToApplication,
  }
)(Main)
