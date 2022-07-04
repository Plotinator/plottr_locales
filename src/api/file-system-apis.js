import fs, { lstatSync, mkdirSync } from 'fs'
import path from 'path'
import { ipcRenderer } from 'electron'
import { sortBy } from 'lodash'

import {
  licenseStore,
  trialStore,
  knownFilesStore,
  templatesStore,
  customTemplatesStore,
  manifestStore,
  exportConfigStore,
  SETTINGS,
  USER,
} from '../file-system/stores'
import { backupBasePath } from '../common/utils/backup'
import logger from '../../shared/logger'

const { readdir, lstat } = fs.promises

const TRIAL_LENGTH = 30
const EXTENSIONS = 2

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(23, 59, 59, 999)
  return result
}

function americanToYearFirst(dateString) {
  const [month, day, year] = dateString.split('_')
  return `${year}_${month}_${day}`
}

export const listenToTrialChanges = (cb) => {
  cb(trialStore.store)
  return trialStore.onDidAnyChange.bind(trialStore)(cb)
}
export const currentTrial = () => trialStore.store
export const startTrial = (numDays = null) => {
  const day = new Date()
  const startsAt = day.getTime()
  const end = addDays(startsAt, numDays || TRIAL_LENGTH)
  const endsAt = end.getTime()
  trialStore.set({ startsAt, endsAt, extensions: EXTENSIONS })
}
export const extendTrial = (days) => {
  const newEnd = addDays(Date.now(), days)
  const trialInfo = currentTrial()
  const info = {
    ...trialInfo,
    endsAt: newEnd.getTime(),
    extensions: --trialInfo.extensions,
  }
  trialStore.set(info)
}
export const extendTrialWithReset = (days) => {
  const currentInfo = currentTrial()
  if (currentInfo.hasBeenReset) return

  const newEnd = addDays(currentInfo.endsAt, days)
  trialStore.set('endsAt', newEnd.getTime())
  trialStore.set('extensions', EXTENSIONS)
  trialStore.set('hasBeenReset', true)
}

export const listenToLicenseChanges = (cb) => {
  cb(licenseStore.store)
  return licenseStore.onDidAnyChange.bind(licenseStore)
}
export const currentLicense = () => licenseStore.store
// FIXME: known issue: if we remove the license, then the listener
// stops firing.  This might be fixed in the next release.
export const deleteLicense = () => {
  licenseStore.clear()
}
export const saveLicenseInfo = (newLicense) => {
  licenseStore.store = newLicense
}

export const listenToknownFilesChanges = (cb) => {
  const transformStore = (store) =>
    Object.entries(store).map(([key, file]) => ({
      ...file,
      fromFileSystem: true,
      id: key,
    }))

  const withFileSystemAsSource = (files) => {
    return cb(transformStore(files))
  }

  ipcRenderer.on('reload-recents', () => {
    try {
      cb(transformStore(JSON.parse(fs.readFileSync(knownFilesStore.path))))
    } catch (e) {
      logger.error('Failed to read known files after we were signalled to', e)
    }
  })
  cb(transformStore(knownFilesStore.store))
  return knownFilesStore.onDidAnyChange.bind(knownFilesStore)(withFileSystemAsSource)
}
export const currentKnownFiles = () =>
  Object.entries(knownFilesStore.store).map(([key, file]) => ({
    ...file,
    fromFileSystem: true,
    id: key,
  }))

export const listenToTemplatesChanges = (cb) => {
  cb(templatesStore.store)
  return templatesStore.onDidAnyChange.bind(templatesStore)(cb)
}
export const currentTemplates = () => templatesStore.store

export const listenToCustomTemplatesChanges = (cb) => {
  const withTemplatesAsArray = (templates) => {
    return cb(Object.values(templates))
  }
  cb(Object.values(customTemplatesStore.store))
  return customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)(withTemplatesAsArray)
}
export const currentCustomTemplates = () => Object.values(customTemplatesStore.store)

export const listenToTemplateManifestChanges = (cb) => {
  cb(manifestStore.store)
  return manifestStore.onDidAnyChange.bind(manifestStore)(cb)
}
export const currentTemplateManifest = () => manifestStore.store

export const listenToExportConfigSettingsChanges = (cb) => {
  cb(exportConfigStore.store)
  return exportConfigStore.onDidAnyChange.bind(exportConfigStore)(cb)
}
export const currentExportConfigSettings = () => exportConfigStore.store
export const saveExportConfigSettings = (key, value) => exportConfigStore.set(key, value)

export const listenToAppSettingsChanges = (cb) => {
  cb(SETTINGS.store)
  return SETTINGS.onDidAnyChange.bind(SETTINGS)(cb)
}
export const currentAppSettings = () => SETTINGS.store
export const saveAppSetting = (key, value) => SETTINGS.set(key, value)

export const listenToUserSettingsChanges = (cb) => {
  cb(USER.store)
  return USER.onDidAnyChange.bind(USER)(cb)
}
export const currentUserSettings = () => USER.store

const withFromFileSystem = (backupFolder) => ({
  ...backupFolder,
  fromFileSystem: true,
})

const backupDirExists = () => {
  try {
    const stats = lstatSync(backupBasePath())
    return stats.isDirectory()
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
    return false
  }
}

let _currentBackups = []
export const listenToBackupsChanges = (cb) => {
  let watcher = () => {}
  readBackupsDirectory((initialBackups) => {
    _currentBackups = initialBackups
    cb(initialBackups)
    if (!backupDirExists()) {
      mkdirSync(backupBasePath())
    }
    watcher = fs.watch(backupBasePath(), (event, fileName) => {
      // Do we care about event and fileName?
      //
      // NOTE: event could be 'changed' or 'renamed'.
      readBackupsDirectory((newBackups) => {
        _currentBackups = newBackups
        cb(newBackups)
      })
    })
  })

  return () => {
    watcher.close()
  }
}
export const currentBackups = () => {
  readBackupsDirectory((newBackups) => {
    _currentBackups = newBackups.map(withFromFileSystem)
  })

  return _currentBackups
}
function readBackupsDirectory(cb) {
  readdir(backupBasePath())
    .then((entries) => {
      return Promise.all(
        entries
          .filter((d) => {
            return d[0] != '.' && !d.includes('.pltr')
          })
          .map((entry) => {
            return lstat(entry).then((fileStats) => {
              return {
                keep: fileStats.isDirectory(),
                payload: entry,
              }
            })
          })
      ).then((results) => {
        return results.filter(({ keep }) => keep).map(({ payload }) => payload)
      })
    })
    .then((directories) => {
      return Promise.all(
        directories.map((directory) => {
          const thisPath = path.join(backupBasePath(), directory)
          return readdir(thisPath).then((entries) => {
            const files = entries.filter((entry) => {
              return entry.endsWith('.pltr')
            })
            return {
              path: thisPath,
              date: americanToYearFirst(directory),
              backups: files,
            }
          })
        })
      )
    })
    .then((results) => {
      cb(sortBy(results, (folder) => new Date(folder.date.replace(/_/g, '-'))).reverse())
    })
    .catch((error) => {
      logger.error('Error reading backup directory.', error)
      cb([])
      return
    })
}
