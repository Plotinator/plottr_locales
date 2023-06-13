import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import log from '../../../shared/logger'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import Spinner from '../components/Spinner'
import {
  AskToSaveModal,
  TemplateCreate,
  ErrorBoundary,
  ExportDialog,
  UpdateNotifier,
  NewProjectInputModal,
  ImagePicker,
} from 'connected-components'
import { store } from '../store'
import MainIntegrationContext from '../../mainIntegrationContext'
import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../mainProcessClient'

const {
  onAdvancedExportFileFromMenu,
  onReload,
  pleaseReloadMenu,
  onOpenImagePickerFromMenu,
  showMessageBox,
} = makeMainProcessClient()

const App = ({
  forceProjectDashboard,
  userId,
  isCloudFile,
  isOffline,
  isResuming,
  userNeedsToLogin,
  sessionChecked,
  clickOnDom,
  applicationIsBusyAndCannotBeQuit,
  showErrorBox,
  unsavedChanges,
  fileSaved,
}) => {
  const [showTemplateCreate, setShowTemplateCreate] = useState(false)
  const [type, setType] = useState(null)
  const [showAskToSave, setShowAskToSave] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [waitingForSaveDoneSignal, setWaitingForSaveDoneSignal] = useState(false)
  const unsubscribeFromUnloadRef = useRef()

  useEffect(() => {
    pleaseReloadMenu()
  })

  useEffect(() => {
    if (
      !isResuming &&
      !userId &&
      isCloudFile &&
      !userNeedsToLogin &&
      !isOffline &&
      sessionChecked
    ) {
      log.error('Attempting to open a cloud file locally without being logged in.')
      showErrorBox(t('Error'), t('This appears to be a Plottr Pro file.  Please log in.'))
    }
  }, [isResuming, userId, isCloudFile, userNeedsToLogin, isOffline, sessionChecked])

  useEffect(() => {
    const saveAsTemplateListener = (event) => {
      setType(event.itemType)
      setShowTemplateCreate(true)
    }
    document.addEventListener('save-as-template-start', saveAsTemplateListener)
    const unsubscribeFromAdvancedExportFromMenu = onAdvancedExportFileFromMenu(() => {
      setShowExportDialog(true)
    })
    const unsubscribeFromImagePickerMenu = onOpenImagePickerFromMenu(() => {
      setShowImagePicker(true)
    })

    return () => {
      document.removeEventListener('save-as-template-start', saveAsTemplateListener)
      unsubscribeFromAdvancedExportFromMenu()
      unsubscribeFromImagePickerMenu()
    }
  }, [])

  const closeOrRefresh = (reloading) => {
    if (reloading) {
      window.location.reload()
    } else {
      window.close()
    }
  }

  const removeReloadListeners = () => {
    if (unsubscribeFromUnloadRef.current) {
      unsubscribeFromUnloadRef.current()
      unsubscribeFromUnloadRef.current = null
    }
  }

  const askToSave = (event, reloading = false) => {
    // Socket server is busy
    if (unsavedChanges && !isCloudFile) {
      logger.info("There are unsaved changes so we're not quitting")
      event.preventDefault()
      event.returnValue = 'nope'
      setShowAskToSave(true)
    } else if (applicationIsBusyAndCannotBeQuit) {
      logger.info('The socket server is busy and we cannot quit')
      showMessageBox(t('Plottr is Busy'), t("Plottr is busy and can't quit"))
      if (event.preventDefault && typeof event.preventDefault === 'function') {
        event.preventDefault()
        event.returnValue = 'nope'
      }
      return
    } else {
      removeReloadListeners()
      if (reloading) {
        closeOrRefresh(reloading)
      }
      return
    }
  }

  useEffect(() => {
    const forceClose = () => {
      removeReloadListeners()
      window.close()
    }
    window.addEventListener('force-close', forceClose)
    return () => {
      window.removeEventListener('force-close', forceClose)
    }
  }, [])

  useEffect(() => {
    const unsubscribeFromReload = onReload(() => {
      askToSave({}, true, false)
    })
    window.addEventListener('beforeunload', askToSave)
    const unsubscribeFromUnload = () => {
      window.removeEventListener('beforeunload', askToSave)
    }
    const unsubscribeAll = () => {
      unsubscribeFromReload()
      unsubscribeFromUnload()
    }

    unsubscribeFromUnloadRef.current = unsubscribeAll
    return unsubscribeAll
  }, [applicationIsBusyAndCannotBeQuit, unsavedChanges, isCloudFile])

  useEffect(() => {
    if (!applicationIsBusyAndCannotBeQuit) {
      setWaitingForSaveDoneSignal(applicationIsBusyAndCannotBeQuit)
    }
  }, [applicationIsBusyAndCannotBeQuit, setWaitingForSaveDoneSignal])

  const saveAndClose = (saveFile, saveOfflineFile) => () => {
    const { present } = store.getState()
    return (isOffline ? saveOfflineFile(present) : saveFile(present.project.fileURL, present)).then(
      () => {
        fileSaved()
        setWaitingForSaveDoneSignal(true)
        setShowAskToSave(false)
      }
    )
  }

  const dismissAskToSave = () => {
    setWaitingForSaveDoneSignal(false)
    setShowAskToSave(false)
  }

  const renderTemplateCreate = () => {
    if (!showTemplateCreate) return null

    return <TemplateCreate type={type} close={() => setShowTemplateCreate(false)} />
  }

  const renderAskToSave = () => {
    if (!waitingForSaveDoneSignal && (!showAskToSave || isCloudFile)) return null

    return (
      <MainIntegrationContext.Consumer>
        {({ saveFile, saveOfflineFile }) => {
          return (
            <AskToSaveModal
              save={saveAndClose(saveFile, saveOfflineFile)}
              busy={waitingForSaveDoneSignal}
              dismiss={dismissAskToSave}
            />
          )
        }}
      </MainIntegrationContext.Consumer>
    )
  }

  const renderAdvanceExportModal = () => {
    if (!showExportDialog) return null
    return <ExportDialog close={() => setShowExportDialog(false)} />
  }

  const renderImagePickerModal = () => {
    if (!showImagePicker) return null
    return <ImagePicker fromMenu close={() => setShowImagePicker(false)} />
  }

  return (
    <ErrorBoundary>
      <ErrorBoundary>
        <React.StrictMode>
          <Navigation forceProjectDashboard={forceProjectDashboard} />
        </React.StrictMode>
      </ErrorBoundary>
      <main
        className="project-main tour-end"
        onClick={(event) => {
          // The other part of this click handler is in Navigation
          clickOnDom(event.clientX, event.clientY)
        }}
      >
        <React.StrictMode>
          <Body />
          <UpdateNotifier />
          <NewProjectInputModal />
        </React.StrictMode>
      </main>
      <React.StrictMode>
        <Spinner />
        {renderTemplateCreate()}
        {renderAskToSave()}
        {renderAdvanceExportModal()}
        {renderImagePickerModal()}
      </React.StrictMode>
    </ErrorBoundary>
  )
}

