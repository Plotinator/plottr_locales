import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { selectors, actions } from 'wired-up-pltr'

import PreventExittingWithoutSaving from './PreventExittingWithoutSaving'
import log from '../../../shared/logger'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import Spinner from '../components/Spinner'
import {
  TemplateCreate,
  ErrorBoundary,
  ExportDialog,
  UpdateNotifier,
  NewProjectInputModal,
  SearchModal,
  ImagePicker,
  ImportModal,
  UndoRedo,
} from 'connected-components'
import { makeMainProcessClient } from '../mainProcessClient'

const { onAdvancedExportFileFromMenu, pleaseReloadMenu, onOpenImagePickerFromMenu } =
  makeMainProcessClient()

const App = ({
  forceProjectDashboard,
  userId,
  isCloudFile,
  isOffline,
  isResuming,
  userNeedsToLogin,
  sessionChecked,
  isInProMode,
  clickOnDom,
  showErrorBox,
  searchDialogIsOpen,
  openSearch,
  startSearching,
  isImportModalOpen,
}) => {
  const [showTemplateCreate, setShowTemplateCreate] = useState(false)
  const [type, setType] = useState(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)

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
      sessionChecked &&
      !isInProMode
    ) {
      log.warn(
        "Window belongs to a pro file, but we're not logged in.  We could have just logged out."
      )
      showErrorBox(t('Error'), t('This appears to be a Plottr Pro file.  Please log in.'))
    }
  }, [isResuming, userId, isCloudFile, userNeedsToLogin, isOffline, sessionChecked, isInProMode])

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

  useEffect(() => {
    const searchListener = (event) => {
      if (!searchDialogIsOpen && event.key === 'f' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        event.stopPropagation()
        openSearch()
        startSearching()
      }
    }
    document.addEventListener('keydown', searchListener)
    return () => {
      document.removeEventListener('keydown', searchListener)
    }
  }, [searchDialogIsOpen, openSearch])

  const renderTemplateCreate = () => {
    if (!showTemplateCreate) return null

    return <TemplateCreate type={type} close={() => setShowTemplateCreate(false)} />
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
      <React.StrictMode>
        <Navigation forceProjectDashboard={forceProjectDashboard} />
      </React.StrictMode>
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
        <UndoRedo />
        <Spinner />
        <PreventExittingWithoutSaving />
        {renderTemplateCreate()}
        {renderAdvanceExportModal()}
        {renderImagePickerModal()}
        {searchDialogIsOpen ? <SearchModal /> : null}
        {isImportModalOpen ? <ImportModal /> : null}
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
  searchDialogIsOpen: PropTypes.bool,
  isInProMode: PropTypes.bool,
  clickOnDom: PropTypes.func,
  showErrorBox: PropTypes.func.isRequired,
  openSearch: PropTypes.func.isRequired,
  startSearching: PropTypes.func.isRequired,
  isImportModalOpen: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    userId: selectors.userIdSelector(state),
    isCloudFile: selectors.isCloudFileSelector(state),
    isOffline: selectors.isOfflineSelector(state),
    isResuming: selectors.isResumingSelector(state),
    userNeedsToLogin: selectors.userNeedsToLoginSelector(state),
    sessionChecked: selectors.sessionCheckedSelector(state),
    searchDialogIsOpen: selectors.searchDialogIsOpenSelector(state),
    isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
    isImportModalOpen: selectors.isImportModalOpenSelector(state),
  }
}

export default connect(mapStateToProps, {
  clickOnDom: actions.domEvents.clickOnDom,
  openSearch: actions.ui.openSearch,
  startSearching: actions.applicationState.startSearching,
})(App)
