import { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { editFileName } from 'wired-up-firebase'

import { logger } from '../lib/logger'

const Renamer = ({ userId, generalError, startRenamingFile, finishRenamingFile }) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)

  const renameFile = (newName) => {
    if (!userId) return
    startRenamingFile()
    editFileName(userId, fileId, newName)
      .then(() => {
        finishRenamingFile()
        setFileId(null)
        setVisible(false)
      })
      .catch((error) => {
        finishRenamingFile()
        logger.error(`Failed to rename file with id ${fileId} to ${newName}`, error)
        generalError('Failed to rename file.')
      })
  }

  useEffect(() => {
    const renameListener = document.addEventListener('rename-file', (event) => {
      setVisible(true)
      setFileId(event.fileId)
    })
    return () => {
      document.removeEventListener('rename-file', renameListener)
    }
  }, [])

  const hideRenamer = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <InputModal
      title={t('Name')}
      getValue={renameFile}
      isOpen={true}
      cancel={hideRenamer}
      type="text"
    />
  )
}

Renamer.propTypes = {
  userId: PropTypes.string,
  generalError: PropTypes.func.isRequired,
  startRenamingFile: PropTypes.func.isRequired,
  finishRenamingFile: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    userId: selectors.userIdSelector(state.present),
  }),
  {
    generalError: actions.error.generalError,
    startRenamingFile: actions.applicationState.startRenamingFile,
    finishRenamingFile: actions.applicationState.finishRenamingFile,
  }
)(Renamer)
