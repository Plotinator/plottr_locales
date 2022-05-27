import { connections } from 'plottr_components'
import { ActionCreators } from 'redux-undo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'
import { actions, selectors } from 'pltr/v2'
import { history } from '../lib/history'

import { appVersion } from '../lib/version'
import {
  saveImageToStorageBlob as saveImageToStorageBlobInFirebase,
  saveImageToStorageFromURL as saveImageToStorageFromURLInFirebase,
  deleteFile,
  imagePublicURL,
  isStorageURL,
  backupPublicURL,
  lockRCE,
  listenForRCELock,
  releaseRCELock,
  logOut,
  onSessionChange,
  currentUser,
  fetchFiles,
  saveCustomTemplate,
} from 'wired-up-firebase'
import {
  startSaveAsTemplate,
  messageToSaveNewTemplate,
  messageToEditTemplate,
  messageToDeleteTemplate,
} from '../lib/templates'
import exportConfig from 'plottr_import_export_config'
import { exportFile } from '../lib/export'
import { saveAppSetting } from '../lib/appSettings'
import { saveExportConfigSettings } from '../lib/exportSettings'
import { store } from '../lib/redux'
import {
  messageOpenExistingFile,
  messageRenameFile,
  newEmptyFile,
  newFile,
  openFile,
  uploadExisting,
  sortAndSearch,
} from '../lib/files'
import { createErrorReport } from '../lib/createErrorReport'
import { closeDashboard, forceCloseDashboard } from '../lib/dashboard'
import { userHasPro } from '../lib/checkPro'
import MPQ from '../lib/MPQ'
import { resizeImage } from '../lib/resizeImage'
import extractImages from '../lib/extractImages'
import { logger } from '../lib/logger'
import { setCurrentProject } from '../lib/currentProject'
import { notifyUser } from '../lib/notifyUser'
import { createWebReport } from './create-error-report'

const deleteFileOnFirestore = (fileId) => {
  const state = store.getState()
  const {
    client: { userId, clientId },
  } = state.present
  return deleteFile(fileId, userId, clientId)
}

const NOP = () => {}

