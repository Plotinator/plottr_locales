import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { helpers } from 'pltr'
import { actions, selectors } from 'wired-up-pltr'

import UploadOfflineFile from './UploadOfflineFile'
import LoadingSplash from './LoadingSplash'
import { uploadProject } from '../../common/utils/upload_project'
import logger from '../../../shared/logger'
import { getErrorReporterInstance } from '../../../shared/error-reporter-instance'
import { whenClientIsReady } from '../../../shared/socket-client'
import { makeMainProcessClient } from '../mainProcessClient'
import MainIntegrationContext from '../../mainIntegrationContext'

import { bootFile } from '../bootFile'

const { updateLastOpenedFile } = makeMainProcessClient()

const UploadLastOpenedFileToPro = ({
  fileToUpload,
  darkMode,
  dismissPromptToUploadFile,
  generalError,
  startUploadingFileToCloud,
  emailAddress,
  userId,
  finishUploadingFileToCloud,
  saveBackup,
  setDashboardClosed,
  setCurrentAppStateToApplication,
  uploadingFileToCloud,
}) => {
  const dismissUploadPromptHandlingLastOpened = useCallback(() => {
    dismissPromptToUploadFile()
    whenClientIsReady(({ nukeLastOpenedFileURL }) => {
      return nukeLastOpenedFileURL()
    })
  }, [dismissPromptToUploadFile])

  const closeDashboard = useCallback(() => {
    setDashboardClosed(true)
    setCurrentAppStateToApplication()
  }, [])

  return (
    <MainIntegrationContext.Consumer>
      {({ readFile }) => {
        return (
          <>
            <LoadingSplash darkMode={darkMode} />
            <UploadOfflineFile
              fileURL={fileToUpload}
              onUploadFile={() => {
                readFile(helpers.file.withoutProtocol(fileToUpload)).then((data) => {
                  let file
                  try {
                    file = JSON.parse(data)
                  } catch (error) {
                    logger.error('Error uploading file to Pro', error)
                    getErrorReporterInstance().then((errorReporter) => {
                      errorReporter.error('Error uploading file to Pro', error)
                    })
                    generalError("We couldn't read your file.  Please try again.")
                    return
                  }
                  startUploadingFileToCloud()
                  uploadProject(file, emailAddress, userId)
                    .then((response) => {
                      const { fileId } = response.data || {}
                      if (!fileId) {
                        // FIXME: Use the new error loading file component
                        // here when its merged.
                        return
                      }
                      finishUploadingFileToCloud()
                      dismissUploadPromptHandlingLastOpened()
                      // Lie about the number of open files to avoid opening
                      // the dashboard when we double click a file.
                      //
                      // FIXME: where should the options come from?
                      const newFileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
                      bootFile(whenClientIsReady, newFileURL, {}, 2, saveBackup).then(
                        closeDashboard
                      )
                      updateLastOpenedFile(newFileURL)
                    })
                    .catch((error) => {})
                })
              }}
              onCancel={dismissUploadPromptHandlingLastOpened}
              busy={uploadingFileToCloud}
            />
          </>
        )
      }}
    </MainIntegrationContext.Consumer>
  )
}

UploadLastOpenedFileToPro.propTypes = {
  darkMode: PropTypes.bool,
  fileToUpload: PropTypes.string.isRequired,
  dismissPromptToUploadFile: PropTypes.func.isRequired,
  generalError: PropTypes.func.isRequired,
  startUploadingFileToCloud: actions.applicationState.startUploadingFileToCloud,
  emailAddress: PropTypes.string,
  userId: PropTypes.string,
  finishUploadingFileToCloud: PropTypes.func.isRequired,
  saveBackup: PropTypes.func.isRequired,
  setDashboardClosed: PropTypes.func.isRequired,
  setCurrentAppStateToApplication: PropTypes.func.isRequired,
  uploadingFileToCloud: PropTypes.bool,
}

export default connect(
  (state) => {
    return {
      darkMode: selectors.isDarkModeSelector(state),
      fileToUpload: selectors.filePathToUploadSelector(state),
      startUploadingFileToCloud: PropTypes.func.isRequired,
      emailAddress: selectors.emailAddressSelector(state),
      userId: selectors.userIdSelector(state),
      uploadingFileToCloud: selectors.uploadingFileToCloudSelector(state),
    }
  },
  {
    dismissPromptToUploadFile: actions.applicationState.dismissPromptToUploadFile,
    generalError: actions.error.generalError,
    startUploadingFileToCloud: actions.applicationState.startUploadingFileToCloud,
    finishUploadingFileToCloud: actions.applicationState.finishUploadingFileToCloud,
    setCurrentAppStateToApplication: actions.client.setCurrentAppStateToApplication,
  }
)(UploadLastOpenedFileToPro)
