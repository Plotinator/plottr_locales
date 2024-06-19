import { cloneDeep } from 'lodash'

const makeFileSystemAPIs = (localClient) => {
  function customTemplatesPath() {
    return localClient.customTemplatesPath()
  }

  function backupBasePath() {
    return localClient.backupBasePath()
  }

  const listenToTrialChanges = (cb) => {
    return localClient.listenToTrialChanges(cb)
  }
  const currentTrial = () => {
    return localClient.currentTrial()
  }
  const startTrial = (numDays = null) => {
    return localClient.startTrial(numDays)
  }
  const extendTrialWithReset = (days) => {
    return localClient.extendTrialWithReset(days)
  }

  const currentLicense = () => {
    return Promise.all([localClient.currentPlottrLicense(), localClient.currentProLicense()]).then(
      ([plottrLicense, proLicense]) => {
        return {
          plottrLicense,
          proLicense,
        }
      }
    )
  }

  const listenToLicenseChanges = (cb) => {
    let license = {
      plottrLicense: null,
      proLicense: null,
    }
    currentLicense().then((initialLicense) => {
      license = cloneDeep(initialLicense)
      cb(null, license)
    })
    const plottrListener = localClient.listenToPlottrLicenseChanges((error, newPlottrLicense) => {
      if (error) {
        cb(error)
      } else {
        license = {
          ...license,
          plottrLicense: newPlottrLicense,
        }
        cb(null, license)
      }
    })
    const proListener = localClient.listenToProLicenseChanges((error, newProLicense) => {
      if (error) {
        cb(error)
      } else {
        license = {
          ...license,
          proLicense: newProLicense,
        }
        cb(null, license)
      }
    })
    return () => {
      if (typeof plottrListener === 'function') {
        plottrListener()
      }
      if (typeof proListener === 'function') {
        proListener()
      }
    }
  }

  const deleteLicense = () => {
    return localClient.deleteLicense()
  }
  const saveLicenseInfo = (newLicense) => {
    return localClient.saveLicenseInfo(newLicense)
  }

  const listenToknownFilesChanges = (cb) => {
    return localClient.listenToknownFilesChanges(cb)
  }
  const currentKnownFiles = () => {
    return localClient.currentKnownFiles()
  }

  const listenToTemplatesChanges = (cb) => {
    return localClient.listenToTemplatesChanges(cb)
  }
  const currentTemplates = () => {
    return localClient.currentTemplates()
  }

  const listenToCustomTemplatesChanges = (cb) => {
    return localClient.listenToCustomTemplatesChanges(cb)
  }
  const currentCustomTemplates = () => {
    return localClient.currentCustomTemplates()
  }

  const listenToTemplateManifestChanges = (cb) => {
    return localClient.listenToTemplateManifestChanges(cb)
  }
  const currentTemplateManifest = () => {
    return localClient.currentTemplateManifest()
  }

  const listenToExportConfigSettingsChanges = (cb) => {
    return localClient.listenToExportConfigSettingsChanges(cb)
  }
  const currentExportConfigSettings = () => {
    return localClient.currentExportConfigSettings()
  }
  const saveExportConfigSettings = (key, value) => {
    return localClient.saveExportConfigSettings(key, value)
  }

  const listenToAppSettingsChanges = (cb) => {
    return localClient.listenToAppSettingsChanges(cb)
  }
  const currentAppSettings = () => {
    return localClient.currentAppSettings()
  }
  const saveAppSetting = (key, value) => {
    return localClient.saveAppSetting(key, value)
  }

  const listenToBackupsChanges = (cb) => {
    return localClient.listenToBackupsChanges(cb)
  }
  const currentBackups = () => {
    return localClient.currentBackups()
  }
  const lastOpenedFile = () => {
    return localClient.lastOpenedFile()
  }
  const setLastOpenedFilePath = (filePath) => {
    return localClient.setLastOpenedFilePath(filePath)
  }
  const persistUserId = (uid) => {
    return localClient.saveAppSetting('user.frbId', uid)
  }
  const persistLicenseMode = (isInProMode) => {
    return localClient.saveAppSetting('user.choseProMode', isInProMode)
  }
  const persistEmailAddress = (email) => {
    return localClient.saveAppSetting('user.email', email)
  }
  const deletePlottrLicense = () => {
    return localClient.deletePlottrLicense()
  }

  const deleteProLicense = () => {
    return localClient.deleteProLicense()
  }

  return {
    customTemplatesPath,
    backupBasePath,
    listenToTrialChanges,
    currentTrial,
    startTrial,
    extendTrialWithReset,
    listenToLicenseChanges,
    currentLicense,
    deleteLicense,
    deletePlottrLicense,
    deleteProLicense,
    saveLicenseInfo,
    listenToknownFilesChanges,
    currentKnownFiles,
    listenToTemplatesChanges,
    currentTemplates,
    listenToCustomTemplatesChanges,
    currentCustomTemplates,
    listenToTemplateManifestChanges,
    currentTemplateManifest,
    listenToExportConfigSettingsChanges,
    currentExportConfigSettings,
    saveExportConfigSettings,
    listenToAppSettingsChanges,
    currentAppSettings,
    saveAppSetting,
    listenToBackupsChanges,
    currentBackups,
    lastOpenedFile,
    setLastOpenedFilePath,
    persistUserId,
    persistLicenseMode,
    persistEmailAddress,
  }
}

export default makeFileSystemAPIs
