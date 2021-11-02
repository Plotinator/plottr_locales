import { connections } from 'plottr_components'
import { ActionCreators } from 'redux-undo'
import { history } from '../lib/history'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'
import { actions } from 'pltr/v2'
import { appVersion } from '../lib/version'
import {
  saveImageToStorageBlob as saveImageToStorageBlobInFirebase,
  saveImageToStorageFromURL as saveImageToStorageFromURLInFirebase,
  publishRCEOperations,
  fetchRCEOperations,
  deleteFile,
  imagePublicURL,
  isStorageURL,
  listenForChangesToEditor,
  deleteChangeSignal,
  deleteOldChanges,
  backupPublicURL,
  lockRCE,
  listenForRCELock,
  releaseRCELock,
  logOut,
  startUI,
  firebaseUI,
  onSessionChange,
  currentUser,
  fetchFiles,
  saveCustomTemplate,
} from 'wired-up-firebase'
import {
  getTemplateById,
  listTemplates,
  listCustomTemplates,
  startSaveAsTemplate,
  messageToSaveNewTemplate,
  messageToEditTemplate,
  messageToDeleteTemplate,
  useFilteredSortedTemplates,
} from '../lib/templates'
import { useExportConfigInfo } from '../lib/exportConfig'
import export_config from '../lib/exporter/default_config'
import { exportFile } from '../lib/export'
import { store } from '../lib/redux'
import { useCustomTemplatesInfo, useSettingsInfo, useTemplatesInfo } from '../lib/store_hooks'
import { useTrialStatus } from '../lib/trialManager'
import { settings } from '../lib/settings'
import {
  messageOpenExistingFile,
  messageRenameFile,
  newEmptyFile,
  useSortedKnownFiles,
  newFile,
  openFile,
  uploadExisting,
} from '../lib/files'
import { useBackupFolders } from '../lib/backups'
import { createErrorReport } from '../lib/createErrorReport'
import { closeDashboard } from '../lib/dashboard'
import { userHasPro } from '../lib/checkPro'
import MPQ from '../lib/MPQ'
import { resizeImage } from '../lib/resizeImage'
import extractImages from '../lib/extractImages'
import { useProLicenseInfo } from '../lib/checkPro'
import { logger } from '../lib/logger'

