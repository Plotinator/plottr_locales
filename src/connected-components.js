import { ActionCreators } from 'redux-undo'

import { t } from 'plottr_locales'
import { connections } from 'plottr_components'
import export_config from 'plottr_import_export/src/exporter/default_config'
import exportToSelfContainedPlottrFile from 'plottr_import_export/src/exporter/plottr'
import { helpers } from 'pltr/v2'
import * as pltr from 'pltr/v2'
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
import { whenClientIsReady } from '../shared/socket-client'
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

export const rmRF = (path, ...args) => {
  return whenClientIsReady(({ rmRf }) => {
    return rmRf(path)
  })
}

const writeFile = (filePath, data) => {
  return whenClientIsReady(({ writeFile }) => {
    return writeFile(filePath, data)
  })
}

const directoryIsWritable = (filePath) => {
  return whenClientIsReady(({ directoryIsWritable }) => {
    return directoryIsWritable(filePath)
  })
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
} = makeFileSystemAPIs(whenClientIsReady)

export const openFile = (fileURL, unknown) => {
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

const platform = {
  undo: () => {
    store().dispatch(ActionCreators.undo())
  },
  redo: () => {
    store().dispatch(ActionCreators.redo())
  },
  hostLocale,
  appVersion: getVersion,
  defaultBackupLocation: () => {
    return whenClientIsReady(({ defaultBackupLocation }) => {
      return defaultBackupLocation()
    })
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
      if (userId) {
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
    openExistingFile,
    doesFileExist,
    pathSep: () => {
      return whenClientIsReady(({ pathSep }) => {
        return pathSep()
      })
    },
    basename: (filePath) => {
      return whenClientIsReady(({ basename }) => {
        return basename(filePath)
      })
    },
    filePathAsArray: (filePath) => {
      return whenClientIsReady(({ filePathAsArray }) => {
        return filePathAsArray(filePath)
      })
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
      const clientId = selectors.clientIdSelector(state)
      const isLoggedIn = selectors.isLoggedInSelector(state)
      const file = isLoggedIn && selectors.fileFromFileURLSelector(state, fileURL)
      const isOnCloud = file?.isCloudFile
      if (isLoggedIn && isOnCloud) {
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
          deleteCloudBackupFile(fileName)
          return
        }

        deleteFile(id, userId, clientId)
          .then(() => {
            if (currentFileURL === fileURL) {
              store().dispatch(actions.project.selectFile(null))
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
    renameFile,
    removeFromKnownFiles,
    saveFile,
    createFileShortcut: (sourceFileURL, destinationURL) => {
      if (destinationURL == 'desktop') {
        return userDesktopPath().then((userDesktopPath) => {
          if (isWindows()) {
            return createDesktopShortcut(sourceFileURL, userDesktopPath)
          } else {
            return whenClientIsReady(({ createFileShortcut }) => {
              return createFileShortcut(sourceFileURL, userDesktopPath)
            })
          }
        })
      } else {
        if (isWindows()) {
          return createDesktopShortcut(sourceFileURL, userDesktopPath)
        } else {
          return whenClientIsReady(({ createFileShortcut }) => {
            return createFileShortcut(sourceFileURL, userDesktopPath)
          })
        }
      }
    },
    readFile: (fileURL) => {
      return whenClientIsReady(({ readFile }) => {
        return readFile(fileURL)
      })
    },
    rmRF,
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
    joinPath: (...args) => {
      return whenClientIsReady(({ join }) => {
        return join(...args)
      })
    },
    stat: (path) => {
      return whenClientIsReady(({ stat }) => {
        return stat(path)
      })
    },
    mkdir: (path) => {
      return whenClientIsReady(({ mkdir }) => {
        return mkdir(path)
      })
    },
    listOfflineFiles,
    createAndOpenCopy: (oldFilePath, newFileName) => {
      return createAndOpenCopy(oldFilePath, newFileName)
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
      pleaseCheckForUpdates()
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
    startTrial,
    deleteLicense,
    saveLicenseInfo,
    deletePlottrLicense,
    deleteProLicense,
    checkForLicense: () => licenseServerAPIs.checkForLicense(whenClientIsReady, persistLicenseMode),
  },
  reloadMenu: () => {
    pleaseReloadMenu()
  },
  template: {
    deleteTemplate: (templateId) => {
      const state = store().getState()
      const userId = selectors.userIdSelector(state)
      return deleteTemplate(templateId, userId, errorReportingLogger)
    },
    editTemplateDetails: (templateId, templateDetails) => {
      const state = store().getState()
      const userId = selectors.userIdSelector(state)
      editTemplateDetails(templateId, templateDetails, userId, errorReportingLogger)
    },
    startSaveAsTemplate: (itemType) => {
      const event = new Event('save-as-template-start', { bubbles: true, cancelable: false })
      event.itemType = itemType
      document.dispatchEvent(event)
    },
    saveTemplate: (payload) => {
      const event = new Event('save-custom-template', { bubbles: true, cancelable: false })
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
  createFullErrorReport,
  handleCustomerServiceCode,
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
                  return whenClientIsReady(({ writeFile, join }) => {
                    return join(path, fileName || 'backup.pltr').then((fullPath) => {
                      return writeFile(fullPath, JSON.stringify(file)).then(() => {
                        return showItemInFolder(fullPath)
                      })
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
          return saveAppSetting('user.isInProMode', false)
        })
        .then(() => {
          return logOut()
        })
    },
    saveCustomTemplate,
    uploadExisting,
  },
  login: {
    launchLoginPopup: () => {
      pleaseOpenLoginPopup()
    },
  },
  storage: {
    isStorageURL,
    resolveToPublicUrl: (storageUrl) => {
      if (!storageUrl) return null
      const state = store().getState()

      const fileId = selectors.fileIdSelector(state)
      const userId = selectors.userIdSelector(state)
      if (!fileId || !userId) {
        return Promise.reject(
          'No file or you are not logged in.  Either way we cannot fetch a picture.'
        )
      }
      return imagePublicURL(storageUrl, fileId, userId)
    },
    saveImageToStorageBlob: (blob, name) => {
      const state = store().getState()
      const userId = selectors.userIdSelector(state)
      return saveImageToStorageBlobInFirebase(userId, name, blob)
    },
    saveImageToStorageFromURL: (url, name) => {
      const state = store().getState()
      const userId = selectors.userIdSelector(state)
      return saveImageToStorageFromURLInFirebase(userId, name, url)
    },
    resizeImage,
    downloadStorageImage,
  },
  uploadToProAsDuplicate: (sourceFilePathSegments, newName) => {
    return whenClientIsReady(({ join, readFile }) => {
      return join(...sourceFilePathSegments).then((sourceFilePath) => {
        return readFile(sourceFilePath).then((fileData) => {
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
                `Couldn't parse file data to upload backup at ${sourceFilePath} to Firebase`,
                error
              )
            )
          }
        })
      })
    })
  },
  deleteProBackup: (backupRecordId, storageProtocolURL) => {
    const state = store().getState()
    const userId = selectors.userIdSelector(state)
    return deleteProBackup(userId, backupRecordId, storageProtocolURL)
  },
  deleteMachineLicenseActivation: (id, os, name, localUserName) => {
    return deleteMachineLicenseActivation(id, os, name, localUserName).then(() => {
      return deletePlottrLicense().then(() => {
        return deleteProLicense()
      })
    })
  },
}

// Override the selectors and actions with the ones that are wired up.
const components = connections.pltr(platform, { ...pltr, actions, selectors })

export const Navbar = components.Navbar
export const Grid = components.Grid
export const NavItem = components.NavItem
export const Nav = components.Nav
export const Col = components.Col
export const Row = components.Row
export const Button = components.Button
export const DeleteConfirmModal = components.DeleteConfirmModal
export const MessageModal = components.MessageModal
export const ColorPickerColor = components.ColorPickerColor
export const ItemsManagerModal = components.ItemsManagerModal
export const ListItem = components.ListItem
export const PlottrModal = components.PlottrModal
export const ModalBody = components.ModalBody
export const ModalHeader = components.ModalHeader
export const ModalTitle = components.ModalTitle
export const ModalFooter = components.ModalFooter
export const Form = components.Form
export const EditAttribute = components.EditAttribute
export const RichText = components.RichText
export const editorRegistry = components.editorRegistry
export const Image = components.Image
export const ImagePicker = components.ImagePicker
export const MiniColorPicker = components.MiniColorPicker
export const Spinner = components.Spinner
export const FunSpinner = components.FunSpinner
export const InputModal = components.InputModal
export const ColorPicker = components.ColorPicker
export const Switch = components.Switch
export const CardTemplateDetails = components.CardTemplateDetails
export const PlotlineTemplateDetails = components.PlotlineTemplateDetails
export const TemplateCreate = components.TemplateCreate
export const TemplateEdit = components.TemplateEdit
export const TemplatePicker = components.TemplatePicker
export const Beamer = components.Beamer
export const LanguagePicker = components.LanguagePicker
export const CategoryPicker = components.CategoryPicker
export const CharacterCategoriesModal = components.CharacterCategoriesModal
export const CharacterDetails = components.CharacterDetails
export const CharacterEditDetails = components.CharacterEditDetails
export const CharacterItem = components.CharacterItem
export const CharacterListView = components.CharacterListView
export const CustomAttrFilterList = components.CustomAttrFilterList
export const BookFilterList = components.BookFilterList
export const CharacterCategoryFilterList = components.CharacterCategoryFilterList
export const CharactersFilterList = components.CharactersFilterList
export const PlacesFilterList = components.PlacesFilterList
export const TagFilterList = components.TagFilterList
export const GenericFilterList = components.GenericFilterList
export const SortList = components.SortList
export const CharacterView = components.CharacterView
export const BookSelectList = components.BookSelectList
export const ErrorBoundary = components.ErrorBoundary
export const DashboardErrorBoundary = components.DashboardErrorBoundary
export const SelectList = components.SelectList
export const TagLabel = components.TagLabel
export const CustomAttributeModal = components.CustomAttributeModal
export const SubNav = components.SubNav
export const ProjectTemplateDetails = components.ProjectTemplateDetails
export const CharacterTemplateDetails = components.CharacterTemplateDetails
export const ActsConfigModal = components.ActsConfigModal
export const AskToSaveModal = components.AskToSaveModal
export const FilterList = components.FilterList
export const TagView = components.TagView
export const TagListView = components.TagListView
export const ExportDialog = components.ExportDialog
export const ExportNavItem = components.ExportNavItem
export const NoteListView = components.NoteListView
export const OutlineView = components.OutlineView
export const PlaceListView = components.PlaceListView
export const BookList = components.BookList
export const EditSeries = components.EditSeries
export const FileLocation = components.FileLocation
export const BookChooser = components.BookChooser
export const TimelineWrapper = components.TimelineWrapper
export const DashboardBody = components.DashboardBody
export const DashboardNav = components.DashboardNav
export const SearchModal = components.SearchModal
export const FirebaseLogin = components.FirebaseLogin
export const FullPageSpinner = components.FullPageSpinner
export const ChoiceView = components.ChoiceView
export const ExpiredView = components.ExpiredView
export const ProLicenseExpired = components.ProLicenseExpired
export const PlottrLicenseExpired = components.PlottrLicenseExpired
export const ProOnboarding = components.ProOnboarding
export const UpdateNotifier = components.UpdateNotifier
export const NewProjectInputModal = components.NewProjectInputModal
export const SettingsWizard = components.SettingsWizard
export const RestructureTimelineModal = components.RestructureTimelineModal
