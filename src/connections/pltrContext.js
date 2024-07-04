import React from 'react'

/**
 * @return {any}
 */
const ZERO_ARG_NOT_IMPLEMENTED = () => {}

/**
 * @return {Promise<string>}
 */
function hostLocale() {
  return Promise.resolve('unimplemented')
}

/**
 * @return {Promise<string>}
 */
function appVersion() {
  return Promise.resolve('unimplemented')
}

/**
 * @return {Promise<string>}
 */
function defaultBackupLocation() {
  return Promise.resolve('unimplemented')
}

/**
 * @param {string} _mode
 */
function setDarkMode(_mode) {}

/**
 * @param {null|object} _template
 * @param {string} _name
 */
function createNew(_template, _name) {}

/**
 * @param {string} _fileURL
 * @returns {Promise<boolean>}
 */
function doesFileExist(_fileURL) {
  return Promise.resolve(false)
}

/**
 * @return {Promise<string>}
 */
function pathSep() {
  return Promise.resolve('unimplemented')
}

/**
 * @param {string} _filePath
 * @return {Promise<string>}
 */
function basename(_filePath) {
  return Promise.resolve('unimplemented')
}

/**
 * @param {string} _filePath
 * @return {Promise<[string]>}
 */
function filePathAsArray(_filePath) {
  return Promise.resolve(['unimplemented'])
}

/**
 * @param {string} _fileURL
 * @param {boolean} _unknown
 */
function openKnownFile(_fileURL, _unknown) {}

/**
 * @param {string} _fileURL
 */
function deleteKnownFile(_fileURL) {}

/**
 * @param {string} _oldFileURL
 * @param {string} _newFileURL
 * @return {Promise<void>}
 */
function editKnownFilePath(_oldFileURL, _newFileURL) {
  return Promise.resolve()
}

/**
 * @param {string} _fileURL
 * @return {Promise<void>}
 */
function renameFile(_fileURL) {
  return Promise.resolve()
}

/**
 * @param {string} _fileURL
 * @return {Promise<void>}
 */
function removeFromKnownFiles(_fileURL) {
  return Promise.resolve()
}

/**
 * @param {string} _fileURL
 * @param {string} _file
 * @returns {Promise<void>}
 */
function saveFile(_fileURL, _file) {
  return Promise.resolve()
}

/**
 * @param {string} _sourceFileURL
 * @param {string} _destinationURL
 * @returns {Promise<string>}
 */
function createFileShortcut(_sourceFileURL, _destinationURL) {
  return Promise.resolve('unimplemented')
}

/**
 * @param {string} _fileURL
 * @returns {object}
 */
function readFile(_fileURL) {
  return Promise.resolve({})
}

/**
 * @param {string} _filePath
 * @param {string|Buffer} _data
 * @returns {Promise<void>}
 */
function writeFile(_filePath, _data) {
  return Promise.resolve()
}

/**
 * @param {string} _importedPath
 */
function createFromSnowflake(_importedPath) {}

/**
 * @param {string} _importedPath
 */
function createFromScrivener(_importedPath) {}

/**
 * @param {string} _importedPath
 */
function createFromWord(_importedPath) {}

/**
 * @param {...string} _args
 * @returns {Promise<string>}
 */
function joinPath(..._args) {
  return Promise.resolve('unimplemented')
}

/**
 * @param {string} _path
 * @returns {Promise<object>}
 */
function stat(_path) {
  return Promise.resolve({})
}

/**
 * @param {string} _path
 * @returns {Promise<void>}
 */
function mkdir(_path) {
  return Promise.resolve()
}

/**
 * @returns {Promise<[object]>}
 */
function listOfflineFiles() {
  return Promise.resolve([{}])
}

/**
 * @param {string} _oldFilePath
 * @param {string} _newFileName
 * @returns {Promise<void>}
 */
function createAndOpenCopy(_oldFilePath, _newFileName) {
  return Promise.resolve()
}

