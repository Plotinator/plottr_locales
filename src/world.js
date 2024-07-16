import { groupBy, flatten } from 'lodash'

import { selectors } from 'wired-up-pltr'
import { plottrWorldAPI } from 'plottr_world'

import { makeFileSystemAPIs, firebaseAPIs, licenseServerAPIs } from './api'
import logger from '../shared/logger'
import { getErrorReporterInstance } from '../shared/error-reporter-instance'

const errorReportingLogger = {
  info: logger.info,
  warn: logger.warn,
  error: (...args) => {
    logger.error(...args)
    getErrorReporterInstance().then((errorReporter) => {
      return errorReporter.error(...args)
    })
  },
}

// From: https://github.com/reduxjs/redux/issues/303#issuecomment-125184409
function observeStore(store, select, onChange) {
  let currentState = select(store.getState())

  function handleChange() {
    let nextState = select(store.getState())
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  let unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}

const afterSettingsLoad = (store, fn) => {
  const appSettingsLoaded = selectors.applicationSettingsAreLoadedSelector(store.getState())
  if (!appSettingsLoaded) {
    const unsubscribe = observeStore(
      store,
      selectors.applicationSettingsAreLoadedSelector,
      (loaded) => {
        if (loaded) {
          unsubscribe()
          afterSettingsLoad(store, fn)
        }
      }
    )
    return
  }
  fn()
}

const combineCloudAndFileSystemSources =
  (fileSystemSource, cloudSource, mergeSources, logger, forceIncludeLocal = false) =>
  (store, cb) => {
    let _currentFileSystemResult = null
    let _currentCloudResult = null

    const unsubscribeFromFileSystemSourceResult = fileSystemSource((error, fileSystemResult) => {
      if (error) {
        logger.warn(`Failed to receive updated values`, error)
      } else {
        _currentFileSystemResult = fileSystemResult
        afterSettingsLoad(store, () => {
          const previouslyLoggedIntoPro = selectors.previouslyLoggedIntoProSelector(
            store.getState()
          )
          if (_currentCloudResult) {
            cb(null, mergeSources(_currentFileSystemResult, _currentCloudResult))
          } else if (forceIncludeLocal || !previouslyLoggedIntoPro) {
            cb(null, _currentFileSystemResult)
          }
        })
      }
    })

    const unsubscribeFromCloudSource = cloudSource((cloudResult) => {
      _currentCloudResult = cloudResult
      afterSettingsLoad(store, () => {
        const previouslyLoggedIntoPro = selectors.previouslyLoggedIntoProSelector(store.getState())
        if (_currentFileSystemResult) {
          cb(null, mergeSources(_currentFileSystemResult, _currentCloudResult))
        } else if (previouslyLoggedIntoPro) {
          cb(null, _currentCloudResult)
        }
      })
    })

    // This is the recommended test for whether something is a promise /shrug
    if (unsubscribeFromFileSystemSourceResult.then) {
      return () => {
        unsubscribeFromFileSystemSourceResult.then((unsubscribeFromFileSystemSource) => {
          unsubscribeFromFileSystemSource()
        })
        unsubscribeFromCloudSource()
      }
    }
    return () => {
      if (typeof unsubscribeFromFileSystemSourceResult === 'function') {
        unsubscribeFromFileSystemSourceResult()
      } else {
        logger.warn('Unsubscribe from file system source is not a promise or function.')
      }
      unsubscribeFromCloudSource()
    }
  }

const mergeWithConcat = (source1, source2) => source1.concat(source2)

const mergeBackups = (firebaseFolders, localFolders) => {
  const allFolders = firebaseFolders.concat(localFolders)
  const grouped = groupBy(allFolders, 'date')
  const results = []
  Object.entries(grouped).forEach(([key, group]) => {
    results.push({
      date: key,
      path: group[0].path,
      backups: flatten(group.map(({ backups }) => backups)),
    })
  })
  return results
}
const ignoringStore = (fn) => (store, cb) => fn(cb)

const theWorld = (localClient) => {
  const fileSystemAPIs = makeFileSystemAPIs(localClient)

  const listenToknownFilesChanges = combineCloudAndFileSystemSources(
    fileSystemAPIs.listenToknownFilesChanges,
    firebaseAPIs.listenToKnownFiles,
    mergeWithConcat,
    errorReportingLogger
  )

  const currentKnownFiles = () => {
    return fileSystemAPIs.currentKnownFiles().then((fileSystemKnownFiles) => {
      return fileSystemKnownFiles.concat(firebaseAPIs.currentKnownFiles())
    })
  }

  const listenToCustomTemplatesChanges = combineCloudAndFileSystemSources(
    fileSystemAPIs.listenToCustomTemplatesChanges,
    firebaseAPIs.listenToCustomTemplates,
    mergeWithConcat,
    errorReportingLogger
  )
  const currentCustomTemplates = () => {
    return fileSystemAPIs.currentCustomTemplates().then((fileSystemCustomTemplates) => {
      return Object.values(fileSystemCustomTemplates).concat(firebaseAPIs.currentCustomTemplates())
    })
  }

  const listenToBackupsChanges = combineCloudAndFileSystemSources(
    fileSystemAPIs.listenToBackupsChanges,
    firebaseAPIs.listenToBackupsChanges,
    mergeBackups,
    errorReportingLogger,
    true
  )

  const currentBackups = () => {
    return fileSystemAPIs.currentBackups().then((fileSystemBackups) => {
      return mergeBackups(firebaseAPIs.currentBackups(), fileSystemBackups)
    })
  }

  const { checkForAndSaveLicense } = licenseServerAPIs.makeLicenseServerAPIs(localClient, logger)

  return {
    logger: errorReportingLogger,
    license: {
      persistUserId: fileSystemAPIs.persistUserId,
      persistLicenseMode: fileSystemAPIs.persistLicenseMode,
      persistEmailAddress: fileSystemAPIs.persistEmailAddress,
      checkForAndSaveLicense,
      listenToTrialChanges: ignoringStore(fileSystemAPIs.listenToTrialChanges),
      currentTrial: fileSystemAPIs.currentTrial,
      listenToLicenseChanges: ignoringStore(fileSystemAPIs.listenToLicenseChanges),
      currentLicense: fileSystemAPIs.currentLicense,
    },
    session: {
      listenForSessionChange: ignoringStore(firebaseAPIs.listenForSessionChange),
    },
    files: {
      listenToknownFilesChanges,
      currentKnownFiles,
    },
    backups: {
      listenToBackupsChanges,
      currentBackups,
    },
    templates: {
      listenToTemplatesChanges: ignoringStore(fileSystemAPIs.listenToTemplatesChanges),
      currentTemplates: fileSystemAPIs.currentTemplates,
      listenToCustomTemplatesChanges,
      currentCustomTemplates,
      listenToTemplateManifestChanges: ignoringStore(
        fileSystemAPIs.listenToTemplateManifestChanges
      ),
      currentTemplateManifest: fileSystemAPIs.currentTemplateManifest,
    },
    settings: {
      listenToExportConfigSettingsChanges: ignoringStore(
        fileSystemAPIs.listenToExportConfigSettingsChanges
      ),
      currentExportConfigSettings: fileSystemAPIs.currentExportConfigSettings,
      listenToAppSettingsChanges: ignoringStore(fileSystemAPIs.listenToAppSettingsChanges),
      currentAppSettings: fileSystemAPIs.currentAppSettings,
    },
  }
}

const makeWorldAPI = (localClient) => plottrWorldAPI(theWorld(localClient))

export default makeWorldAPI
