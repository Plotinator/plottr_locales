import { connections } from 'plottr_components'
import { history } from '../lib/history'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { v4 as uuidv4 } from 'uuid'

import { actions } from 'pltr/v2'
import { appVersion } from '../lib/version'
import { publishRCEOperations, fetchRCEOperations } from '../lib/firebase'
import {
  getTemplateById,
  listTemplates,
  listCustomTemplates,
  startSaveAsTemplate,
  messageToSaveNewTemplate,
  messageToEditTemplate,
  messageToDeleteTemplate,
} from '../lib/templates'
import { useExportConfigInfo } from '../lib/exportConfig'
import export_config from '../lib/exporter/default_config'
import { exportFile } from '../lib/export'
import { store } from '../lib/redux'
import { useLicenseInfo, useSettingsInfo } from '../lib/store_hooks'
import { useTrialStatus } from '../lib/trialManager'
import { settings } from '../lib/settings'
import { useSortedKnownFiles } from '../lib/files'

const platform = {
  appVersion: appVersion(),
  defaultBackupLocation: 'TODO',
  setDarkMode: (value) => {
    store.dispatch(actions.ui.setDarkMode(value))
  },
  file: {
    createNew: (template) => {
      // TODO
    },
    openExistingFile: () => {
      // TODO
    },
    doesFileExist: () => {
      // TODO
    },
    useSortedKnownFiles,
    isTempFile: () => {
      // TODO
    },
    pathSep: 'todo',
    basename: () => {
      // TODO
    },
    openKnownFile: (filePath, id, unknown) => {
      // TODO
    },
    deleteKnownFile: (id, path) => {
      // TODO
    },
    editKnownFilePath: (oldFilePath, newFilePath) => {
      // TODO
    },
    removeFromKnownFiles: (id) => {
      // TODO
    },
    saveFile: (filePath, file) => {
      // TODO
    },
    readFileSync: () => {
      // TODO
    },
    moveItemToTrash: () => {
      // TODO
    },
    createFromSnowflake: (importedPath) => {
      // TODO
    },
    joinPath: () => {
      // TODO
    },
  },
  update: {
    quitToInstall: () => {
      // TODO
    },
    downloadUpdate: () => {
      // TODO
    },
    checkForUpdates: () => {
      // TODO
    },
    onUpdateError: (cb) => {
      // TODO
    },
    onUpdaterUpdateAvailable: (cb) => {
      // TODO
    },
    onUpdaterUpdateNotAvailable: (cb) => {
      // TODO
    },
    onUpdaterDownloadProgress: (cb) => {
      // TODO
    },
    onUpdatorUpdateDownloaded: (cb) => {
      // TODO
    },
    deregisterUpdateListeners: () => {
      // TODO
    },
  },
  updateLanguage: (newLanguage) => {
    // TODO
  },
  updateBeatHierarchyFlag: (newValue) => {
    // TODO
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
    TemplateFetcher: null, // TODO
    listTemplates,
    listCustomTemplates,
    getTemplateById,
    deleteTemplate: messageToDeleteTemplate,
    editTemplateDetails: messageToEditTemplate,
    startSaveAsTemplate,
    saveTemplate: messageToSaveNewTemplate,
    useFilteredSortedTemplates: () => {
      // TODO
    },
    useCustomTemplatesInfo: () => {
      // TODO
    },
    useTemplatesInfo: () => {
      // TODO
    },
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
  createErrorReport: () => {
    // TODO
  },
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
    // NO-OP
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
  machineIdSync: () => {
    return uuidv4()
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