/**
 * @param {string} _filePath
 * @returns {Promise<boolean>}
 */
function directoryIsWritable(_filePath) {
  return Promise.resolve(false)
}

/**
 * @param {(error: Error, object: object) => void} _cb
 */
function onUpdateError(_cb) {}

/**
 * @param {(info: object) => void} _cb
 */
function onUpdaterUpdateAvailable(_cb) {}

/**
 * @param {() => void} _cb
 */
function onUpdaterUpdateNotAvailable(_cb) {}

/**
 * @param {(info: object) => void} _cb
 */
function onUpdaterDownloadProgress(_cb) {}

/**
 * @param {(info: object) => void} _cb
 */
function onUpdatorUpdateDownloaded(_cb) {}

/**
 * @param {string} _newLanguage
 * @returns {Promise<void>}
 */
function updateLanguage(_newLanguage) {
  return Promise.resolve()
}

/**
 * @returns {Promise<void>}
 */
function startTrial() {
  return Promise.resolve()
}

/**
 * @returns {Promise<void>}
 */
function deleteLicense() {
  return Promise.resolve()
}

/**
 * @returns {Promise<void>}
 */
function saveLicenseInfo() {
  return Promise.resolve()
}

/**
 * @returns {Promise<void>}
 */
function deletePlottrLicense() {
  return Promise.resolve()
}

/**
 * @returns {Promise<void>}
 */
function deleteProLicense() {
  return Promise.resolve()
}

/**
 * @returns {Promise<void>}
 */
function checkForLicense() {
  return Promise.resolve()
}

/**
 * @param {string} _templateId
 * @returns {Promise<void>}
 */
function deleteTemplate(_templateId) {
  return Promise.resolve()
}

/**
 * @param {string} _templateId
 * @param {object} _templateDetails
 */
function editTemplateDetails(_templateId, _templateDetails) {}

/**
 * @param {string} _itemType
 */
function startSaveAsTemplate(_itemType) {}

/**
 * @param {object} _payload
 */
function saveTemplate(_payload) {}

/**
 * @param {string} _key
 * @param {string | boolean | null | object} _value
 * @returns {Promise<void>}
 */
function saveAppSetting(_key, _value) {
  return Promise.resolve()
}

/**
 * @returns {string}
 */
function os() {
  return 'unimplemented'
}

/**
 * @param {string} _url
 * @returns {Promise<void>}
 */
function openExternal(_url) {
  return Promise.resolve()
}

/**
 * @param {Error|string} _error
 * @param {object} _errorInfo
 * @returns {Promise<void>}
 */
function createErrorReport(_error, _errorInfo) {
  return Promise.resolve()
}

/**
 * @returns {void}
 */
function createFullErrorReport() {}

/**
 * @param {string} _code
 */
function handleCustomerServiceCode(_code) {}

/**
 * @param {...string} _args
 */
function info(..._args) {}

/**
 * @param {...string} _args
 */
function warn(..._args) {}

/**
 * @param {string|Error} _errorOrMessage
 * @param {...any} _args
 */
function error(_errorOrMessage, ..._args) {}

/**
 * @param {string} _title
 * @param {Array<any>} _filters
 * @param {object} _properties
 * @param {string} _defaultPath
 * @returns {Promise<Array<any>>}
 */
function showOpenDialog(_title, _filters, _properties, _defaultPath) {
  return Promise.resolve([])
}

/**
 * @param {Array<any>} _filters
 * @param {string} _title
 * @param {string} _defaultPath
 * @returns {Promise<void>}
 */
function showSaveDialog(_filters, _title, _defaultPath) {
  return Promise.resolve()
}

/**
 * @param {string} _title
 * @param {string} _message
 * @returns {Promise<void>}
 */
function showErrorBox(_title, _message) {
  return Promise.resolve()
}

/**
 * @returns {Promise<string>}
 */
function userDocumentsPath() {
  return Promise.resolve('unimplemented')
}

/**
 * @returns {Promise<string>}
 */
