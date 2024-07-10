import React from 'react'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'
import { InputModal } from 'plottr_components'
import { editFileName as editFileNameOnFirebase } from 'wired-up-firebase'

import logger from '../../../shared/logger'
import { getErrorReporterInstance } from '../../../shared/error-reporter-instance'

const Renamer = ({ isInProMode, showLoader, startRenamingFile, finishRenamingFile, isOffline }) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)

  const renameFile = (newName) => {
    // This component is for renaming cloud files only.
    if (!isInProMode || isOffline) {
      return
    } else {
      startRenamingFile()
      showLoader(true)

      editFileNameOnFirebase(fileId, newName)
        .then((result) => {
          finishRenamingFile()
          return result
        })
        .then(() => {
          logger.info(`Renamed file with id ${fileId} to ${newName}`)
          setFileId(null)
          setVisible(false)
          showLoader(false)
          finishRenamingFile()
        })
        .catch((error) => {
          logger.error(`Error renaming file with id ${fileId}`, error)
          getErrorReporterInstance().then((errorReporter) => {
            errorReporter.error(`Error renaming file with id ${fileId}`, error)
          })
          showLoader(false)
          finishRenamingFile()
        })
    }
  }

  useEffect(() => {
    const renameListener = document.addEventListener('rename-file', (event) => {
      setVisible(true)
      // @ts-ignore
      setFileId(event.fileId)
    })
    return () => {
      // @ts-ignore
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
  isInProMode: PropTypes.bool,
  showLoader: PropTypes.func.isRequired,
  startRenamingFile: PropTypes.func.isRequired,
  finishRenamingFile: PropTypes.func.isRequired,
  isOffline: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => ({
  isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
  isOffline: selectors.isOfflineSelector(state),
})

export default connect(mapStateToProps, {
  showLoader: actions.project.showLoader,
  startRenamingFile: actions.applicationState.startRenamingFile,
  finishRenamingFile: actions.applicationState.finishRenamingFile,
})(Renamer)
