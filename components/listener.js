import { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { initialFetch, listen, listenToCustomTemplates, stopListening } from '../lib/firebase'

const Listener = ({ userId, selectedFile, setPermission, patchFile, clientId, loadFile }) => {
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
    initialFetch(userId, selectedFile.id, clientId).then((file) => {
      setUnsubscribeFunctions(listen(userId, selectedFile.id, clientId))
      setPermission(selectedFile.permission)
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

  return null
}

Listener.propTypes = {
  userId: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  clientId: PropTypes.string,
  loadFile: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
  }),
  {
    setPermission: actions.permission.setPermission,
    patchFile: actions.ui.patchFile,
    loadFile: actions.ui.loadFile,
  }
)(Listener)
