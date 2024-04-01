import { cloneDeep } from 'lodash'

const makeFileSystemAPIs = (socketClient) => {
  function customTemplatesPath() {
    return socketClient(({ customTemplatesPath }) => {
      return customTemplatesPath()
    })
  }

  function backupBasePath() {
    return socketClient(({ backupBasePath }) => {
      return backupBasePath()
    })
  }

  const listenToTrialChanges = (cb) => {
    return socketClient(({ listenToTrialChanges }) => {
      return listenToTrialChanges(cb)
    })
  }
  const currentTrial = () => {
    return socketClient(({ currentTrial }) => {
      return currentTrial()
    })
  }
  const startTrial = (numDays = null) => {
    return socketClient(({ startTrial }) => {
      return startTrial(numDays)
    })
  }
  const extendTrialWithReset = (days) => {
    return socketClient(({ extendTrialWithReset }) => {
      return extendTrialWithReset(days)
    })
  }

  const currentLicense = () => {
    return socketClient(({ currentPlottrLicense, currentProLicense }) => {
      return Promise.all([currentPlottrLicense(), currentProLicense()]).then(
        ([plottrLicense, proLicense]) => {
          return {
            plottrLicense,
            proLicense,
          }
        }
      )
    })
  }

  const listenToLicenseChanges = (cb) => {
    return socketClient(({ listenToPlottrLicenseChanges, listenToProLicenseChanges }) => {
      let license = {
        plottrLicense: null,
        proLicense: null,
      }
      currentLicense().then((initialLicense) => {
        license = initialLicense
        license = cloneDeep(initialLicense)
        cb(license)
      })
      const plottrListener = listenToPlottrLicenseChanges((newPlottrLicense) => {
        license = {
          ...license,
          plottrLicense: newPlottrLicense,
        }
        cb(license)
      })
      const proListener = listenToProLicenseChanges((newProLicense) => {
        license = {
          ...license,
          proLicense: newProLicense,
        }
        cb(license)
      })
      return () => {
        if (typeof plottrListener === 'function') {
          plottrListener()
        }
        if (typeof proListener === 'function') {
          proListener()
        }
      }
    })
  }

  const deleteLicense = () => {
    return socketClient(({ deleteLicense }) => {
      return deleteLicense()
    })
  }
  const saveLicenseInfo = (newLicense) => {
    return socketClient(({ saveLicenseInfo }) => {
      return saveLicenseInfo(newLicense)
    })
  }

  const listenToknownFilesChanges = (cb) => {
    return socketClient(({ listenToknownFilesChanges }) => {
      return listenToknownFilesChanges(cb)
    })
  }
  const currentKnownFiles = () => {
    return socketClient(({ currentKnownFiles }) => {
      return currentKnownFiles()
    })
  }

  const listenToTemplatesChanges = (cb) => {
    return socketClient(({ listenToTemplatesChanges }) => {
      return listenToTemplatesChanges(cb)
    })
  }
  const currentTemplates = () => {
    return socketClient(({ currentTemplates }) => {
      return currentTemplates()
    })
  }

  const listenToCustomTemplatesChanges = (cb) => {
    return socketClient(({ listenToCustomTemplatesChanges }) => {
      return listenToCustomTemplatesChanges(cb)
    })
  }
  const currentCustomTemplates = () => {
    return socketClient(({ currentCustomTemplates }) => {
      return currentCustomTemplates()
    })
  }

  const listenToTemplateManifestChanges = (cb) => {
    return socketClient(({ listenToTemplateManifestChanges }) => {
      return listenToTemplateManifestChanges(cb)
    })
  }
  const currentTemplateManifest = () => {
    return socketClient(({ currentTemplateManifest }) => {
      return currentTemplateManifest()
    })
  }

  const listenToExportConfigSettingsChanges = (cb) => {
    return socketClient(({ listenToExportConfigSettingsChanges }) => {
      return listenToExportConfigSettingsChanges(cb)
    })
  }
  const currentExportConfigSettings = () => {
    return socketClient(({ currentExportConfigSettings }) => {
      return currentExportConfigSettings()
    })
  }
  const saveExportConfigSettings = (key, value) => {
    return socketClient(({ saveExportConfigSettings }) => {
      return saveExportConfigSettings(key, value)
    })
  }

  const listenToAppSettingsChanges = (cb) => {
    return socketClient(({ listenToAppSettingsChanges }) => {
      return listenToAppSettingsChanges(cb)
    })
  }
  const currentAppSettings = () => {
    return socketClient(({ currentAppSettings }) => {
      return currentAppSettings()
    })
  }
  const saveAppSetting = (key, value) => {
    return socketClient(({ saveAppSetting }) => {
      return saveAppSetting(key, value)
    })
  }

  const listenToBackupsChanges = (cb) => {
    return socketClient(({ listenToBackupsChanges }) => {
      return listenToBackupsChanges(cb)
    })
  }
  const currentBackups = () => {
    return socketClient(({ currentBackups }) => {
      return currentBackups()
    })
  }
  const lastOpenedFile = () => {
    return socketClient(({ lastOpenedFile }) => {
      return lastOpenedFile()
    })
  }
  const setLastOpenedFilePath = (filePath) => {
    return socketClient(({ setLastOpenedFilePath }) => {
      return setLastOpenedFilePath(filePath)
    })
  }
  const persistUserId = (uid) => {
    return socketClient(({ saveAppSetting }) => {
      return saveAppSetting('user.frbId', uid)
    })
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
  }
}

export default makeFileSystemAPIs
