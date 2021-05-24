import { connections } from 'plottr_components'
import { history } from '../lib/history'

const platform = {
  appVersion: process.env.VERSION,
  template: {
    listTemplates: () => {},
    listCustomTemplates: () => {},
    deleteTemplate: () => {},
    editTemplateDetails: () => {},
    startSaveAsTemplate: (itemType) => {},
    saveTemplate: (payload) => {},
  },
  settings: {},
  user: {
    get: () => {},
  },
  os: 'unknown',
  isDevelopment: process.env.NODE_ENV === 'development',
  isWindows: false,
  isMacOS: false,
  openExternal: (url) => {},
  createErrorReport: () => {},
  log: {
    info: () => {},
    warn: () => {},
    error: () => {},
  },
  dialog: {},
  node: {
    env: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  },
  rollbar: {
    rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN || '',
    platform: '',
  },
  export: {
    askToExport: () => {},
    export_config: {},
  },
  store: {
    useExportConfigInfo: () => {},
  },
  // Save file.
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
  showItemInFolder: (fileName) => {},
  tempFilesPath: '',
  mpq: {
    push: () => {
      console.warn('TODO: implement MPQ!')
    },
  },
  browserHistory: history,
  inBrowser: true,
  templatesDisabled: true,
  exportDisabled: true,
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
