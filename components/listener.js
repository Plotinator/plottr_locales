import { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { listen, stopListening } from 'plottr_firebase'
import { listenToCustomTemplates } from '../lib/templates'
import { openFile } from '../lib/files'
import { store } from '../lib/redux'

const Listener = ({
  userId,
  selectedFile,
  setPermission,
  setFileLoaded,
  patchFile,
  clientId,
  loadFile,
  darkMode,
}) => {
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([])

  useEffect(() => {
    if (selectedFile && selectedFile.none) {
      patchFile(true, { ...selectedFile, id: null })
      setPermission('owner')
      return () => {}
    }
    if (!userId || !clientId || !selectedFile || !selectedFile.id) {
      return () => {}
    }
    openFile(userId, selectedFile.id, clientId, selectedFile.version).then((file) => {
      setUnsubscribeFunctions(
        listen(store, userId, selectedFile.id, clientId, selectedFile.version)
      )
      setPermission(selectedFile.permission)
      setFileLoaded()
    })

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
  setFileLoaded: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  loadFile: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    darkMode: selectors.isDarkModeSelector(state.present),
  }),
  {
    setPermission: actions.permission.setPermission,
    patchFile: actions.ui.patchFile,
    loadFile: actions.ui.loadFile,
    setFileLoaded: actions.project.setFileLoaded,
  }
)(Listener)
