import { PropTypes } from 'prop-types'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { fetchFiles } from 'plottr_firebase'

const FileListListener = ({ fileList, userId, setFileList }) => {
  useEffect(() => {
    if (!fileList || fileList.length === 0 || !userId) return () => {}

    const deleteListener = document.addEventListener('delete-file', (event) => {
      fetchFiles(userId).then((files) => {
        setFileList(files.filter(({ deleted }) => !deleted))
      })
    })
    const fetchListener = document.addEventListener('fetch-file-list', (event) => {
      fetchFiles(userId).then((files) => {
        setFileList(files.filter(({ deleted }) => !deleted))
      })
    })
    return () => {
      document.removeEventListener('delete-file', deleteListener)
      document.removeEventListener('fetch-file-list', fetchListener)
    }
  }, [fileList, userId, setFileList])

  return null
}

FileListListener.propTypes = {
  fileList: PropTypes.array.isRequired,
  userId: PropTypes.string,
  setFileList: PropTypes.func.isRequired,
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
