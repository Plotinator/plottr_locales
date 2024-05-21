import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { helpers } from 'pltr'
import { selectors, actions } from 'wired-up-pltr'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { initialFetch } from 'wired-up-firebase'

import { uploadToFirebase } from '../../upload-to-firebase'
import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../mainProcessClient'
import { getErrorReporterInstance } from '../../../shared/error-reporter-instance'

const { openKnownFile, pleaseOpenWindow, onSaveAsOnPro, getVersion } = makeMainProcessClient()

export const openFile = (fileURL, unknown) => {
  return openKnownFile(fileURL, unknown)
}

const SaveAs = ({
  isInProMode,
  emailAddress,
  clientId,
  userId,
  fileList,
  isOfflineMode,
  startSavingFileAs,
  finishSavingFileAs,
}) => {
  const [visible, setVisible] = useState(false)
  const [fileId, setFileId] = useState(null)
  const [suggestedName, setSuggestedName] = useState('')
  const saveFileAs = useRef(false)

  const renameFile = (newName) => {
    // This component is for renaming cloud files only.
    if (!isInProMode || !userId || !fileId || !emailAddress || !newName) {
      return
    } else {
      startSavingFileAs()
      getVersion()
        .then((version) => {
          return initialFetch(userId, fileId, clientId, version).then((fileState) => {
            return uploadToFirebase(emailAddress, userId, fileState, newName)
              .then((response) => {
                const fileId = response.data.fileId
                if (!fileId) {
                  const message = 'Uploaded file for saveAs but we did not receive a fileId back'
                  logger.error(message)
                  getErrorReporterInstance().then((errorReporter) => {
                    errorReporter.error(message, new Error('Failed to upload file'))
                  })
                  return Promise.reject(new Error(message))
                }
                return fileId
              })
              .then((fileId) => {
                logger.info(`Saved file with id ${fileId} as ${newName}`)
                setFileId(null)
                setVisible(false)
                setSuggestedName('')
                finishSavingFileAs()
                saveFileAs.current = false
                return fileId
              })
              .then((fileId) => {
                pleaseOpenWindow(helpers.file.fileIdToPlottrCloudFileURL(fileId), true).catch(
                  (error) => {
                    logger.error(`Error opening the ${fileId} as ${newName}`, error)
                    getErrorReporterInstance().then((errorReporter) => {
                      errorReporter.error(`Error opening the ${fileId} as ${newName}`, error)
                    })
                    finishSavingFileAs()
                  }
                )
              })
              .catch((error) => {
                logger.error(`Error saving file with id ${fileId} as ${newName}`, error)
                getErrorReporterInstance().then((errorReporter) => {
                  errorReporter.error(`Error saving file with id ${fileId} as ${newName}`, error)
                })
                finishSavingFileAs()
              })
          })
        })
        .finally(() => {
          setFileId(null)
          setVisible(false)
          setSuggestedName('')
          saveFileAs.current = false
        })
    }
  }

  useEffect(() => {
    // this event comes from the File menu
    const unsubscribe = onSaveAsOnPro((fileUrl) => {
      if (isOfflineMode) {
        return
      } else {
        setVisible(true)
        setFileId(helpers.file.withoutProtocol(fileUrl))
        saveFileAs.current = true
      }
    })
    // this event comes from the dashboard
    const saveAsPro = document.addEventListener('save-as--pro', (event) => {
      const fileId = helpers.file.withoutProtocol(event.fileUrl)
      if (isOfflineMode) {
        return
      } else {
        setVisible(true)
        setFileId(fileId)
        setSuggestedName(event.suggestedNewName ?? '')
        saveFileAs.current = true
      }
    })
    return () => {
      unsubscribe()
      document.removeEventListener('save-as--pro', saveAsPro)
    }
  }, [isOfflineMode])

  const hideRenamer = () => {
    setVisible(false)
  }

  if (!visible) {
    return null
  } else {
    return (
      <InputModal
        title={t('Name')}
        getValue={renameFile}
        defaultValue={suggestedName}
        isOpen={true}
        cancel={hideRenamer}
        type="text"
      />
    )
  }
}

SaveAs.propTypes = {
  isInProMode: PropTypes.bool,
  emailAddress: PropTypes.string,
  userId: PropTypes.string,
  clientId: PropTypes.string,
  fileList: PropTypes.array.isRequired,
  isOfflineMode: PropTypes.bool,
  startSavingFileAs: PropTypes.func.isRequired,
  finishSavingFileAs: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
    emailAddress: selectors.emailAddressSelector(state),
    userId: selectors.userIdSelector(state),
    clientId: selectors.clientIdSelector(state),
    fileList: selectors.knownFilesSelector(state),
    isOfflineMode: selectors.offlineModeEnabledSelector(state),
  }),
  {
    startSavingFileAs: actions.applicationState.startSavingFileAs,
    finishSavingFileAs: actions.applicationState.finishSavingFileAs,
  }
)(SaveAs)
