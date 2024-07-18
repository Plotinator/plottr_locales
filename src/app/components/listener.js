import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { helpers } from 'pltr'
import { actions, selectors } from 'wired-up-pltr'
import { listen } from 'wired-up-firebase'
import { t } from 'plottr_locales'

import { store } from '../store'
import { duplicateFile } from '../../files'
import { makeMainProcessClient } from '../mainProcessClient'

const { pleaseOpenWindow, markProjectAsUnsaved } = makeMainProcessClient()

const Listener = ({
  userId,
  selectedFile,
  setPermission,
  setFileLoaded,
  clientId,
  fileLoaded,
  isOffline,
  fileURL,
  fileName,
  offlineModeIsEnabled,
  resuming,
  fileVersion,
  hasDefaultFolder,
  withFullFileState,
  showErrorBox,
  unsavedChanges,
  isDeviceFile,
  isInProMode,
  localClient,
}) => {
  // ====Prevent Users from Opening Backups===

  // Prevent users from changing backups by closing the backup and
  // opening a temp version instead.
  useEffect(() => {
    if (fileURL) {
      localClient.isInBackupFolder(fileURL).then((isInBackupFolder) => {
        if (isInBackupFolder) {
          if (hasDefaultFolder) {
            return withFullFileState((state) => {
              return localClient
                .basename(fileName)
                .then((name) => {
                  return name.replace(/\.pltr$/, '')
                })
                .then((name) => {
                  const newName = helpers.file.genericBackupNameForToday(name)
                  const withoutSystemKeys = selectors.fullFileStateSelector(state)
                  return localClient
                    .saveToDefaultLocation(withoutSystemKeys, null, newName)
                    .then((newFileURL) => {
                      return pleaseOpenWindow(newFileURL)
                        .then(() => {
                          return localClient.addKnownFile(newFileURL)
                        })
                        .then(() => {
                          const event = new Event('force-close')
                          window.dispatchEvent(event)
                        })
                    })
                })
            })
          } else {
            return localClient
              .basename(fileName)
              .then((name) => {
                return name.replace(/\.pltr$/, '')
              })
              .then((name) => {
                const newName = helpers.file.genericBackupNameForToday(name)
                duplicateFile(fileURL, newName, true)
              })
          }
        }
      })
    }
  }, [fileURL, hasDefaultFolder, fileName])

  // ====Listen to the file on Plottr Cloud====

  // Logic to resume the current file
  useEffect(() => {
    const weDontHaveBasicInfo = !userId || !clientId || !fileURL
    const fileIsntACloudFile = !helpers.file.urlPointsToPlottrCloud(fileURL)
    const weAreResuming = offlineModeIsEnabled && resuming

    if (weDontHaveBasicInfo || fileIsntACloudFile || isOffline || weAreResuming || !isInProMode) {
      return () => {}
    } else {
      let unsubscribeFunction = () => {}
      if (fileLoaded) {
        const fileId = helpers.file.fileIdFromPlottrProFile(fileURL)
        unsubscribeFunction = listen(store(), userId, fileId, clientId, fileVersion)
        setPermission(selectedFile.permission)
      } else {
        setFileLoaded()
      }
      return unsubscribeFunction
    }
  }, [
    offlineModeIsEnabled,
    fileVersion,
    selectedFile,
    userId,
    clientId,
    fileLoaded,
    isOffline,
    resuming,
    isInProMode,
  ])

  const selectedFileVersionRef = useRef(null)
  useEffect(() => {
    if (fileLoaded && fileVersion) {
      if (selectedFileVersionRef.current && selectedFileVersionRef.current !== fileVersion) {
        // The version changed.  We need to reload the window.
        showErrorBox(
          t('We need to reboot Plottr'),
          t('You wont lose any work. Sorry for the inconvenience.')
        ).then(() => {
          window.location.reload()
        })
        return
      } else {
        selectedFileVersionRef.current = fileVersion
        return
      }
    } else {
      selectedFileVersionRef.current = null
    }
  }, [fileLoaded, fileVersion])

  // ===Track Unsaved Changes State===

  const previousUnsavedChanges = useRef(unsavedChanges)
  useEffect(() => {
    if (isDeviceFile && previousUnsavedChanges.current !== unsavedChanges && unsavedChanges) {
      markProjectAsUnsaved()
    }
  }, [unsavedChanges, previousUnsavedChanges, isDeviceFile])

  return null
}

Listener.propTypes = {
  userId: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  setFileLoaded: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  fileLoaded: PropTypes.bool,
  isOffline: PropTypes.bool,
  fileURL: PropTypes.string,
  fileName: PropTypes.string,
  resuming: PropTypes.bool,
  hasDefaultFolder: PropTypes.bool,
  unsavedChanges: PropTypes.bool,
  isDeviceFile: PropTypes.bool,
  fileVersion: PropTypes.string,
  withFullFileState: PropTypes.func.isRequired,
  offlineModeIsEnabled: PropTypes.bool,
  showErrorBox: PropTypes.func.isRequired,
  startCreatingNewProject: PropTypes.func.isRequired,
  isInProMode: PropTypes.bool,
  localClient: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  selectedFile: selectors.selectedFileSelector(state),
  userId: selectors.userIdSelector(state),
  clientId: selectors.clientIdSelector(state),
  fileLoaded: selectors.fileLoadedSelector(state),
  isOffline: selectors.isOfflineSelector(state),
  fileURL: selectors.fileURLSelector(state),
  fileName: selectors.fileNameSelector(state),
  resuming: selectors.isResumingSelector(state),
  offlineModeIsEnabled: selectors.offlineModeEnabledSelector(state),
  fileVersion: selectors.fileVersionSelector(state),
  hasDefaultFolder: selectors.hasDefaultFolderSelector(state),
  unsavedChanges: selectors.unsavedChangesSelector(state),
  isDeviceFile: selectors.isDeviceFileSelector(state),
  isInProMode: selectors.isLoggedIntoProWithActiveLicenseSelector(state),
})

export default connect(mapStateToProps, {
  setPermission: actions.permission.setPermission,
  setFileLoaded: actions.project.setFileLoaded,
  withFullFileState: actions.project.withFullFileState,
  startCreatingNewProject: actions.project.startCreatingNewProject,
})(Listener)