function userFilePickerDefaultFolder() {
  return Promise.resolve('unimplemented')
}

/**
 * Import entities from a local Plottr project into the current
 * project by presenting the user with a dialog to pick the file and a
 * dialog to choose what to import.
 *
 * @param {string} _fileUrl
 * @param {any} _properties
 * @returns Promise<void>
 */
function importExistingFile(_fileUrl, _properties) {
  return Promise.resolve()
}

/**
 * Instruct plottr to display a list of recent files in a mode that
 * enables the user to pick a file to import aspects of into the
 * current project.
 *
 * @returns void
 */
function showRecentFilesInImportModal() {
  return Promise.resolve()
}

/**
 * Import entities from a Plottr Pro project by fetching the project
 * from Pro and then presenting the user with a dialog to select what
 * to import into the current project.
 *
 * @param {any} _file
 * @returns Promise<void>
 */
function importExistingCloudFile(_file) {
  return Promise.resolve()
}

/**
 * @param {string} _fileURL
 * @returns {Promise<void>}
 */
function pleaseOpenWindow(_fileURL) {
  return Promise.resolve()
}

/**
 * @param {string} _fileURL
 */
function addToKnownFilesAndOpen(_fileURL) {
  return Promise.resolve()
}

/**
 * @param {string} _accessToken
 * @param {string} _appVersion
 * @param {string} _environment
 * @param {object} _logger
 * @param {string} _context
 * @param {string} _os
 * @param {string} _userId
 * @param {string} _userEmail
 * @param {string} _fileURL
 * @returns {{ error: (message: string, error: Error) => void }}
 */
function errorReporter(
  _accessToken,
  _appVersion,
  _environment,
  _logger,
  _context,
  _os,
  _userId,
  _userEmail,
  _fileURL
) {
  return { error: (_message, _error) => {} }
}

/**
 * @returns {Promise<string>}
 */
function platform() {
  return Promise.resolve('unimplemented')
}

/**
 * @returns {Promise<{error: (message: string, error: Error) => void}>}
 */
function getInstance() {
  return Promise.resolve({ error: (_message, _error) => {} })
}

/**
 * @param {string} _defaultPath
 * @param {object} _fullState
 * @param {string} _type
 * @param {object} _options
 * @param {string} _userId
 * @returns {Promise<void>}
 */
function askToExport(_defaultPath, _fullState, _type, _options, _userId) {
  return Promise.resolve()
}

/**
 * @param {string} _key
 * @param {string} _value
 * @returns {Promise<void>}
 */
function saveExportConfigSettings(_key, _value) {
  return Promise.resolve()
}

/**
 * @param {string} _exportPath
 * @param {string} _type
 */
function notifyUser(_exportPath, _type) {}

/**
 * @param {string} _defaultPath
 * @param {string} _type
 * @returns {Promise<void>}
 */
function exportSaveDialog(_defaultPath, _type) {
  return Promise.resolve()
}

/**
 * @param {string} _fileUrl
 * @param {string} _suggestedNewName
 * @param {boolean} _forceCloseWhenDone
 */
function duplicateFile(_fileUrl, _suggestedNewName, _forceCloseWhenDone) {}

/**
 * @param {string} _fileURL
 * @param {string} _fileName
 */
function showItemInFolder(_fileURL, _fileName) {}

/**
 * @param {string} _fileId
 * @param {string} _editorId
 * @param {string} _clientId
 * @param {(lock: object) => void} _cb
 */
function listenForRCELock(_fileId, _editorId, _clientId, _cb) {}

/**
 * @param {string} _fileId
 * @param {string} _rawEditorId
 * @param {string} _clientId
 * @param {string} _expectedLock
 * @param {string} _emailAddress
 * @returns {Promise<string>}
 */
function lockRCE(_fileId, _rawEditorId, _clientId, _expectedLock, _emailAddress) {
  return Promise.resolve('unimplemented')
}

