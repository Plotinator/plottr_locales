import React from 'react'

const NO_DEFAULT = () => {
  throw new Error('No function wired-up for context value')
}

/**
 * @param {string} filePath
 * @returns {Promise<String>}
 */
const readFile = (filePath) => {
  return Promise.resolve('unimplemented')
}

/**
 * @param {String} _fileURL
 * @param {String} _data
 * @returns
 */
const saveOfflineFile = (_fileURL, _data) => {
  return Promise.resolve()
}

/**
 * @param {String} _fileURL
 * @param {String} _data
 * @returns
 */
const saveFile = (_fileURL, _data) => {
  return Promise.resolve()
}

/**
 * @param {String} _filePath
 */
const basename = (_filePath) => {
  return Promise.resolve('not implemented')
}

/**
 * @param {String} _filePath
 * @param {String} _file
 * @returns {Promise<void>}
 */
const saveBackup = (_filePath, _file) => {
  return Promise.resolve()
}

/**
 * @param {String} _file
 * @returns {Promise<void>}
 */
const backupOfflineBackupForResume = (_file) => {
  return Promise.resolve()
}

/**
 * @param {string} _key
 * @param {string | boolean | null | object} _value
 * @returns {Promise<void>}
 */
const saveAppSetting = (_key, _value) => {
  return Promise.resolve()
}

/**
 * @param {String} _title
 * @param {String} _message
 */
const showErrorBox = (_title, _message) => {}

const MainIntegrationContext = React.createContext({
  saveOfflineFile,
  saveFile,
  basename,
  readFile,
  saveBackup,
  backupOfflineBackupForResume,
  saveAppSetting,
  showErrorBox,
  localClient: {
    ping: NO_DEFAULT,
    rmRf: NO_DEFAULT,
    saveFile: NO_DEFAULT,
    saveRawFile: NO_DEFAULT,
    saveOfflineFile: NO_DEFAULT,
    basename: NO_DEFAULT,
    readFile: NO_DEFAULT,
    saveBackup: NO_DEFAULT,
    ensureBackupFullPath: NO_DEFAULT,
    ensureBackupTodayPath: NO_DEFAULT,
    fileExists: NO_DEFAULT,
    backupOfflineBackupForResume: NO_DEFAULT,
    readOfflineFiles: NO_DEFAULT,
    isTempFile: NO_DEFAULT,
    setTemplate: NO_DEFAULT,
    setCustomTemplate: NO_DEFAULT,
    deleteCustomTemplate: NO_DEFAULT,
    defaultBackupLocation: NO_DEFAULT,
    offlineFileURL: NO_DEFAULT,
    offlineFileBasePath: NO_DEFAULT,
    customTemplatesPath: NO_DEFAULT,
    copyFile: NO_DEFAULT,
    createFileShortcut: NO_DEFAULT,
    attemptToFetchTemplates: NO_DEFAULT,
    saveAsTempFile: NO_DEFAULT,
    removeFromKnownFiles: NO_DEFAULT,
    deleteKnownFile: NO_DEFAULT,
    updateKnownFileName: NO_DEFAULT,
    saveToDefaultLocation: NO_DEFAULT,
    addKnownFile: NO_DEFAULT,
    editKnownFilePath: NO_DEFAULT,
    updateLastOpenedDate: NO_DEFAULT,
    // File system APIs
    backupBasePath: NO_DEFAULT,
    currentTrial: NO_DEFAULT,
    startTrial: NO_DEFAULT,
    extendTrialWithReset: NO_DEFAULT,
    currentLicense: NO_DEFAULT,
    deleteLicense: NO_DEFAULT,
    deletePlottrLicense: NO_DEFAULT,
    deleteProLicense: NO_DEFAULT,
    saveLicenseInfo: NO_DEFAULT,
    currentKnownFiles: NO_DEFAULT,
    currentTemplates: NO_DEFAULT,
    currentCustomTemplates: NO_DEFAULT,
    currentTemplateManifest: NO_DEFAULT,
    currentExportConfigSettings: NO_DEFAULT,
    saveExportConfigSettings: NO_DEFAULT,
    currentAppSettings: NO_DEFAULT,
    saveAppSetting: NO_DEFAULT,
    currentBackups: NO_DEFAULT,
    listenToTrialChanges: NO_DEFAULT,
    listenToLicenseChanges: NO_DEFAULT,
    listenToknownFilesChanges: NO_DEFAULT,
    listenToTemplatesChanges: NO_DEFAULT,
    listenToCustomTemplatesChanges: NO_DEFAULT,
    listenToTemplateManifestChanges: NO_DEFAULT,
    listenToExportConfigSettingsChanges: NO_DEFAULT,
    listenToAppSettingsChanges: NO_DEFAULT,
    listenToBackupsChanges: NO_DEFAULT,
    listenToPlottrLicenseChanges: NO_DEFAULT,
    listenToProLicenseChanges: NO_DEFAULT,
    lastOpenedFile: NO_DEFAULT,
    setLastOpenedFilePath: NO_DEFAULT,
    nukeLastOpenedFileURL: NO_DEFAULT,
    shutdown: NO_DEFAULT,
    writeFile: NO_DEFAULT,
    join: NO_DEFAULT,
    pathSep: NO_DEFAULT,
    trash: NO_DEFAULT,
    extname: NO_DEFAULT,
    resolvePath: NO_DEFAULT,
    readdir: NO_DEFAULT,
    stat: NO_DEFAULT,
    mkdir: NO_DEFAULT,
    close: NO_DEFAULT,
    inBadState: NO_DEFAULT,
    findUniqueNameInPath: NO_DEFAULT,
    filePathAsArray: NO_DEFAULT,
    directoryIsWritable: NO_DEFAULT,
    currentPlottrLicense: NO_DEFAULT,
    currentProLicense: NO_DEFAULT,
    savePlottrLicense: NO_DEFAULT,
    saveProLicense: NO_DEFAULT,
    convertDocxToHtml: NO_DEFAULT,
    listenToStatus: NO_DEFAULT,
    setClientPort: NO_DEFAULT,
    getPort: NO_DEFAULT,
  },
})

export default MainIntegrationContext
