import { PropTypes } from 'prop-types'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { fetchFiles } from '../lib/firebase'

const FileListListener = ({ fileList, userId, setFileList }) => {
  useEffect(() => {
    if (!fileList || fileList.length === 0) return () => {}

    const listener = document.addEventListener('delete-file', (event) => {
      fetchFiles(userId).then((files) => {
        setFileList(files)
      })
    })
    return () => {
      document.removeEventListener('delete-file', listener)
    }
  }, [fileList, userId, setFileList])

  return null
}

FileListListener.propTypes = {
  fileList: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  setUserId: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    fileList: selectors.fileListSelector(state.present),
    userId: selectors.userIdSelector(state.present),
  }),
  {
    setFileList: actions.project.setFileList,
  }
)(FileListListener)
