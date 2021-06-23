import { PropTypes } from 'prop-types'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions } from 'pltr/v2'
import { fetchFiles, onSessionChange } from '../lib/firebase'

const SessionObserver = ({ userId, setUserId, setFileList }) => {
  useEffect(() => {
    onSessionChange((user) => {
      if (!user) {
        window.location.href = '/login'
      } else {
        setUserId(user.uid)
        fetchFiles(user.uid).then((files) => {
          setFileList(files)
        })
      }
    })
  }, [])

  return null
}

SessionObserver.propTypes = {
  userId: PropTypes.string,
  setUserId: PropTypes.func.isRequired,
}

export default connect(null, { setFileList: actions.project.setFileList })(SessionObserver)
