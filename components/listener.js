import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { listen, stopListening } from '../lib/firebase'

const Listener = ({ userId, selectedFile, setPermission, patchFile }) => {
  useEffect(() => {
    if (selectedFile && selectedFile.none) {
      patchFile(true, { ...selectedFile, id: null })
      setPermission('owner')
      return () => {}
    }
    if (!userId || !selectedFile || !selectedFile.id) {
      return () => {}
    }
    const unsubscribeFunctions = listen(userId, selectedFile.id)
    setPermission(selectedFile.permission)
    return () => {
      stopListening(unsubscribeFunctions)
      setPermission('viewer')
    }
  }, [selectedFile, userId])

  return null
}

Listener.propTypes = {
  userId: PropTypes.string,
  selectedFile: PropTypes.object.isRequired,
  setPermission: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
  }),
  { setPermission: actions.permission.setPermission, patchFile: actions.ui.patchFile }
)(Listener)
