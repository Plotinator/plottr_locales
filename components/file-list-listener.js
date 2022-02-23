import { PropTypes } from 'prop-types'
import { useEffect } from 'react'
import { connect } from 'react-redux'

import { actions, selectors } from 'pltr/v2'
import { fetchFiles } from 'wired-up-firebase'

import { logger } from '../lib/logger'

const FileListListener = ({ fileList, userId, setKnownFiles, generalError }) => {
  useEffect(() => {
    if (!fileList || fileList.length === 0 || !userId) return () => {}

    const fetchListener = document.addEventListener('fetch-file-list', (event) => {
      fetchFiles(userId)
        .then((files) => {
          setKnownFiles(files.filter(({ deleted }) => !deleted))
        })
        .catch((error) => {
          logger.error(`Failed to fetch file list for user with id: ${userId}`, error)
          generalError('We ran into a problem fetching your files.  Please try again.')
        })
    })
    return () => {
      document.removeEventListener('fetch-file-list', fetchListener)
    }
  }, [fileList, userId, setKnownFiles])

  return null
}

FileListListener.propTypes = {
  fileList: PropTypes.array.isRequired,
  userId: PropTypes.string,
  setKnownFiles: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    fileList: selectors.knownFilesSelector(state.present),
    userId: selectors.userIdSelector(state.present),
  }),
  {
    setKnownFiles: actions.knownFiles.setKnownFiles,
    generalError: actions.error.generalError,
  }
)(FileListListener)
