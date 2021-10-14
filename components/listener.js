import { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { actions, selectors } from 'pltr/v2'
import { listen, stopListening } from 'plottr_firebase'
import { listenToCustomTemplates } from '../lib/templates'
import { settings } from '../lib/settings'
import { store } from '../lib/redux'
import { closeDashboard, openDashboard } from '../lib/dashboard'
import { setCurrentProject, currentProject } from '../lib/currentProject'

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
}) => {
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([])

  useEffect(() => {
    const sessionFileId = (selectedFile && selectedFile.id) || currentProject()
    if (sessionFileId && sessionFileId !== '') {
      const foundInList = fileList.find(({ id }) => id === sessionFileId)
      if (foundInList && !isEqual(foundInList, selectedFile)) {
        if (foundInList.deleted) {
          selectFile(null)
          openDashboard('files')
        } else {
          selectFile(foundInList)
          closeDashboard()
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
    setUnsubscribeFunctions(listen(store, userId, selectedFile.id, clientId, selectedFile.version))
    setPermission(selectedFile.permission)
    setFileLoaded()
    if (settings.user.beatHierarchy && !actStructureIsOn) {
      setBeatHierarchy()
    } else if (!settings.user.beatHierarchy && actStructureIsOn) {
      unsetBeatHierarchy()
    }

    return () => {
      stopListening(unsubscribeFunctions)
      setUnsubscribeFunctions([])
      setPermission('viewer')
    }
  }, [selectedFile, userId, clientId])

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
  }
)(Listener)
