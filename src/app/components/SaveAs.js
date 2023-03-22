import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions, helpers } from 'pltr/v2'
import { t } from 'plottr_locales'
import { InputModal } from 'connected-components'
import { initialFetch } from 'wired-up-firebase'

import { uploadToFirebase } from '../../upload-to-firebase'
import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../mainProcessClient'

const { openKnownFile, pleaseOpenWindow, onSaveAsOnPro, getVersion } = makeMainProcessClient()

export const openFile = (fileURL, unknown) => {
  return openKnownFile(fileURL, unknown)
}

const SaveAs = ({
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
  const saveFileAs = useRef(false)

  const renameFile = (newName) => {
    // This component is for renaming cloud files only.
    if (!userId || !fileId || !emailAddress || !newName) {
      return
    }

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
                return Promise.reject(new Error(message))
              }
              return fileId
            })
            .then((fileId) => {
              logger.info(`Saved file with id ${fileId} as ${newName}`)
              setFileId(null)
              setVisible(false)
              finishSavingFileAs()
              saveFileAs.current = false
              return fileId
            })
            .then((fileId) => {
              pleaseOpenWindow(helpers.file.fileIdToPlottrCloudFileURL(fileId), true).catch(
                (error) => {
                  logger.error(`Error opening the ${fileId} as ${newName}`, error)
                  finishSavingFileAs()
                }
              )
            })
            .catch((error) => {
              logger.error(`Error saving file with id ${fileId} as ${newName}`, error)
              finishSavingFileAs()
            })
        })
      })
      .finally(() => {
        setFileId(null)
        setVisible(false)
        saveFileAs.current = false
      })
  }

  useEffect(() => {
    const unsubscribe = onSaveAsOnPro((fileUrl) => {
      if (isOfflineMode) return

      setVisible(true)
      setFileId(helpers.file.withoutProtocol(fileUrl))
      saveFileAs.current = true
    })
    const saveAsPro = document.addEventListener('save-as--pro', (event) => {
      const fileId = helpers.file.withoutProtocol(event.fileUrl)
      if (isOfflineMode) return
      setVisible(true)
      setFileId(fileId)
      saveFileAs.current = true
    })
    return () => {
      unsubscribe()
      document.removeEventListener('save-as--pro', saveAsPro)
    }
  }, [isOfflineMode])

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

SaveAs.propTypes = {
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
    emailAddress: selectors.emailAddressSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
    fileList: selectors.knownFilesSelector(state.present),
    isOfflineMode: selectors.offlineModeEnabledSelector(state.present),
  }),
  {
    startSavingFileAs: actions.applicationState.startSavingFileAs,
    finishSavingFileAs: actions.applicationState.finishSavingFileAs,
  }
)(SaveAs)
