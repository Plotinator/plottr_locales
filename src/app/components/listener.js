import { useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { helpers } from 'pltr/v2'
import { actions, selectors } from 'wired-up-pltr'
import { listen, fetchFiles, getIdTokenResult, logOut, updateAuthFileName } from 'wired-up-firebase'
import { t } from 'plottr_locales'

import { store } from '../store'
import logger from '../../../shared/logger'
import { makeFileSystemAPIs, licenseServerAPIs } from '../../api'
import { whenClientIsReady } from '../../../shared/socket-client'
import { duplicateFile } from '../../files'
import { makeMainProcessClient } from '../mainProcessClient'

const { pleaseOpenWindow } = makeMainProcessClient()

const Listener = ({
  hasPro,
  userId,
  emailAddress,
  selectedFile,
  setPermission,
  knownFiles,
  setFileLoaded,
  patchFile,
  clientId,
  fileLoaded,
  isOffline,
  isCloudFile,
  fileURL,
  fileName,
  originalFileName,
  cloudFileURL,
  selectFile,
  offlineModeIsEnabled,
  resuming,
  fileVersion,
  hasDefaultFolder,
  withFullFileState,
  isLoggedIn,
  checkedSession,
  checkingProSubscription,
  setHasPro,
  setUserId,
  setEmailAddress,
  setProLicenseInfo,
  startLoadingALicenseType,
  finishLoadingALicenseType,
  showErrorBox,
}) => {
  const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)

  // Prevent users from changing backups by closing the backup and
  // opening a temp version instead.
  useEffect(() => {
    if (fileURL) {
      fileSystemAPIs.backupBasePath().then((backupPath) => {
        return new Promise((resolve, reject) => {
          if (helpers.file.withoutProtocol(fileURL).startsWith(backupPath)) {
            if (hasDefaultFolder) {
              withFullFileState((state) => {
                whenClientIsReady(({ saveToDefaultLocation, basename, addKnownFile }) => {
                  return basename(fileName)
                    .then((name) => {
                      return name.replace(/\.pltr$/, '')
                    })
                    .then((name) => {
                      const backupText = t('Backup')
                      const date = new Date()
                      const month = date.getMonth() + 1
                      const day = date.getDate()
                      const year = date.getUTCFullYear()
                      const backupDate = `${t('Resumed at')}:${month}-${day}-${year}`
                      return saveToDefaultLocation(
                        state,
                        `${name} [${backupText} ${backupDate}]`
                      ).then((newFileURL) => {
                        return pleaseOpenWindow(newFileURL)
                          .then(() => {
                            return addKnownFile(newFileURL)
                          })
                          .then(() => {
                            const event = new Event('force-close')
                            window.dispatchEvent(event)
                          })
                      })
                    })
                }).then(resolve, reject)
              })
            } else {
              whenClientIsReady(({ basename }) => {
                return basename(fileName)
                  .then((name) => {
                    return name.replace(/\.pltr$/, '')
                  })
                  .then((name) => {
                    const backupText = t('Backup')
                    const date = new Date()
                    const month = date.getMonth() + 1
                    const day = date.getDate()
                    const year = date.getUTCFullYear()
                    const backupDate = `${t('Resumed at')}:${month}-${day}-${year}`
                    duplicateFile(fileURL, `${name} [${backupText} ${backupDate}].pltr`, true)
                  })
              }).then(resolve, reject)
            }
          }
        })
      })
    }
  }, [fileURL, hasDefaultFolder, fileName])

  // ====Listen to the file on Plottr Cloud====

  // Logic to resume the current file
  useEffect(() => {
    const weDontHaveBasicInfo = !userId || !clientId || !fileURL
    const fileIsntACloudFile = !helpers.file.urlPointsToPlottrCloud(fileURL)
    const weAreResuming = offlineModeIsEnabled && resuming

    if (weDontHaveBasicInfo || fileIsntACloudFile || isOffline || weAreResuming) {
      return () => {}
    }

    let unsubscribeFunction = () => {}
    if (fileLoaded) {
      const fileId = helpers.file.fileIdFromPlottrProFile(fileURL)
      unsubscribeFunction = listen(store(), userId, fileId, clientId, fileVersion)
      setPermission(selectedFile.permission)
    } else {
      setFileLoaded()
    }

    return unsubscribeFunction
  }, [
    offlineModeIsEnabled,
    fileVersion,
    selectedFile,
    userId,
    clientId,
    fileLoaded,
    isOffline,
    resuming,
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

  // ====Pro Session====

  const handleCheckPro = (uid, email, isLifetime, isAdmin) => (hasPro, info) => {
    if (hasPro) {
      fileSystemAPIs.saveAppSetting('user.frbId', uid)
      setHasPro(hasPro)
      setUserId(uid)
      setEmailAddress(email)
      setProLicenseInfo({
        ...info,
        expiration: isLifetime ? 'lifetime' : info.expiration,
        admin: isAdmin,
      })
      fetchFiles(uid).then((files) => {
        finishLoadingALicenseType('proSubscription')
      })
    } else {
      logOut().then(() => {
        setUserId(null)
        setEmailAddress(null)
        showErrorBox(t('Error'), t("It doesn't look like you have a pro license."))
      })
    }
  }

  // Handle session changes.
  useEffect(() => {
    if (
      checkedSession &&
      emailAddress &&
      userId &&
      isLoggedIn &&
      !hasPro &&
      !checkingProSubscription
    ) {
      startLoadingALicenseType('proSubscription')
      getIdTokenResult().then((token) => {
        if (token.claims.beta || token.claims.admin || token.claims.lifetime) {
          handleCheckPro(
            userId,
            emailAddress,
            token.claims.lifeTime || token.claims.admin,
            token.claims.admin
          )(true, { expiration: 'lifetime', admin: true })
        } else {
          if (emailAddress) {
            licenseServerAPIs
              .checkForPro(
                emailAddress,
                handleCheckPro(
                  userId,
                  emailAddress,
                  token.claims.lifeTime || token.claims.admin,
                  token.claims.admin
                )
              )
              .catch((error) => {
                // TODO: maybe retry?
                logger.error('Failed to check for pro', error)
                finishLoadingALicenseType('proSubscription')
              })
          }
        }
      })
    }
  }, [isLoggedIn, checkedSession, userId, emailAddress, hasPro, checkingProSubscription])

  // ====Synchronising data file name to known file name====
  useEffect(() => {
    if (!fileURL || !fileName || knownFiles.length === 0) return

    if (!helpers.file.urlPointsToPlottrCloud(fileURL)) {
      return
    }

    const knownFileRecord = knownFiles.find((file) => {
      return file.fileURL === fileURL
    })
    if (knownFileRecord && knownFileRecord.fileName !== fileName) {
      const fileId = helpers.file.withoutProtocol(fileURL)
      updateAuthFileName(fileId, fileName)
    }
  }, [knownFiles, fileURL, fileName])

  return null
}

Listener.propTypes = {
  hasPro: PropTypes.bool,
  userId: PropTypes.string,
  emailAddress: PropTypes.string,
  setPermission: PropTypes.func.isRequired,
  knownFiles: PropTypes.array.isRequired,
  selectedFile: PropTypes.object,
  setFileLoaded: PropTypes.func.isRequired,
  patchFile: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  fileLoaded: PropTypes.bool,
  isOffline: PropTypes.bool,
  fileURL: PropTypes.string,
  fileName: PropTypes.string,
  originalFileName: PropTypes.string,
  cloudFileURL: PropTypes.string,
  selectFile: PropTypes.func.isRequired,
  resuming: PropTypes.bool,
  hasDefaultFolder: PropTypes.bool,
  isCloudFile: PropTypes.bool,
  fileVersion: PropTypes.string,
  withFullFileState: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool,
  checkedSession: PropTypes.bool,
  offlineModeIsEnabled: PropTypes.bool,
  checkingProSubscription: PropTypes.bool,
  setHasPro: PropTypes.func.isRequired,
  setUserId: PropTypes.func.isRequired,
  setEmailAddress: PropTypes.func.isRequired,
  setProLicenseInfo: PropTypes.func.isRequired,
  startLoadingALicenseType: PropTypes.func.isRequired,
  finishLoadingALicenseType: PropTypes.func.isRequired,
  showErrorBox: PropTypes.func.isRequired,
  startCreatingNewProject: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    hasPro: selectors.hasProSelector(state),
    emailAddress: selectors.emailAddressSelector(state),
    selectedFile: selectors.selectedFileSelector(state),
    userId: selectors.userIdSelector(state),
    clientId: selectors.clientIdSelector(state),
    fileLoaded: selectors.fileLoadedSelector(state),
    isOffline: selectors.isOfflineSelector(state),
    fileURL: selectors.fileURLSelector(state),
    fileName: selectors.fileNameSelector(state),
    originalFileName: selectors.originalFileNameSelector(state),
    cloudFileURL: selectors.cloudFilePathSelector(state),
    resuming: selectors.isResumingSelector(state),
    isCloudFile: selectors.isCloudFileSelector(state),
    isLoggedIn: selectors.isLoggedInSelector(state),
    checkedSession: selectors.sessionCheckedSelector(state),
    offlineModeIsEnabled: selectors.offlineModeEnabledSelector(state),
    checkingProSubscription: selectors.checkingProSubscriptionSelector(state),
    knownFiles: selectors.knownFilesSelector(state),
    fileVersion: selectors.fileVersionSelector(state),
    hasDefaultFolder: selectors.hasDefaultFolderSelector(state),
  }),
  {
    setPermission: actions.permission.setPermission,
    patchFile: actions.ui.patchFile,
    setFileLoaded: actions.project.setFileLoaded,
    selectFile: actions.project.selectFile,
    withFullFileState: actions.project.withFullFileState,
    setHasPro: actions.client.setHasPro,
    setUserId: actions.client.setUserId,
    setEmailAddress: actions.client.setEmailAddress,
    setProLicenseInfo: actions.license.setProLicenseInfo,
    startLoadingALicenseType: actions.applicationState.startLoadingALicenseType,
    finishLoadingALicenseType: actions.applicationState.finishLoadingALicenseType,
    startCreatingNewProject: actions.project.startCreatingNewProject,
  }
)(Listener)