const platform = {
  electron: null,
  undo: () => {
    store.dispatch(ActionCreators.undo())
  },
  redo: () => {
    store.dispatch(ActionCreators.redo())
  },
  appVersion: appVersion(),
  defaultBackupLocation: 'cloud',
  setDarkMode: (value) => {
    store.dispatch(actions.ui.setDarkMode(value === 'dark'))
  },
  file: {
    createNew: (template, newFileName) => {
      const state = store.getState()
      const {
        client: { emailAddress, userId, clientId },
        knownFiles,
      } = state.present
      const actStructureEnabled = selectors.actStructureEnabled(state.present)
      const untitledFileList = knownFiles.filter(({ fileName }) => fileName.match(/Untitled/g))
      const fileName = newFileName || t('Untitled') + ` - ${untitledFileList.length}`
      const setKnownFiles = (...args) => store.dispatch(actions.knownFiles.setKnownFiles(...args))
      const selectFile = (...args) => store.dispatch(actions.project.selectFile(...args))
      const newFileStateWithoutFeatureFlags = {
        ...newEmptyFile(fileName, appVersion(), state.present),
        ...(template || {}),
      }
      const newFileState = {
        ...newFileStateWithoutFeatureFlags,
        featureFlags: {
          BEAT_HIERARCHY: actStructureEnabled,
        },
      }
      if (newFileState.books[1]) {
        newFileState.books[1].title = fileName
        newFileState.series.name = fileName
      }
      store.dispatch(actions.applicationState.startCreatingCloudFile())
      newFile(
        emailAddress,
        userId,
        fileName,
        { present: newFileState },
        setKnownFiles,
        selectFile,
        clientId
      )
        .then(() => {
          store.dispatch(actions.applicationState.finishCreatingCloudFile())
          closeDashboard()
          logger.info('Created new file.')
        })
        .catch((error) => {
          store.dispatch(actions.applicationState.finishCreatingCloudFile())
          logger.error('Error creating new file.', error)
        })
    },
    openExistingFile: messageOpenExistingFile,
    doesFileExist: () => {
      // NOP.  We don't expect the API to reply with non-existant files.
      return true
    },
    sortAndSearch,
    isTempFile: () => {
      // There's no such thing as a temp file with cloud storage
      return false
    },
    pathSep: 'todo',
    basename: (filePath) => {
      // There's no such thing as a 'basename' in cloud storage
      return filePath
    },
    openKnownFile: (fileId, id, unknown) => {
      const state = store.getState()
      const {
        client: { userId, clientId },
        knownFiles,
      } = state.present
      const selectedFile = knownFiles.find((thatFile) => thatFile.id === fileId)
      if (!selectedFile) return

      store.dispatch(actions.applicationState.startLoadingFile())
      store.dispatch(actions.project.showLoader(true))
      openFile(userId, fileId, clientId, selectedFile.version, selectedFile.permission)
        .then(() => {
          store.dispatch(actions.project.selectFile(selectedFile))
          store.dispatch(actions.applicationState.finishLoadingFile())
          store.dispatch(actions.project.showLoader(false))
          setCurrentProject(fileId)
          forceCloseDashboard()
          logger.info(`Opened file: ${fileId}`)
        })
        .catch((error) => {
          store.dispatch(actions.project.showLoader(false))
          store.dispatch(actions.applicationState.finishLoadingFile())
          store.dispatch(actions.error.generalError('could-not-open-file'))
          logger.error(`Error opening file: ${fileId}`, error.message, error)
        })
    },
    deleteKnownFile: (position, fileId) => {
      store.dispatch(actions.project.showLoader(true))
      store.dispatch(actions.applicationState.startDeletingFile())
      deleteFileOnFirestore(fileId)
        .then(() => {
          store.dispatch(actions.applicationState.finishDeletingFile())
          store.dispatch(actions.project.showLoader(false))
          logger.info(`Deleted file with id: ${fileId}`)
        })
        .catch((error) => {
          store.dispatch(actions.applicationState.finishDeletingFile())
          store.dispatch(actions.project.showLoader(false))
          store.dispatch(actions.error.generalError(error))
          logger.error(`Error deleting file: ${fileId}`, error)
        })
    },
    // You can't change where a file is on the web.
    editKnownFilePath: NOP,
    removeFromKnownFiles: NOP,
    // Files are saved as we go.
    saveFile: NOP,
    // no such thing as reading synchronously from the file system
    // when we're using cloud storage.
    readFileSync: NOP,
    moveItemToTrash: deleteFileOnFirestore,
    createFromSnowflake: NOP,
    createFromScrivener: NOP,
    joinPath: (path, backup) => {
      return `${path}/${backup}`
    },
    renameFile: messageRenameFile,
    listOfflineFiles: () => [],
    rmRF: NOP,
  },
  update: {
    quitToInstall: NOP,
    downloadUpdate: NOP,
    checkForUpdates: NOP,
    onUpdateError: NOP,
    onUpdaterUpdateAvailable: NOP,
    onUpdaterUpdateNotAvailable: NOP,
    onUpdaterDownloadProgress: NOP,
    onUpdatorUpdateDownloaded: NOP,
    deregisterUpdateListeners: NOP,
  },
  updateLanguage: (newLanguage) => {
    window.location.reload()
  },
  updateBeatHierarchyFlag: (newValue) => {
    if (newValue) {
      store.dispatch(actions.featureFlags.setBeatHierarchy())
    } else {
      store.dispatch(actions.featureFlags.unsetBeatHierarchy())
    }
  },
  // A lot of the license wiring doesn't make sense for web.
  license: {
    deleteLicense: () => {},
    checkForActiveLicense: () => {},
    saveLicenseInfo: () => {},
    verifyLicense: () => {},
    // There isn't a way to start/extend a trial on web yet.
    startTrial: () => {},
    extendTrial: () => {},
    trial90days: [],
    trial60days: [],
    hasPro: () => true,
    checkForPro: async (email, callback) => {
      const [hasPro, info] = await userHasPro(email)
      callback(hasPro, info)
    },
  },
  reloadMenu: () => {
    // NO-OP
  },
  template: {
    deleteTemplate: messageToDeleteTemplate,
    editTemplateDetails: messageToEditTemplate,
    startSaveAsTemplate,
    saveTemplate: messageToSaveNewTemplate,
  },
  settings: { saveAppSetting },
  user: {
    get: () => {},
  },
  os: () => 'unknown',
  isDevelopment: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  isWindows: () => false,
  isMacOS: () => false,
  openExternal: (url) => {
    const withProtocol = url.match(/^[a-z]+:\/\//) ? url : `https://${url}`
    window.open(withProtocol, '_blank')
  },
  createErrorReport,
  createFullErrorReport: (fullState) => {
    createWebReport(fullState)
  },
  log: {
    info: (...args) => {
      logger.info(...args)
    },
    warn: (...args) => {
      logger.warn(...args)
    },
    error: (...args) => {
      logger.error(...args)
    },
  },
  dialog: {
    showErrorBox: (error) => {
      logger.error(error)
      if (typeof alert !== 'undefined' && error.message) alert(error.message)
    },
  },
  showSaveDialogSync: () => {
    // TODO
  },
  showOpenDialogSync: () => {
    // TODO
  },
  node: {
    env: process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? 'development' : 'production',
  },
  rollbar: {
    rollbarAccessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN || '',
    platform: 'web',
  },
  export: {
    saveExportConfigSettings,
    askToExport: exportFile,
    export_config: exportConfig,
    notifyUser,
    exportSaveDialog: NOP,
  },
  moveFromTemp: (fullFileState) => {
    const data = new Blob([JSON.stringify(fullFileState, null, 2)], { type: 'text/json' })
    const link = document.createElement('a')
    link.download = 'untitled.pltr'
    link.href = window.URL.createObjectURL(data)
    link.dataset.downloadurl = `text/json:${link.download}:${link.href}`
    link.dispatchEvent(new MouseEvent('click'), {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    link.remove()
  },
  showItemInFolder: (fileName) => {
    if (isStorageURL(fileName)) {
      backupPublicURL(fileName).then((url) => window.open(url, '_blank'))
    }
    logger.error('Attempted to open file at: ', fileName)
  },
  tempFilesPath: 'TODO',
  mpq: MPQ,
  handleCustomerServiceCode: () => {
    // TODO
  },
  browserHistory: history,
  inBrowser: true,
  templatesDisabled: false,
  exportDisabled: false,
  redux: {
    connect,
    bindActionCreators,
  },
  rootElementSelectors: ['#__next'],
  lockRCE,
  listenForRCELock,
  releaseRCELock,
  machineIdSync: () => {
    return uuidv4()
  },
  extractImages,
  storage: {
    saveImageToStorageBlob: (blob, name) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return saveImageToStorageBlobInFirebase(userId, name, blob)
    },
    saveImageToStorageFromURL: (url, name) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return saveImageToStorageFromURLInFirebase(userId, name, url)
    },
    resolveToPublicUrl: (storageUrl) => {
      if (!storageUrl) return null
      const state = store.getState()
      const {
        client: { userId },
        project: { selectedFile },
      } = state.present
      const fileId = selectedFile?.id
      if (!fileId || !userId) {
        return Promise.reject(
          'No file or you are not logged in.  Either way we cannot fetch a picture.'
        )
      }
      return imagePublicURL(storageUrl, fileId, userId)
    },
    isStorageURL,
    resizeImage,
  },
  firebase: {
    onSessionChange,
    currentUser,
    fetchFiles,
    logOut,
    saveCustomTemplate,
    uploadExisting,
  },
  login: {
    launchLoginPopup: () => {
      logger.warn('Calling NOP action: launchLoginPopup')
      // NOP.  On web we launch it at a different URL and then redirect.
    },
  },
}

const components = connections.pltr(platform)

export const DeleteConfirmModal = components.DeleteConfirmModal
export const ErrorModal = components.ErrorModal
export const ColorPickerColor = components.ColorPickerColor
export const ItemsManagerModal = components.ItemsManagerModal
export const ListItem = components.ListItem
export const PlottrModal = components.PlottrModal
export const EditAttribute = components.EditAttribute
export const RichText = components.RichText
export const editorRegistry = components.editorRegistry
export const Image = components.Image
export const ImagePicker = components.ImagePicker
export const MiniColorPicker = components.MiniColorPicker
export const Spinner = components.Spinner
export const FunSpinner = components.FunSpinner
export const FullPageSpinner = components.FullPageSpinner
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
