import { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { listen } from '../lib/firebase'

const Listener = ({ userId, selectedFile, setPermission }) => {
  useEffect(() => {
    if (!userId || !selectedFile || !selectedFile.id || selectedFile.none) return
    // TODO: when the file changes, stop listening
    listen(userId, selectedFile.id)
    setPermission(selectedFile.permission)
  }, [selectedFile, userId])

  return null
}

Listener.propTypes = {
  userId: PropTypes.string,
  selectedFile: PropTypes.func.isRequired,
  setPermission: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    selectedFile: selectors.selectedFileSelector(state.present),
  }),
  { setPermission: actions.permission.setPermission }
)(Listener)
