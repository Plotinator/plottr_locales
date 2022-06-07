import React, { useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { app, dialog } from '@electron/remote'
import { connect } from 'react-redux'
import { Spinner } from 'connected-components'

import { t } from 'plottr_locales'
import { selectors, actions, SYSTEM_REDUCER_KEYS } from 'pltr/v2'
import { MessageModal } from 'connected-components'
import { initialFetch, overwriteAllKeys } from 'wired-up-firebase'
import logger from '../../../shared/logger'
import { uploadProject } from '../../common/utils/upload_project'
import { resumeDirective } from '../../resume'

const MAX_RETRIES = 5

const Resume = ({
  isResuming,
  setResuming,
  email,
  userId,
  fileId,
  clientId,
  withFullFileState,
  overwritingCloudWithBackup,
  checkingOfflineDrift,
  backingUpOfflineFile,
  showResumeMessageDialog,
  setCheckingForOfflineDrift,
  setOverwritingCloudWithBackup,
  setShowResumeMessageDialog,
  setBackingUpOfflineFile,
}) => {
  useEffect(() => {
    // Only resume when we're loaded up and good to go.  The hook
    // depends on email, userId etc. so we can safely guard the resume
    // process with this check.
    if (
      isResuming &&
      email &&
      userId &&
      clientId &&
      fileId &&
      !checkingOfflineDrift &&
      !overwritingCloudWithBackup &&
      !backingUpOfflineFile
    ) {
      setCheckingForOfflineDrift(true)
      setShowResumeMessageDialog(true)
      let retryCount = 0
      const checkAndUploadBackup = () => {
        return initialFetch(userId, fileId, clientId, app.getVersion()).then((cloudFile) => {
          return new Promise((resolve, reject) => {
            withFullFileState((state) => {
              const offlineFile = state.present
              const originalTimeStamp = new Date(offlineFile.file.originalTimeStamp)
              const [uploadOurs, backupOurs, doNothing] = resumeDirective(offlineFile, cloudFile)
              if (doNothing) {
                logger.info(
                  `After resuming, there are no changes between the local and cloud files for file with id: ${fileId}.`
                )
                setResuming(false)
                setCheckingForOfflineDrift(false)
                retryCount = 0
                resolve(false)
              } else if (uploadOurs) {
                logger.info(
                  `Detected that the online version of file with id: ${fileId} didn't cahnge, but we changed ours.  Uploading our version.`
                )
                overwriteAllKeys(fileId, clientId, {
                  ...offlineFile,
                  file: {
                    ...offlineFile.file,
                    fileName: offlineFile.file.originalFileName || offlineFile.file.fileName,
                  },
                }).then(() => {
                  setOverwritingCloudWithBackup(true)
                  setCheckingForOfflineDrift(false)
                  setResuming(false)
                  resolve(true)
                })
              } else if (backupOurs) {
                logger.info(
                  `Detected that file ${fileId} has changes since ${originalTimeStamp}.  Backing up the offline file and switching to the online file.`
                )
                const date = new Date()
                uploadProject(
                  {
                    ...offlineFile,
                    file: {
                      ...offlineFile.file,
                      fileName: `${decodeURI(offlineFile.file.fileName)} - Resume Backup - ${
                        date.getMonth() + 1
                      }-${date.getDate()}-${date.getFullYear()}`,
                    },
                  },
                  email,
                  userId
                ).then(() => {
                  setBackingUpOfflineFile(true)
                  setCheckingForOfflineDrift(false)
                  setResuming(false)
                  retryCount = 0
                  resolve(true)
                })
              }
            })
          })
        })
      }
      /* eslint-disable no-inner-declarations */
      function handleError(error) {
        logger.error('Error trying to resume online mode', error)
        retryCount++
        if (retryCount > MAX_RETRIES) {
          setResuming(false)
          setCheckingForOfflineDrift(false)
          setOverwritingCloudWithBackup(false)
          dialog.showErrorBox(
            t('Error'),
            t('There was an error reconnecting.  Please save the file and restart Plottr.')
          )
          retryCount = 0
        } else {
          checkAndUploadBackup().catch((error) => {
            setTimeout(() => {
              handleError(error)
            }, 1000)
          })
        }
      }
      /* eslint-enable */
      checkAndUploadBackup().catch(handleError)
    }
  }, [
    isResuming,
    userId,
    email,
    fileId,
    clientId,
    checkingOfflineDrift,
    overwritingCloudWithBackup,
    setCheckingForOfflineDrift,
    setShowResumeMessageDialog,
    setResuming,
    setBackingUpOfflineFile,
    backingUpOfflineFile,
  ])

  const acknowledge = () => {
    if (checkingOfflineDrift) return

    setCheckingForOfflineDrift(false)
    setOverwritingCloudWithBackup(false)
    setShowResumeMessageDialog(false)
    setBackingUpOfflineFile(false)
  }

  if (!isResuming && !showResumeMessageDialog) return null

  return (
    <MessageModal
      message="Reconnecting"
      onAcknowledge={acknowledge}
      disabledAcknowledge={checkingOfflineDrift}
      buttonText={isResuming ? 'Busy' : 'Dismiss'}
    >
      {checkingOfflineDrift && !overwritingCloudWithBackup ? <Spinner /> : null}
      {backingUpOfflineFile
        ? t(
            'The cloud file is different from your local copy.  We created a duplicate of your local file and switched to the cloud file.'
          )
        : null}
      {overwritingCloudWithBackup ? t('Your changes were uploaded to the cloud.') : null}
      {!checkingOfflineDrift && !backingUpOfflineFile && !overwritingCloudWithBackup
        ? t(
            'No changes were detected between the offline backup file and the Plottr cloud version.'
          )
        : null}
    </MessageModal>
  )
}

Resume.propTypes = {
  isResuming: PropTypes.bool,
  setResuming: PropTypes.func.isRequired,
  userId: PropTypes.string,
  email: PropTypes.string,
  fileId: PropTypes.string,
  clientId: PropTypes.string,
  withFullFileState: PropTypes.func.isRequired,
  overwritingCloudWithBackup: PropTypes.bool,
  checkingOfflineDrift: PropTypes.bool,
  backingUpOfflineFile: PropTypes.bool,
  showResumeMessageDialog: PropTypes.bool,
  setCheckingForOfflineDrift: PropTypes.func.isRequired,
  setOverwritingCloudWithBackup: PropTypes.func.isRequired,
  setShowResumeMessageDialog: PropTypes.func.isRequired,
  setBackingUpOfflineFile: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    isResuming: selectors.isResumingSelector(state.present),
    overwritingCloudWithBackup: selectors.isOverwritingCloudWithBackupSelector(state.present),
    checkingOfflineDrift: selectors.isCheckingForOfflineDriftSelector(state.present),
    showResumeMessageDialog: selectors.showResumeMessageDialogSelector(state.present),
    backingUpOfflineFile: selectors.backingUpOfflineFileSelector(state.present),
    userId: selectors.userIdSelector(state.present),
    email: selectors.emailAddressSelector(state.present),
    fileId: selectors.fileIdSelector(state.present),
    clientId: selectors.clientIdSelector(state.present),
  }),
  {
    withFullFileState: actions.project.withFullFileState,
    setResuming: actions.project.setResuming,
    setCheckingForOfflineDrift: actions.project.setCheckingForOfflineDrift,
    setOverwritingCloudWithBackup: actions.project.setOverwritingCloudWithBackup,
    setShowResumeMessageDialog: actions.project.setShowResumeMessageDialog,
    setBackingUpOfflineFile: actions.project.setBackingUpOfflineFile,
  }
)(Resume)
