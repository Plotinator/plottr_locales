import { connections } from 'plottr_components'
import { history } from '../lib/history'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'
import { actions } from 'pltr/v2'
import { appVersion } from '../lib/version'
import {
  saveImageToStorageBlob as saveImageToStorageBlobInFirebase,
  publishRCEOperations,
  fetchRCEOperations,
  deleteFile,
  imagePublicURL,
  isStorageURL,
  listenForChangesToEditor,
} from 'plottr_firebase'
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
import {
  useCustomTemplatesInfo,
  useLicenseInfo,
  useSettingsInfo,
  useTemplatesInfo,
  removeFileFromList,
} from '../lib/store_hooks'
import { useTrialStatus } from '../lib/trialManager'
import { settings } from '../lib/settings'
import {
  messageOpenExistingFile,
  messageRenameFile,
  newEmptyFile,
  useSortedKnownFiles,
  newFile,
  openFile,
} from '../lib/files'
import { useBackupFolders } from '../lib/backups'
import { createErrorReport } from '../lib/createErrorReport'
import { closeDashboard } from '../lib/dashboard'

const deleteFileOnFirestore = (fileId) => {
  const state = store.getState()
  const {
    client: { userId, clientId },
  } = state.present
  deleteFile(fileId, userId, clientId).then(() => {
    removeFileFromList(fileId)
  })
}

const platform = {
  appVersion: appVersion(),
  defaultBackupLocation: 'cloud',
  setDarkMode: (value) => {
    store.dispatch(actions.ui.setDarkMode(value))
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

      openFile(userId, fileId, clientId, selectedFile.version, selectedFile.permission).then(() => {
        store.dispatch(actions.project.selectFile(selectedFile))
        closeDashboard()
      })
    },
    deleteKnownFile: (position, fileId) => {
      deleteFileOnFirestore(fileId)
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
    // TODO: Not working:
    // settings.set('locale', newLanguage)
    // setupI18n(settings, {})
  },
  updateBeatHierarchyFlag: (newValue) => {
    if (newValue) {
      store.dispatch(actions.featureFlags.setBeatHierarchy())
    } else {
      store.dispatch(actions.featureFlags.unsetBeatHierarchy())
    }
  },
  license: {
    useLicenseInfo,
    checkForActiveLicense: () => {
      // TODO
    },
    useTrialStatus,
    licenseStore: () => {
      // TODO
    },
    verifyLicense: () => {
      // TODO
    },
    trial90days: [],
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
    window.location.href = url
  },
  createErrorReport,
  log: {
    info: () => {
      // TODO
    },
    warn: () => {
      // TODO
    },
    error: () => {
      // TODO
    },
  },
  dialog: {
    showErrorBox: (error) => {
      console.error(error)
      alert(error)
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
    platform: 'TODO',
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
    // Nop
  },
  tempFilesPath: 'TODO',
  mpq: {
    push: () => {
      console.warn('TODO: implement MPQ!')
    },
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
  fetchRCEOperations,
  listenForChangesToEditor,
  machineIdSync: () => {
    return uuidv4()
  },
  storage: {
    saveImageToStorageBlob: (blob, name) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return saveImageToStorageBlobInFirebase(userId, name, blob)
    },
    resolveToPublicUrl: (storageUrl) => {
      if (!storageUrl) return null
      return imagePublicURL(storageUrl)
    },
    isStorageURL,
    imagePublicURL,
  },
}

const components = connections.pltr(platform)

export const DeleteConfirmModal = components.DeleteConfirmModal
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
