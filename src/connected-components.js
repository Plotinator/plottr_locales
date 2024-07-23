import { t } from 'plottr_locales'
import { helpers } from 'pltr'
import { actions, selectors } from 'wired-up-pltr'
import {
  backupPublicURL,
  imagePublicURL,
  isStorageURL,
  saveImageToStorageBlob as saveImageToStorageBlobInFirebase,
  saveImageToStorageFromURL as saveImageToStorageFromURLInFirebase,
  deleteFile,
  onSessionChange,
  fetchFiles,
  logOut,
  saveCustomTemplate,
  currentUser,
  listenForRCELock,
  lockRCE,
  releaseRCELock,
  deleteProBackup,
  deleteMachineLicenseActivation,
} from 'wired-up-firebase'

import export_config from '../lib/plottr_import_export/src/exporter/default_config'
import exportToSelfContainedPlottrFile from '../lib/plottr_import_export/src/exporter/plottr'

import {
  renameFile,
  saveFile,
  editKnownFilePath,
  newFile,
  uploadExisting,
  deleteCloudBackupFile,
  createAndOpenCopy,
  openExistingFile,
  duplicateFile,
  userFilePickerDefaultFolder,
  importExistingFile,
  showRecentFilesInImportModal,
  importExistingCloudFile,
} from './files'
import logger from '../shared/logger'
import { closeDashboard } from './dashboard-events'
import { makeFileSystemAPIs, licenseServerAPIs } from './api'
import { isWindows, isLinux, isMacOS } from './isOS'
import { isDevelopment } from './isDevelopment'
import createErrorReporter from '../shared/error-reporter'
import {
  ERROR_REPORTER_ACCESS_TOKEN,
  getErrorReporterInstance,
} from '../shared/error-reporter-instance'

import { store } from './app/store'

import extractImages from './common/extract_images'
import { resizeImage } from './common/resizeImage'
import { downloadStorageImage, makeCachedDownloadStorageImage } from './common/downloadStorageImage'

import { deleteTemplate, editTemplateDetails } from './common/utils/templates'
import { createFullErrorReport } from './common/utils/full_error_report'
import { createErrorReport } from './common/utils/error_reporter'
import MPQ from './common/utils/MPQ'
import { doesFileExist, removeFromKnownFiles, listOfflineFiles } from './common/utils/files'
import { handleCustomerServiceCode } from './common/utils/customer_service_codes'
import { notifyUser } from './notifyUser'
import { exportSaveDialog } from './export-save-dialog'
import { makeMainProcessClient } from './app/mainProcessClient'
import { uploadToFirebase } from './upload-to-firebase'

const {
  getVersion,
  hostLocale,
  openExternal,
  showOpenDialog,
  showSaveDialog,
  machineId,
  openKnownFile,
  pleaseSetDarkModeSetting,
  pleaseQuit,
  createNewFile,
  deleteKnownFile,
  createFromSnowflake,
  createFromScrivener,
  createFromWord,
  pleaseQuitAndInstall,
  pleaseDownloadUpdate,
  pleaseCheckForUpdates,
  onUpdateError,
  onUpdaterUpdateAvailable,
  onUpdaterUpdateNotAvailable,
  onUpdaterDownloadProgress,
  onUpdaterUpdateDownloaded,
  pleaseUpdateLanguage,
  pleaseReloadMenu,
  showItemInFolder,
  downloadProBackupFileIntoMemory,
  pleaseOpenLoginPopup,
  pleaseTellMeWhatPlatformIAmOn,
  showErrorBox,
  askToExport,
  userDesktopPath,
  userDocumentsPath,
  pleaseOpenWindow,
  addToKnownFilesAndOpen,
  createDesktopShortcut,
  downloadDirectoryPath,
  machineName,
  localUserName,
} = makeMainProcessClient()

export const mountState = (state) => {
  return {
    user: state,
  }
}

