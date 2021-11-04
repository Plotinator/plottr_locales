import { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { actions, selectors } from 'pltr/v2'
import { listen, stopListening } from 'wired-up-firebase'
import { listenToCustomTemplates } from '../lib/templates'
import { settings } from '../lib/settings'
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

const Listener = ({
  userId,
  selectedFile,
  selectFile,
  fileList,
  setPermission,
  setFileLoaded,
  patchFile,
  clientId,
  loadFile,
  darkMode,
  actStructureIsOn,
  setBeatHierarchy,
  unsetBeatHierarchy,
  generalError,
  showLoader,
}) => {
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([])

  useEffect(() => {
    const sessionFileId = (selectedFile && selectedFile.id) || currentProject()
    if (
      sessionFileId &&
      sessionFileId !== '' &&
      (!selectedFile || selectedFile.id !== sessionFileId)
    ) {
      const foundInList = fileList.find(({ id }) => id === sessionFileId)
      showLoader(true)
      if (foundInList && !isEqual(withoutTimestamp(foundInList), withoutTimestamp(selectedFile))) {
        if (foundInList.deleted) {
          showLoader(false)
          selectFile(null)
          openDashboard('files')
        } else {
          logger.info(`Opening file after refresh: ${foundInList.id}`)
          showLoader(true)
          openFile(userId, foundInList.id, clientId, foundInList.version, foundInList.permission)
            .then(() => {
              logger.info(`Loaded file after refresh: ${foundInList.id}`)
              showLoader(false)
              selectFile(foundInList)
              closeDashboard()
            })
            .catch((error) => {
              logger.error(`Error loading file with id: ${foundInList.id}`)
              showLoader(false)
              generalError(error)
            })
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
  }, [selectedFile, fileList])

  useEffect(() => {
    if (selectedFile && selectedFile.none) {
      patchFile(true, { ...selectedFile, id: null })
      setPermission('owner')
      return () => {}
    }
    if (!userId || !clientId || !selectedFile || !selectedFile.id) {
      return () => {}
    }
    setUnsubscribeFunctions(
      listen(store, userId, selectedFile.id, clientId, selectedFile.version, (error) => {
        logger.error('Error listening to file changes.', error)
        generalError('There seems to be a problem with your network.')
      })
    )
    setPermission(selectedFile.permission)
    setFileLoaded()

    return () => {
      stopListening(unsubscribeFunctions)
      setUnsubscribeFunctions([])
      setPermission('viewer')
    }
  }, [selectedFile, userId, clientId])

  useEffect(() => {
    if (settings.user.beatHierarchy && !actStructureIsOn) {
      setBeatHierarchy()
    } else if (!settings.user.beatHierarchy && actStructureIsOn) {
      unsetBeatHierarchy()
    }
  }, [actStructureIsOn, setBeatHierarchy, unsetBeatHierarchy])

  useEffect(() => {
    if (userId) {
      const unsubscribe = listenToCustomTemplates(userId)
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
  fileList: PropTypes.array.isRequired,
  selectFile: PropTypes.func.isRequired,
  setFileLoaded: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  loadFile: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  actStructureIsOn: PropTypes.bool,
  setBeatHierarchy: PropTypes.func.isRequired,
  unsetBeatHierarchy: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
    fileList: selectors.fileListSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
    actStructureIsOn: selectors.beatHierarchyIsOn(state.present),
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
  }
)(Listener)
