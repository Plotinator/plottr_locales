import { PropTypes } from 'prop-types'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { fetchFiles } from 'wired-up-firebase'

import { logger } from '../lib/logger'

const FileListListener = ({ fileList, userId, setFileList, generalError }) => {
  useEffect(() => {
    if (!fileList || fileList.length === 0 || !userId) return () => {}

    const fetchListener = document.addEventListener('fetch-file-list', (event) => {
      fetchFiles(userId)
        .then((files) => {
          setFileList(files.filter(({ deleted }) => !deleted))
        })
        .catch((error) => {
          logger.error(`Failed to fetch file list for user with id: ${userId}`, error)
          generalError('We ran into a problem fetching your files.  Please try again.')
        })
    })
    return () => {
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
    generalError: actions.error.generalError,
  }
)(FileListListener)