App.propTypes = {
  userId: PropTypes.string,
  forceProjectDashboard: PropTypes.bool,
  isCloudFile: PropTypes.bool,
  isOffline: PropTypes.bool,
  isResuming: PropTypes.bool,
  userNeedsToLogin: PropTypes.bool,
  sessionChecked: PropTypes.bool,
  clickOnDom: PropTypes.func,
  applicationIsBusyAndCannotBeQuit: PropTypes.bool,
  showErrorBox: PropTypes.func.isRequired,
  unsavedChanges: PropTypes.bool,
  fileSaved: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    userId: selectors.userIdSelector(state),
    isCloudFile: selectors.isCloudFileSelector(state),
    isOffline: selectors.isOfflineSelector(state),
    isResuming: selectors.isResumingSelector(state),
    userNeedsToLogin: selectors.userNeedsToLoginSelector(state),
    sessionChecked: selectors.sessionCheckedSelector(state),
    applicationIsBusyAndCannotBeQuit: selectors.busyWithWorkThatPreventsQuittingSelector(state),
    unsavedChanges: selectors.unsavedChangesSelector(state),
  }
}

export default connect(mapStateToProps, {
  clickOnDom: actions.domEvents.clickOnDom,
  fileSaved: actions.ui.fileSaved,
})(App)
