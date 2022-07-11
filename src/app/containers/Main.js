import React, { useState, useEffect, useCallback } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { ipcRenderer, shell } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import path from 'path'
import { IoIosAlert } from 'react-icons/io'

import { t } from 'plottr_locales'
import { actions, selectors } from 'pltr/v2'
import { Button } from 'plottr_components'

import { bootFile } from '../bootFile'
import { isOfflineFile } from '../../common/utils/files'

import MainIntegrationContext from '../../mainIntegrationContext'
import App from './App'
import Choice from './Choice'
import Login from './Login'
import Expired from './Expired'
import Dashboard from './Dashboard'
import ProOnboarding from './ProOnboarding'
import UploadOfflineFile from '../components/UploadOfflineFile'
import { uploadProject } from '../../common/utils/upload_project'

const win = getCurrentWindow()

const isCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

function displayFileName(filePath, isCloudFile, displayFilePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = displayFilePath ? ` - ${decodeURI(path.basename(filePath))}` : ''
  const plottr = isCloudFile ? 'Plottr Pro' : 'Plottr'
  return `${plottr}${baseFileName}${devMessage}`
}

const LoadingSplash = ({ loadingState, loadingProgress }) => {
  return (
    <div id="temporary-inner">
      <div className="loading-splash">
        <img src="../icons/logo_28_500.png" height="500" />
        {loadingState ? <h3>{loadingState}</h3> : null}
        {loadingProgress ? (
          <div className="loading-splash__progress">
            <div
              className="loading-splash__progress__bar"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
LoadingSplash.propTypes = {
  loadingState: PropTypes.string,
  loadingProgress: PropTypes.number,
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
  fileToUpload,
  uploadingFileToCloud,
  emailAddress,
  userId,
  darkMode,
  isInOfflineMode,
  currentAppStateIsDashboard,
  fileName,
  isOnboardingFromRoot,
  isOnboarding,
  setCurrentAppStateToDashboard,
  setCurrentAppStateToApplication,
  promptToUploadFile,
  dismissPromptToUploadFile,
  startUploadingFileToCloud,
  finishUploadingFileToCloud,
  enableTestUtilities,
  saveBackup,
  settings,
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

      setPathToProject(filePath)

      // To boot the file automatically: we must either be running pro
      // and it's a cloud file, or we must be running classic mode and
      // it's not a cloud file.
      if (
        !!isInProMode === !!isCloudFile(filePath) ||
        (isInOfflineMode && isOfflineFile(filePath))
      ) {
        bootFile(filePath, options, numOpenFiles, saveBackup)
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
    const reloadListener = (event, filePath, options, numOpenFiles, windowOpenedWithKnownPath) => {
      const lastFileIsClassicAndWeAreInPro =
        isInProMode && filePath && !filePath.startsWith('plottr://') && !isOfflineFile(filePath)
      if (lastFileIsClassicAndWeAreInPro) {
        promptToUploadFile(filePath)
      } else {
        load(event, filePath, options, numOpenFiles, windowOpenedWithKnownPath)
      }
    }
    ipcRenderer.on('reload-from-file', reloadListener)

    if (checkedFileToLoad || checkingFileToLoad || needsToLogin) {
      return () => {
        ipcRenderer.removeListener('reload-from-file', reloadListener)
      }
    }

    const stateFetchedListener = (
      event,
      filePath,
      options,
      numOpenFiles,
      windowOpenedWithKnownPath,
      processSwitches
    ) => {
      const lastFileIsClassicAndWeAreInPro =
        isInProMode && filePath && !filePath.startsWith('plottr://') && !isOfflineFile(filePath)
      // There are valid possibilities for filePath to be null.
      //
      // i.e. no file has ever been opened or the last opened file was
      // in a mode that doesn't match current. e.g. it's a pro file
      // and we're in classic mode.
      if (lastFileIsClassicAndWeAreInPro) {
        promptToUploadFile(filePath)
      } else if (filePath) {
        load(event, filePath, options, numOpenFiles, windowOpenedWithKnownPath)
      } else {
        finishCheckingFileToLoad()
      }
      if (processSwitches.testUtilitiesEnabled) {
        enableTestUtilities()
      }
      ipcRenderer.removeListener('state-fetched', stateFetchedListener)
    }
    ipcRenderer.on('state-fetched', stateFetchedListener)
    ipcRenderer.send('pls-fetch-state', win.id, isInProMode)
    startCheckingFileToLoad()

    return () => {
      ipcRenderer.removeListener('reload-from-file', reloadListener)
    }
  }, [
    isInOfflineMode,
    readyToCheckFileToLoad,
    checkingFileToLoad,
    checkedFileToLoad,
    needsToLogin,
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
    if (settings.user.font) {
      window.document.documentElement.style.setProperty('--default-rce-font', settings.user.font)
    }
    if (settings.user.fontSize) {
      window.document.documentElement.style.setProperty(
        '--default-rce-font-size',
        String(settings.user.fontSize) + 'px'
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

  const goToSupport = () => {
    shell.openExternal('https://plottr.com/support/')
  }

  const viewBackups = () => {
    setFirstTimeBooting(false)
    setOpenDashboardTo('backups')
    setCurrentAppStateToDashboard()
  }

  const showFile = () => {
    shell.showItemInFolder(pathToProject)
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

  if (isOnboardingFromRoot || (cantShowFile && isOnboarding)) {
    return <ProOnboarding />
  }

  if (needsToLogin) {
    return <Login />
  }

  if (fileToUpload) {
    return (
      <MainIntegrationContext.Consumer>
        {({ readFile }) => {
          return (
            <>
              <LoadingSplash />
              <UploadOfflineFile
                filePath={fileToUpload}
                onUploadFile={() => {
                  readFile(fileToUpload).then((data) => {
                    startUploadingFileToCloud()
                    uploadProject(data, emailAddress, userId).then((response) => {
                      const { fileId } = response.data || {}
                      if (!fileId) {
                        // FIXME: Use the new error loading file component
                        // here when its merged.
                        return
                      }
                      finishUploadingFileToCloud()
                      dismissPromptToUploadFile()
                      // Lie about the number of open files to avoid opening
                      // the dashboard when we double click a file.
                      //
                      // FIXME: where should the options come from?
                      const newFilePath = `plottr://${fileId}`
                      bootFile(newFilePath, {}, 2, saveBackup)
                      ipcRenderer.send('update-last-opened-file', newFilePath)
                    })
                  })
                }}
                onCancel={dismissPromptToUploadFile}
                busy={uploadingFileToCloud}
              />
            </>
          )
        }}
      </MainIntegrationContext.Consumer>
    )
  }

  if (firstTimeBooting) {
    // TODO: @cameron, @jeana, this is where we can put a more
    // interesting loading component for users and let them know what
    // we're loading based on the `applicationState` key in Redux ^_^

    const errorMessage = isInProMode
      ? t(
          'Plottr ran into an issue opening your project. Please check your backups or contact support about this project and we will get it running for you quickly.'
        )
      : t(
          'Plottr ran into an issue opening your project. Please check your backups or contact support with this file and we will get it running for you quickly.'
        )

    const body = errorLoadingFile ? (
      <>
        <div className="error-boundary">
          <div className="text-center">
            <IoIosAlert />
            <h1>{t('Something went wrong,')}</h1>
            <h2>{t("but don't worry!")}</h2>
          </div>
          <div className="error-boundary__view-error well text-center">
            <h5 className="error-boundary-title" style={{ lineHeight: 1.75 }}>
              {errorMessage}
            </h5>
          </div>
          <div className="error-boundary__options" style={{ width: '50%' }}>
            <Button bsSize="lg" onClick={goToSupport}>
              {t('Contact Support')}
            </Button>
            {isInProMode ? null : (
              <Button bsSize="lg" onClick={showFile}>
                {t('Show File')}
              </Button>
            )}
            <Button bsSize="lg" onClick={viewBackups}>
              {t('View Backups')}
            </Button>
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
  fileToUpload: PropTypes.string,
  uploadingFileToCloud: PropTypes.bool,
  emailAddress: PropTypes.string,
  userId: PropTypes.string,
  errorLoadingFile: PropTypes.bool.isRequired,
  setOffline: PropTypes.func.isRequired,
  startCheckingFileToLoad: PropTypes.func.isRequired,
  finishCheckingFileToLoad: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  isInOfflineMode: PropTypes.bool,
  currentAppStateIsDashboard: PropTypes.bool.isRequired,
  fileName: PropTypes.string,
  isOnboardingFromRoot: PropTypes.bool,
  isOnboarding: PropTypes.bool,
  setCurrentAppStateToDashboard: PropTypes.func.isRequired,
  setCurrentAppStateToApplication: PropTypes.func.isRequired,
  promptToUploadFile: PropTypes.func.isRequired,
  dismissPromptToUploadFile: PropTypes.func.isRequired,
  startUploadingFileToCloud: PropTypes.func.isRequired,
  finishUploadingFileToCloud: PropTypes.func.isRequired,
  enableTestUtilities: PropTypes.func.isRequired,
  saveBackup: PropTypes.func.isRequired,
  settings: PropTypes.object,
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
    readyToCheckFileToLoad: selectors.readyToCheckFileToLoadSelector(state.present),
    cantShowFile: selectors.cantShowFileSelector(state.present),
    selectedFileIsCloudFile: selectors.isCloudFileSelector(state.present),
    loadingState: selectors.loadingStateSelector(state.present),
    errorLoadingFile: selectors.errorLoadingFileSelector(state.present) || false,
    loadingProgress: selectors.loadingProgressSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
    isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
    currentAppStateIsDashboard: selectors.currentAppStateIsDashboardSelector(state.present),
    fileName: selectors.fileNameSelector(state.present),
    isOnboardingFromRoot: selectors.isOnboardingToProFromRootSelector(state.present),
    isOnboarding: selectors.isOnboardingToProSelector(state.present),
    fileToUpload: selectors.filePathToUploadSelector(state.present),
    uploadingFileToCloud: selectors.uploadingFileToCloudSelector(state.present),
    emailAddress: selectors.emailAddressSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    settings: selectors.appSettingsSelector(state.present),
  }),
  {
    setOffline: actions.project.setOffline,
    startCheckingFileToLoad: actions.applicationState.startCheckingFileToLoad,
    finishCheckingFileToLoad: actions.applicationState.finishCheckingFileToLoad,
    setCurrentAppStateToDashboard: actions.client.setCurrentAppStateToDashboard,
    setCurrentAppStateToApplication: actions.client.setCurrentAppStateToApplication,
    promptToUploadFile: actions.applicationState.promptToUploadFile,
    dismissPromptToUploadFile: actions.applicationState.dismissPromptToUploadFile,
    startUploadingFileToCloud: actions.applicationState.startUploadingFileToCloud,
    finishUploadingFileToCloud: actions.applicationState.finishUploadingFileToCloud,
    enableTestUtilities: actions.testingAndDiagnosis.enableTestUtilities,
  }
)(Main)