/**
 * @param {string} _fileId
 * @param {string} _editorId
 * @param {object} _expectedLock
 * @return {Promise<void>}
 */
function releaseRCELock(_fileId, _editorId, _expectedLock) {
  return Promise.resolve()
}

/**
 * @returns {Promise<void>}
 */
function machineId() {
  return Promise.resolve()
}

/**
 * @returns Promise<{ id: string, os: string, name: string, localUserName: string }>
 */
function machineInfo() {
  return Promise.resolve({
    id: '',
    os: '',
    name: '',
    localUserName: '',
  })
}

/**
 * @param {string} _file
 * @param {string} _userId
 * @returns Promise<any>
 */
function extractImages(_file, _userId) {
  return Promise.resolve({})
}

/**
 * @typedef User
 * @property {string} uid
 * @property {string} email
 * @param {function(User | null): void} _cb
 */
function onSessionChange(_cb) {}

/**
 * @return {Promise<User | null>}
 */
function currentUser() {
  return Promise.resolve(null)
}

/**
 * @param {string} _userId
 * @returns Promise<[object]>
 */
function fetchFiles(_userId) {
  return Promise.resolve([])
}

/**
 * @returns {Promise<void>}
 */
function logOut() {
  return Promise.resolve()
}

/**
 * @param {string} _userId
 * @param {object} _template
 * @return {Promise<void>}
 */
function saveCustomTemplate(_userId, _template) {
  return Promise.resolve()
}

/**
 * @param {string} _emailAddress
 * @param {string} _userId
 * @param {object} _fullState
 * @returns {Promise<void>}
 */
function uploadExisting(_emailAddress, _userId, _fullState) {
  return Promise.resolve()
}

/**
 * @param {string} _url
 * @returns {Promise<boolean>}
 */
function isStorageURL(_url) {
  return Promise.resolve(false)
}

/**
 * @param {string} _storageURL
 * @returns {Promise<string>}
 */
function resolveToPublicUrl(_storageURL) {
  return Promise.resolve('')
}

/**
 * @param {any} _blob
 * @param {string} _name
 * @returns {Promise<void>}
 */
function saveImageToStorageBlob(_blob, _name) {
  return Promise.resolve()
}

/**
 * @param {string} _url
 * @param {string} _name
 * @returns {Promise<void>}
 */
function saveImageToStorageFromURL(_url, _name) {
  return Promise.resolve()
}

/**
 * @param {object} _file
 * @param {function(object): void} _callback
 */
function resizeImage(_file, _callback) {}

/**
 * @param {string} _storageURL
 * @param {string} _fileId
 * @param {string} _userId
 * @returns {Promise<Blob>}
 */
function downloadStorageImage(_storageURL, _fileId, _userId) {
  return Promise.resolve(new Blob())
}

/**
 * @param {[string]} _sourceFilePathSegments
 * @param {string} _newName
 * @return {Promise<void>}
 */
function uploadToProAsDuplicate(_sourceFilePathSegments, _newName) {
  return Promise.resolve()
}

/**
 * @param {string} _backupRecordId
 * @param {string} _storageProtocolURL
 * @returns {Promise<void>}
 */
function deleteProBackup(_backupRecordId, _storageProtocolURL) {
  return Promise.resolve()
}

/**
 * @param {string} _id
 * @param {string} _os
 * @param {string} _name
 * @param {string} _localUserName
 * @returns {Promise<void>}
 */
function deleteMachineLicenseActivation(_id, _os, _name, _localUserName) {
  return Promise.resolve()
}

/**
 * @param {any} _state
 * @returns any
 */
function mountState(_state) {
  return {}
}

/**
 * @returns boolean
 */
function isWindows() {
  return false
}

/**
 * @returns boolean
 */
function isMacOS() {
  return false
}