export const plottrComponentsContextObject = (localClient) => {
  const writeFile = (filePath, data) => {
    return localClient.writeFile(filePath, data)
  }

  const directoryIsWritable = (filePath) => {
    return localClient.directoryIsWritable(filePath)
  }

  const {
    saveAppSetting,
    startTrial,
    deleteLicense,
    saveLicenseInfo,
    saveExportConfigSettings,
    deletePlottrLicense,
    deleteProLicense,
    persistLicenseMode,
  } = makeFileSystemAPIs(localClient)

  const openFile = (fileURL, unknown) => {
    openKnownFile(fileURL, unknown)
  }

  let unsubscribeFromUpdateError = null
  let unsubscribeFromUpdateerUpdateAvailable = null
  let unsubscribeFromUpdaterUpdateNotAvailable = null
  let unsubscribeFromUpdaterDownloadProgress = null
  let unsubscribeFromUpdaterUpdateDownloaded = null

  const cachedDowloadStorageImage = makeCachedDownloadStorageImage(downloadStorageImage)

  const errorReportingLogger = {
    info: logger.info,
    warn: logger.warn,
    error: (...args) => {
      logger.error(...args)
      getErrorReporterInstance().then((errorReporter) => {
        errorReporter.error(...args)
      })
    },
  }

  const { checkForAndSaveLicense } = licenseServerAPIs.makeLicenseServerAPIs(localClient, logger)

  const uploadToProAsDuplicate = (sourceFilePathSegments, newName) => {
    const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(store().getState())
    if (isInProMode) {
      return localClient.join(...sourceFilePathSegments).then((sourceFilePath) => {
        return localClient.readFile(sourceFilePath).then((fileData) => {
          try {
            const fileJSON = JSON.parse(fileData)
            const state = store().getState()
            const emailAddress = selectors.emailAddressSelector(state)
            const userId = selectors.userIdSelector(state)
            return uploadToFirebase(emailAddress, userId, fileJSON, newName).then((response) => {
              const fileId = response.data.fileId
              if (!fileId) {
                const message = `Tried to create cloud file for ${sourceFilePath} but we didn't get a fileId back`
                errorReportingLogger.error(
                  message,
                  new Error('Could not create cloud file as duplicate')
                )
                return Promise.reject(new Error(message))
              }
              const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
              return openFile(fileURL, false)
            })
          } catch (error) {
            return Promise.reject(
              new Error(
                `Couldn't parse file data to upload backup at ${sourceFilePath} to Firebase ${error.message}`
              )
            )
          }
        })
      })
    } else {
      return Promise.reject(
        new Error("Tried to upload file to Pro as duplicate, but we're not in pro mode")
      )
    }
  }

  const platform = {
    undo: () => {
      store().dispatch(actions.undo.undo())
    },
    redo: () => {
      store().dispatch(actions.undo.redo())
    },
    hostLocale,
    appVersion: getVersion,
    defaultBackupLocation: () => {
      return localClient.defaultBackupLocation()
    },
    setDarkMode: (value) => {
      pleaseSetDarkModeSetting(value)
    },
    appQuit: () => {
      pleaseQuit()
    },
    file: {
      createNew: (template, name) => {
        const state = store().getState()
        const file = selectors.fullFileStateSelector(state)
        const emailAddress = selectors.emailAddressSelector(state)
        const userId = selectors.userIdSelector(state)
        const clientId = selectors.clientIdSelector(state)
        const fileList = selectors.knownFilesSelector(state)
        const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        if (isInProMode) {
          store().dispatch(actions.project.showLoader(true))
          store().dispatch(actions.applicationState.startCreatingCloudFile())
          newFile(emailAddress, userId, fileList, file, clientId, template, openFile, name)
            .then((fileId) => {
              logger.info('Created new file.', fileId)
              store().dispatch(actions.project.showLoader(false))
              store().dispatch(actions.applicationState.finishCreatingCloudFile())
            })
            .catch((error) => {
              errorReportingLogger.error('Error creating a new file', error)
              store().dispatch(actions.project.showLoader(false))
              store().dispatch(actions.applicationState.finishCreatingCloudFile())
              showErrorBox(t('Error'), t('There was a problem doing that.  Please try again.'))
            })
        } else {
          createNewFile(template, name).catch((error) => {
            errorReportingLogger.error('Error creating a new file', error)
            store().dispatch(actions.project.showLoader(false))
            store().dispatch(actions.applicationState.finishCreatingCloudFile())
            showErrorBox(t('Error'), t('There was a problem doing that.  Please try again.'))
          })
        }
      },
      openExistingFile: () => {
        openExistingFile(localClient, uploadToProAsDuplicate)
      },
      doesFileExist: (fileURL) => doesFileExist(localClient, fileURL),
      pathSep: () => {
        return localClient.pathSep()
      },
      basename: (filePath) => {
        return localClient.basename(filePath)
      },
      filePathAsArray: (filePath) => {
        return localClient.filePathAsArray(filePath)
      },
      // FIXME: this is very poorly named.  Esp. since the second
      // parametor is a flag for whether the file is known XD
      openKnownFile: (fileURL, unknown) => {
        const state = store().getState()
        const loadedFileURL = selectors.fileURLSelector(state)
        if (fileURL === loadedFileURL) {
          closeDashboard()
        } else {
          openFile(fileURL, unknown)
        }
      },
      deleteKnownFile: (fileURL) => {
        const state = store().getState()
        const currentFileURL = selectors.fileURLSelector(state)
        const userId = selectors.userIdSelector(state)
        const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        const clientId = selectors.clientIdSelector(state)
        const isLoggedIn = selectors.isLoggedInSelector(state)
        const file =
          isLoggedIn &&
          selectors.fileFromFileURLSelector(
            state,
            // @ts-ignore
            fileURL
          )
        const isOnCloud = file?.isCloudFile
        if (isLoggedIn && isOnCloud && isInProMode) {
          if (!file) {
            errorReportingLogger.error(
              `Error deleting file at url: ${fileURL}.  File is not known to Plottr`,
              new Error('File not known to Plottr')
            )
            store().dispatch(actions.error.generalError('file-not-found'))
            store().dispatch(actions.project.showLoader(false))
            store().dispatch(actions.applicationState.finishDeletingFile())
            return
          }
          const { fileName } = file
          store().dispatch(actions.project.showLoader(true))
          store().dispatch(actions.applicationState.startDeletingFile())
          const id = helpers.file.fileIdFromPlottrProFile(fileURL)
          const isOffline = selectors.isOfflineSelector(state)
          const isOfflineModeEnabled = selectors.offlineModeEnabledSelector(state)

          // We can just delete the offline backup.  For now, we'll
          // leave it to the user to propogate that change to the cloud
          // if they do it while offline.  In the opposite direction,
          // the file will be cleaned up the next time we record an
          // offline file.
          if (isOffline && isOfflineModeEnabled) {
            deleteCloudBackupFile(localClient, fileName)
            return
          }

          deleteFile(id, userId, clientId)
            .then(() => {
              if (currentFileURL === fileURL) {
                store().dispatch(actions.project.selectEmptyFile())
              }
              logger.info(`Deleted file at path: ${fileURL}`)
              store().dispatch(actions.project.showLoader(false))
              store().dispatch(actions.applicationState.finishDeletingFile())
            })
            .catch((error) => {
              errorReportingLogger.error(`Error deleting file at path: ${fileURL}`, error)
              store().dispatch(actions.project.showLoader(false))
              store().dispatch(actions.applicationState.finishDeletingFile())
            })
        } else {
          deleteKnownFile(fileURL)
        }
      },
      editKnownFilePath,
      renameFile: (fileURL) => renameFile(localClient, fileURL),
      removeFromKnownFiles,
      saveFile: (fileURL, file) => saveFile(localClient, fileURL, file),
      createFileShortcut: (sourceFileURL, destinationURL) => {
        if (destinationURL == 'desktop') {
          return userDesktopPath().then((userDesktopPath) => {
            if (isWindows()) {
              return createDesktopShortcut(sourceFileURL, userDesktopPath)
            } else {
              return localClient.createFileShortcut(sourceFileURL, userDesktopPath)
            }
          })
        } else {
          if (isWindows()) {
            return createDesktopShortcut(sourceFileURL, userDesktopPath)
          } else {
            return localClient.createFileShortcut(sourceFileURL, userDesktopPath)
          }
        }
      },
      readFile: (fileURL) => {
        return localClient.readFile(fileURL)
      },
      writeFile,
      createFromSnowflake: (importedPath) => {
        const state = store().getState()
        const isLoggedIntoPro = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        createFromSnowflake(importedPath, isLoggedIntoPro)
      },
      createFromScrivener: (importedPath) => {
        const state = store().getState()
        const isLoggedIntoPro = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        createFromScrivener(importedPath, isLoggedIntoPro)
      },
      createFromWord: (importedPath) => {
        const state = store().getState()
        const isLoggedIntoPro = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        createFromWord(importedPath, isLoggedIntoPro)
      },
      joinPath: (...args) => {
        return localClient.join(...args)
      },
      stat: (path) => {
        return localClient.stat(path)
      },
      mkdir: (path) => {
        return localClient.mkdir(path)
      },
      listOfflineFiles: () => listOfflineFiles(localClient),
      createAndOpenCopy: (oldFilePath, newFileName) => {
        return createAndOpenCopy(localClient, oldFilePath, newFileName)
      },
      directoryIsWritable,
    },
    update: {
      quitToInstall: () => {
        pleaseQuitAndInstall()
      },
      downloadUpdate: () => {
        pleaseDownloadUpdate()
      },
      checkForUpdates: () => {
        const canReceiveUpdates = selectors.canReceiveUpdatesSelector(store().getState())
        if (canReceiveUpdates) {
          pleaseCheckForUpdates()
        } else {
          showErrorBox(t('Error'), t('You cannot receive updates with an inactive subscription.'))
        }
      },
      onUpdateError: (cb) => {
        unsubscribeFromUpdateError = onUpdateError(cb)
      },
      onUpdaterUpdateAvailable: (cb) => {
        unsubscribeFromUpdateerUpdateAvailable = onUpdaterUpdateAvailable(cb)
      },
      onUpdaterUpdateNotAvailable: (cb) => {
        unsubscribeFromUpdaterUpdateNotAvailable = onUpdaterUpdateNotAvailable(cb)
      },
      onUpdaterDownloadProgress: (cb) => {
        unsubscribeFromUpdaterDownloadProgress = onUpdaterDownloadProgress(cb)
      },
      onUpdatorUpdateDownloaded: (cb) => {
        unsubscribeFromUpdaterUpdateDownloaded = onUpdaterUpdateDownloaded(cb)
      },
      deregisterUpdateListeners: () => {
        if (typeof unsubscribeFromUpdateError === 'function') {
          unsubscribeFromUpdateError()
        }
        if (typeof unsubscribeFromUpdateerUpdateAvailable === 'function') {
          unsubscribeFromUpdateerUpdateAvailable()
        }
        if (typeof unsubscribeFromUpdaterUpdateNotAvailable === 'function') {
          unsubscribeFromUpdaterUpdateNotAvailable()
        }
        if (typeof unsubscribeFromUpdaterDownloadProgress === 'function') {
          unsubscribeFromUpdaterDownloadProgress()
        }
        if (typeof unsubscribeFromUpdaterUpdateDownloaded === 'function') {
          unsubscribeFromUpdaterUpdateDownloaded()
        }
      },
    },
    updateLanguage: (newLanguage) => {
      return pleaseUpdateLanguage(newLanguage)
    },
    license: {
      startTrial: () => {
        return startTrial().then(() => {
          return saveAppSetting('user.choseTrialMode', true)
        })
      },
      deleteLicense,
      saveLicenseInfo,
      deletePlottrLicense,
      deleteProLicense,
      checkForLicense: () => checkForAndSaveLicense(persistLicenseMode),
    },
    reloadMenu: () => {
      pleaseReloadMenu()
    },
    template: {
      deleteTemplate: (templateId) => {
        const state = store().getState()
        const userId = selectors.userIdSelector(state)
        const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        return deleteTemplate(localClient, templateId, userId, errorReportingLogger, isInProMode)
      },
      editTemplateDetails: (templateId, templateDetails) => {
        const state = store().getState()
        const userId = selectors.userIdSelector(state)
        const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        editTemplateDetails(
          localClient,
          templateId,
          templateDetails,
          userId,
          errorReportingLogger,
          isInProMode
        )
      },
      startSaveAsTemplate: (itemType) => {
        const event = new Event('save-as-template-start', { bubbles: true, cancelable: false })
        // @ts-ignore
        event.itemType = itemType
        document.dispatchEvent(event)
      },
      saveTemplate: (payload) => {
        const event = new Event('save-custom-template', { bubbles: true, cancelable: false })
        // @ts-ignore
        event.payload = payload
        document.dispatchEvent(event)
      },
    },
    settings: {
      saveAppSetting,
    },
    os: () => (isWindows() ? 'windows' : isMacOS() ? 'macos' : isLinux() ? 'linux' : 'unknown'),
    isDevelopment: isDevelopment(),
    isWindows: () => !!isWindows(),
    isMacOS: () => !!isMacOS(),
    openExternal: (...args) => {
      return openExternal(...args).catch((error) => {
        errorReportingLogger.error(`Error opening URL ${args}`, error)
        store().dispatch(actions.error.generalError(`Error opening URL ${args}`))
      })
    },
    createErrorReport,
    createFullErrorReport: () => createFullErrorReport(localClient),
    handleCustomerServiceCode: (code) => handleCustomerServiceCode(localClient, code),
    log: logger,
    showOpenDialog,
    showSaveDialog,
    showErrorBox,
    userDocumentsPath,
    userFilePickerDefaultFolder,
    pleaseOpenWindow,
    addToKnownFilesAndOpen,
    node: {
      env: isDevelopment() ? 'development' : 'production',
    },
    errorReporter: {
      errorReporterAccessToken: ERROR_REPORTER_ACCESS_TOKEN,
      errorReporter: createErrorReporter,
      platform: pleaseTellMeWhatPlatformIAmOn,
      getInstance: getErrorReporterInstance,
    },
    rollbar: {
      // DEPRECATED
      rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN || '',
      platform: pleaseTellMeWhatPlatformIAmOn,
    },
    export: {
      askToExport,
      export_config,
      saveExportConfigSettings,
      notifyUser,
      exportSaveDialog,
    },
    moveFromTemp: () => {
      const event = new Event('move-from-temp')
      document.dispatchEvent(event)
    },
    duplicateFile,
    importExistingFile: () => {
      return importExistingFile(localClient)
    },
    importExistingCloudFile,
    showRecentFilesInImportModal,
    showItemInFolder: (fileURL, fileName) => {
      isStorageURL(fileURL).then((storageURL) => {
        if (!storageURL) {
          showItemInFolder(fileURL)
        } else {
          backupPublicURL(fileURL)
            .then((url) => downloadProBackupFileIntoMemory(url, fileName))
            .then((fileString) => {
              try {
                const userId = selectors.userIdSelector(store().getState())
                const file = JSON.parse(fileString)
                return exportToSelfContainedPlottrFile(
                  file,
                  userId,
                  cachedDowloadStorageImage.downloadStorageImage
                ).then((file) => {
                  return downloadDirectoryPath().then((path) => {
                    return localClient.join(path, fileName || 'backup.pltr').then((fullPath) => {
                      return writeFile(fullPath, JSON.stringify(file)).then(() => {
                        return showItemInFolder(fullPath)
                      })
                    })
                  })
                })
              } catch (error) {
                return Promise.reject(error)
              }
            })
        }
      })
    },
    mpq: MPQ,
    rootElementSelectors: ['#react-root', '#dashboard__react__root'],
    templatesDisabled: false,
    exportDisabled: false,
    listenForRCELock,
    lockRCE,
    releaseRCELock,
    machineId,
    machineInfo: () => {
      return Promise.all([
        machineId(),
        machineName(),
        localUserName(),
        pleaseTellMeWhatPlatformIAmOn(),
      ]).then(([id, name, user, os]) => {
        return {
          id,
          os,
          name,
          localUserName: user,
        }
      })
    },
    extractImages,
    firebase: {
      onSessionChange,
      currentUser,
      fetchFiles,
      logOut: () => {
        return saveAppSetting('user.frbId', null)
          .then(() => {
            return saveAppSetting('user.choseProMode', false)
          })
          .then(() => {
            return logOut()
          })
      },
      saveCustomTemplate,
      uploadExisting: (emailAddress, userId, file) => {
        return uploadExisting(localClient, emailAddress, userId, file)
      },
    },
    login: {
      launchLoginPopup: () => {
        pleaseOpenLoginPopup()
      },
    },
    storage: {
      isStorageURL,
      resolveToPublicUrl: (storageUrl) => {
        if (!storageUrl) {
          return Promise.reject(new Error(`Invalid storageUrl: ${storageUrl}`))
        } else {
          const state = store().getState()

          const fileId = selectors.fileIdSelector(state)
          const userId = selectors.userIdSelector(state)
          const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
          if (!fileId || !userId || !isInProMode) {
            return Promise.reject(
              'No file or you are not logged in.  Either way we cannot fetch a picture.'
            )
          } else {
            return imagePublicURL(storageUrl, fileId, userId)
          }
        }
      },
      saveImageToStorageBlob: (blob, name) => {
        const state = store().getState()
        const userId = selectors.userIdSelector(state)
        const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        if (!isInProMode) {
          return saveImageToStorageBlobInFirebase(userId, name, blob)
        } else {
          return Promise.reject(
            new Error("Trying to save an image to storage but we're not in pro")
          )
        }
      },
      saveImageToStorageFromURL: (url, name) => {
        const state = store().getState()
        const userId = selectors.userIdSelector(state)
        const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
        if (isInProMode) {
          return saveImageToStorageFromURLInFirebase(userId, name, url)
        } else {
          return Promise.reject(
            new Error("Trying to save an image to storage but we're not in pro")
          )
        }
      },
      resizeImage,
      downloadStorageImage,
    },
    uploadToProAsDuplicate,
    deleteProBackup: (backupRecordId, storageProtocolURL) => {
      const state = store().getState()
      const userId = selectors.userIdSelector(state)
      const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
      if (isInProMode) {
        return deleteProBackup(userId, backupRecordId, storageProtocolURL)
      } else {
        return Promise.reject(new Error("Tried to delete Pro backup, but we're not in Pro mode."))
      }
    },
    deleteMachineLicenseActivation: (id, os, name, localUserName) => {
      return deleteMachineLicenseActivation(id, os, name, localUserName).then(() => {
        return deletePlottrLicense().then(() => {
          return deleteProLicense()
        })
      })
    },
    // Use in cases where we get something that looks roughly like the
    // user state and we want it to appear at the right place for
    // selectors to find it.
    mountState,
  }

  return { platform }
}
