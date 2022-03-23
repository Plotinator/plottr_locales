import { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { actions, selectors } from 'pltr/v2'
import { listen, listenToCustomTemplates } from 'wired-up-firebase'
import { store } from '../lib/redux'
import { closeDashboard, openDashboard } from '../lib/dashboard'
import { setCurrentProject, currentProject } from '../lib/currentProject'
import initMixpanel from '../lib/mixpanel'
import { logger } from '../lib/logger'
import { openFile } from '../lib/files'

const withoutTimestamp = (fileRecord) => {
  return {
    ...fileRecord,
    lastOpened: undefined,
    timeStamp: undefined,
  }
}

const nop = () => {}

const Listener = ({
  userId,
  selectedFile,
  selectFile,
  knownFiles,
  setPermission,
  setFileLoaded,
  patchFile,
  clientId,
  loadFile,
  darkMode,
  setBeatHierarchy,
  unsetBeatHierarchy,
  generalError,
  showLoader,
  setCustomTemplates,
  startCheckingFileToLoad,
  finishCheckingFileToLoad,
  checkedFileToLoad,
  startLoadingFile,
  finishLoadingFile,
  loadingFile,
  settings,
}) => {
  useEffect(() => {
    if (!checkedFileToLoad) startCheckingFileToLoad()
    const sessionFileId = (selectedFile && selectedFile.id) || currentProject()
    if (!checkedFileToLoad) finishCheckingFileToLoad()
    if (!loadingFile && sessionFileId && sessionFileId !== '') {
      const isLoading = !selectedFile || selectedFile.id !== sessionFileId
      const foundInList = knownFiles.find(({ id }) => id === sessionFileId)
      if (foundInList && !isEqual(withoutTimestamp(foundInList), withoutTimestamp(selectedFile))) {
        if (isLoading) {
          startLoadingFile()
          showLoader(true)
        }
        if (foundInList.deleted) {
          if (isLoading) {
            showLoader(false)
            finishLoadingFile()
          }
          selectFile(null)
          openDashboard('files')
        } else {
          if (isLoading) {
            showLoader(true)
            logger.info(`Opening file after refresh: ${foundInList.id}`)
            openFile(userId, foundInList.id, clientId, foundInList.version, foundInList.permission)
              .then(() => {
                if (isLoading) {
                  showLoader(false)
                  finishLoadingFile()
                  logger.info(`Loaded file after refresh: ${foundInList.id}`)
                }
                selectFile(foundInList)
                closeDashboard()
              })
              .catch((error) => {
                logger.error(`Error loading file with id: ${foundInList.id}`)
                if (isLoading) {
                  showLoader(false)
                  finishLoadingFile()
                }
                generalError(error)
              })
          } else {
            selectFile(foundInList)
          }
        }
      } else if (!foundInList) {
        selectFile(null)
        openDashboard('files')
      }
      const currentFile = foundInList || selectedFile
      if (currentFile) {
        setCurrentProject(currentFile?.id)
      }
    }
  }, [selectedFile, knownFiles])

  useEffect(() => {
    if (selectedFile && selectedFile.none) {
      patchFile(true, { ...selectedFile, id: null })
      setPermission('owner')
      return () => {}
    }
    if (!userId || !clientId || !selectedFile || !selectedFile.id) {
      return () => {}
    }
    const unsubscribe = listen(
      store,
      userId,
      selectedFile.id,
      clientId,
      selectedFile.version,
      (error) => {
        logger.error('Error listening to file changes.', error)
        generalError('There seems to be a problem with your network.')
      }
    )
    setPermission(selectedFile.permission)
    setFileLoaded()

    return () => {
      if (unsubscribe) unsubscribe()
      setPermission('viewer')
    }
  }, [selectedFile, userId, clientId])

  useEffect(() => {
    if (settings.user.beatHierarchy) {
      setBeatHierarchy()
    } else if (!settings.user.beatHierarchy) {
      unsetBeatHierarchy()
    }
  }, [setBeatHierarchy, unsetBeatHierarchy])

  useEffect(() => {
    if (userId) {
      const unsubscribe = listenToCustomTemplates(userId, (templates) => {
        setCustomTemplates(templates)
      })
      return () => {
        unsubscribe()
      }
    }
    return () => {}
  }, [userId])

  useEffect(() => {
    if (userId) {
      initMixpanel(userId)
    }
  }, [userId])

  useEffect(() => {
    const bodyElement = document.querySelector('body')
    if (bodyElement) {
      if (darkMode !== bodyElement.classList.contains('darkmode')) {
        bodyElement.classList.toggle('darkmode')
        return
      }
    }
  }, [darkMode])

  return null
}

Listener.propTypes = {
  userId: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  knownFiles: PropTypes.array.isRequired,
  selectFile: PropTypes.func.isRequired,
  setFileLoaded: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  loadFile: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  checkedFileToLoad: PropTypes.bool,
  loadingFile: PropTypes.bool,
  settings: PropTypes.object.isRequired,
  setBeatHierarchy: PropTypes.func.isRequired,
  unsetBeatHierarchy: PropTypes.func.isRequired,
  setCustomTemplates: PropTypes.func.isrequired,
  startLoadingFile: PropTypes.func.isrequired,
  finishLoadingFile: PropTypes.func.isrequired,
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
    knownFiles: selectors.knownFilesSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
    checkedFileToLoad: selectors.checkedFileToLoadSelector(state.present),
    loadingFile: selectors.loadingFileSelector(state.present),
    settings: selectors.appSettingsSelector(state.present),
  }),
  {
    setPermission: actions.permission.setPermission,
    patchFile: actions.ui.patchFile,
    loadFile: actions.ui.loadFile,
    setFileLoaded: actions.project.setFileLoaded,
    setBeatHierarchy: actions.featureFlags.setBeatHierarchy,
    unsetBeatHierarchy: actions.featureFlags.unsetBeatHierarchy,
    selectFile: actions.project.selectFile,
    generalError: actions.error.generalError,
    showLoader: actions.project.showLoader,
    setCustomTemplates: actions.templates.setCustomTemplates,
    startCheckingFileToLoad: actions.applicationState.startCheckingFileToLoad,
    finishCheckingFileToLoad: actions.applicationState.finishCheckingFileToLoad,
    finishLoadingFile: actions.applicationState.finishLoadingFile,
    startLoadingFile: actions.applicationState.startLoadingFile,
  }
)(Listener)