export const PlottrComponentsContext = React.createContext({
  platform: {
    undo: ZERO_ARG_NOT_IMPLEMENTED,
    redo: ZERO_ARG_NOT_IMPLEMENTED,
    hostLocale,
    appVersion,
    defaultBackupLocation,
    setDarkMode,
    appQuit: ZERO_ARG_NOT_IMPLEMENTED,
    file: {
      createNew,
      openExistingFile: ZERO_ARG_NOT_IMPLEMENTED,
      doesFileExist,
      pathSep,
      basename,
      filePathAsArray,
      // FIXME: this is very poorly named.  Esp. since the second
      // parametor is a flag for whether the file is known XD
      openKnownFile,
      deleteKnownFile,
      editKnownFilePath,
      renameFile,
      removeFromKnownFiles,
      saveFile,
      createFileShortcut,
      readFile,
      writeFile,
      createFromSnowflake,
      createFromScrivener,
      createFromWord,
      joinPath,
      stat,
      mkdir,
      listOfflineFiles,
      createAndOpenCopy,
      directoryIsWritable,
    },
    update: {
      quitToInstall: ZERO_ARG_NOT_IMPLEMENTED,
      downloadUpdate: ZERO_ARG_NOT_IMPLEMENTED,
      checkForUpdates: ZERO_ARG_NOT_IMPLEMENTED,
      onUpdateError,
      onUpdaterUpdateAvailable,
      onUpdaterUpdateNotAvailable,
      onUpdaterDownloadProgress,
      onUpdatorUpdateDownloaded,
      deregisterUpdateListeners: ZERO_ARG_NOT_IMPLEMENTED,
    },
    updateLanguage,
    license: {
      startTrial,
      deleteLicense,
      saveLicenseInfo,
      deletePlottrLicense,
      deleteProLicense,
      checkForLicense,
    },
    reloadMenu: ZERO_ARG_NOT_IMPLEMENTED,
    template: {
      deleteTemplate,
      editTemplateDetails,
      startSaveAsTemplate,
      saveTemplate,
    },
    settings: {
      saveAppSetting,
    },
    os,
    isDevelopment: false,
    isWindows,
    isMacOS,
    openExternal,
    createErrorReport,
    createFullErrorReport,
    handleCustomerServiceCode,
    log: {
      info,
      warn,
      error,
    },
    showOpenDialog,
    showSaveDialog,
    showErrorBox,
    userDocumentsPath,
    userFilePickerDefaultFolder,
    pleaseOpenWindow,
    importExistingCloudFile,
    showRecentFilesInImportModal,
    importExistingFile,
    addToKnownFilesAndOpen,
    node: {
      env: '',
    },
    errorReporter: {
      errorReporterAccessToken: '',
      errorReporter,
      platform,
      getInstance,
    },
    rollbar: {
      // DEPRECATED
      rollbarAccessToken: '',
      platform,
    },
    export: {
      askToExport,
      // TODO: consider using actual type
      export_config: {},
      saveExportConfigSettings,
      notifyUser,
      exportSaveDialog,
    },
    moveFromTemp: ZERO_ARG_NOT_IMPLEMENTED,
    duplicateFile,
    showItemInFolder,
    mpq: {},
    rootElementSelectors: ['body'],
    templatesDisabled: false,
    exportDisabled: false,
    listenForRCELock,
    lockRCE,
    releaseRCELock,
    machineId,
    machineInfo,
    extractImages,
    firebase: {
      onSessionChange,
      currentUser,
      fetchFiles,
      logOut,
      saveCustomTemplate,
      uploadExisting,
    },
    login: {
      launchLoginPopup: ZERO_ARG_NOT_IMPLEMENTED,
    },
    storage: {
      isStorageURL,
      resolveToPublicUrl,
      saveImageToStorageBlob,
      saveImageToStorageFromURL,
      resizeImage,
      downloadStorageImage,
    },
    uploadToProAsDuplicate,
    deleteProBackup,
    deleteMachineLicenseActivation,
    // Use in cases where we get something that looks roughly like the
    // user state and we want it to appear at the right place for
    // selectors to find it.
    mountState,
  },
})
