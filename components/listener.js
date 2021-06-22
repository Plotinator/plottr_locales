import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions } from 'pltr/v2'
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

const {
  permission: { setPermission },
} = actions

export default connect(null, { setPermission })(Listener)