const deleteFileOnFirestore = (fileId) => {
  const state = store.getState()
  const {
    client: { userId, clientId },
  } = state.present
  return deleteFile(fileId, userId, clientId)
}

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
    createNew: (template) => {
      const state = store.getState()
      const {
        client: { emailAddress, userId, clientId },
        project: { fileList },
      } = state.present
      const untitledFileList = fileList.filter(({ fileName }) => fileName.match(/Untitled/g))
      const fileName = t('Untitled') + ` - ${untitledFileList.length}`
      const setFileList = (...args) => store.dispatch(actions.project.setFileList(...args))
      const selectFile = (...args) => store.dispatch(actions.project.selectFile(...args))
      const newFileState = Object.assign(
        newEmptyFile(fileName, appVersion(), state.present),
        template || {}
      )
      newFile(
        emailAddress,
        userId,
        fileName,
        { present: newFileState },
        setFileList,
        selectFile,
        clientId
      ).then(() => {
        closeDashboard()
      })
    },
    openExistingFile: messageOpenExistingFile,
    doesFileExist: () => {
      // NOP.  We don't expect the API to reply with non-existant files.
      return true
    },
    useSortedKnownFiles,
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
        project: { fileList },
      } = state.present
      const selectedFile = fileList.find((thatFile) => thatFile.id === fileId)
      if (!selectedFile) return

      store.dispatch(actions.project.showLoader(true))
      openFile(userId, fileId, clientId, selectedFile.version, selectedFile.permission)
        .then(() => {
          store.dispatch(actions.project.selectFile(selectedFile))
          store.dispatch(actions.project.showLoader(false))
          closeDashboard()
          logger.info(`Opened file: ${fileId}`)
        })
        .catch((error) => {
          store.dispatch(actions.project.showLoader(false))
          store.dispatch(actions.error.generalError(error))
          logger.error(`Error opening file: ${fileId}`, error)
        })
    },
    deleteKnownFile: (position, fileId) => {
      store.dispatch(actions.project.showLoader(true))
      deleteFileOnFirestore(fileId)
        .then(() => {
          store.dispatch(actions.project.showLoader(false))
          logger.info(`Deleted file with id: ${fileId}`)
        })
        .catch((error) => {
          store.dispatch(actions.project.showLoader(false))
          store.dispatch(actions.error.generalError(error))
          logger.error(`Error deleting file: ${fileId}`, error)
        })
    },
    editKnownFilePath: (oldFilePath, newFilePath) => {
      // Nop: you can't change where a file is on the web.
    },
    removeFromKnownFiles: (id) => {
      // TODO: not sure what the best thing to do is if all we have is
      // a position id.
    },
    saveFile: (filePath, file) => {
      // Nop: files are saved as we go.
    },
    readFileSync: () => {
      // Nop: no such thing as reading synchronously from the file
      // system when we're using cloud storage.
    },
    moveItemToTrash: deleteFileOnFirestore,
    createFromSnowflake: (importedPath) => {
      // TODO
    },
    joinPath: (path, backup) => {
      return `${path}/${backup}`
    },
    renameFile: messageRenameFile,
  },
  update: {
    quitToInstall: () => {
      // Nop
    },
    downloadUpdate: () => {
      // Nop
    },
    checkForUpdates: () => {
      // Nop
    },
    onUpdateError: (cb) => {
      // Nop
    },
    onUpdaterUpdateAvailable: (cb) => {
      // Nop
    },
    onUpdaterUpdateNotAvailable: (cb) => {
      // Nop
    },
    onUpdaterDownloadProgress: (cb) => {
      // Nop
    },
    onUpdatorUpdateDownloaded: (cb) => {
      // Nop
    },
    deregisterUpdateListeners: () => {
      // Nop
    },
  },
  updateLanguage: (newLanguage) => {
    // Nop: This is handled adequately by OptionsHome.
  },
  updateBeatHierarchyFlag: (newValue) => {
    if (newValue) {
      store.dispatch(actions.featureFlags.setBeatHierarchy())
    } else {
      store.dispatch(actions.featureFlags.unsetBeatHierarchy())
    }
  },
  license: {
    useLicenseInfo: () => [],
    checkForActiveLicense: () => {},
    useTrialStatus,
    licenseStore: () => {},
    verifyLicense: () => {},
    trial90days: [],
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
    TemplateFetcher: {}, // TODO
    listTemplates,
    listCustomTemplates,
    getTemplateById,
    deleteTemplate: messageToDeleteTemplate,
    editTemplateDetails: messageToEditTemplate,
    startSaveAsTemplate,
    saveTemplate: messageToSaveNewTemplate,
    useFilteredSortedTemplates,
    useCustomTemplatesInfo,
    useTemplatesInfo,
  },
  settings,
  useSettingsInfo,
  user: {
    get: () => {},
  },
  os: 'unknown',
  isDevelopment: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  isWindows: false,
  isMacOS: false,
  openExternal: (url) => {
    const withProtocol = url.match(/^[a-z]+:\/\//) ? url : `https://${url}`
    window.open(withProtocol, '_blank')
  },
  createErrorReport,
  createFullErrorReport: () => {},
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
      if (typeof alert !== 'undefined') alert(error)
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
    askToExport: exportFile,
    export_config,
  },
  store: {
    useExportConfigInfo,
  },
  useBackupFolders,
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
  publishRCEOperations,
  lockRCE,
  listenForRCELock,
  releaseRCELock,
  deleteChangeSignal,
  deleteOldChanges,
  fetchRCEOperations,
  listenForChangesToEditor,
  machineIdSync: () => {
    return uuidv4()
  },
  extractImages,
  useProLicenseInfo,
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
    imagePublicURL,
    resizeImage,
  },
  firebase: {
    startUI,
    firebaseUI,
    onSessionChange,
    currentUser,
    fetchFiles,
    logOut,
    saveCustomTemplate,
    uploadExisting,
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
