import path from 'path'
import fs from 'fs'
import os from 'os'

import { sortBy } from 'lodash'

import { BACKUP_BASE_PATH, CUSTOM_TEMPLATES_PATH } from './stores'

import { helpers } from 'pltr/v2'

const { readdir, mkdir, lstat, cp, symlink, link } = fs.promises

const TRIAL_LENGTH = 14
const EXTENSIONS = 2

function americanToYearFirst(dateString) {
  const [month, day, year] = dateString.split('_')
  return `${year}_${month}_${day}`
}

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  result.setHours(23, 59, 59, 999)
  return result
}

const withFromFileSystem = (backupFolder) => ({
  ...backupFolder,
  fromFileSystem: true,
})

const BACKUP_FOLDER_REGEX = /^1?[0-9]_[123]?[0-9]_[0-9][0-9][0-9][0-9]/

const BACKUP_WATCH_INTERVAL_MILLISECONDS = 10000

function isOfflineFile(fileURL, offlineFileFilesPath) {
  return fileURL && helpers.file.withoutProtocol(fileURL).startsWith(offlineFileFilesPath)
}

const sequenceThunks = (thunks) => {
  return thunks.reduce((acc, next) => {
    return acc.then(next)
  }, Promise.resolve())
}

const fileSystemModule = (userDataPath) => {
  const OFFLINE_FILE_FILES_PATH = path.join(userDataPath, 'offline')
  const BACKUP_BASE_PATH = path.join(userDataPath, 'backups')
  const TEMP_FILES_PATH = path.join(userDataPath, 'tmp')
  const customTemplatesPath = path.join(userDataPath, `${CUSTOM_TEMPLATES_PATH}.json`)

  return (stores, logger) => {
    const {
      trialStore,
      licenseStore,
      plottrLicenseStore,
      proLicenseStore,
      knownFilesStore,
      templatesStore,
      customTemplatesStore,
      manifestStore,
      exportConfigStore,
      SETTINGS,
      USER,
      lastOpenedFileStore,
    } = stores

    const lastOpenedFile = async () => {
      const lastFile = lastOpenedFileStore.get('lastOpenedFilePath')

      if (isOfflineFile(lastFile, OFFLINE_FILE_FILES_PATH)) {
        return Promise.resolve(null)
      }

      if (helpers.file.urlPointsToPlottrCloud(lastFile)) {
        return lastFile
      }

      return lstat(helpers.file.withoutProtocol(lastFile))
        .then(() => {
          return lastFile
        })
        .catch((error) => {
          if (error.code === 'ENOENT') {
            return null
          }
          logger.error('Error finding last opened file.  Refusing to open it.', error)
          return null
        })
    }

    const setLastOpenedFilePath = (filePath) => {
      // We don't want to record last opened when we should be in pro
      // and opened a device file.
      const frbId = typeof SETTINGS.get('user.frbId')
      if (
        typeof SETTINGS.get('user.frbId') === 'string' &&
        frbId !== '' &&
        helpers.file.isDeviceFileURL(filePath)
      ) {
        return Promise.resolve()
      }

      // Never record offline files as the last opened file(!)  Rather
      // try to open the cloud file and redirect to the local file
      // when Plottr discovers that it's offline.
      if (isOfflineFile(filePath)) {
        return Promise.resolve()
      }

      return lastOpenedFileStore.set('lastOpenedFilePath', filePath)
    }

    const currentAppSettings = () => {
      return SETTINGS.currentStore()
    }

    function backupBasePath() {
      return currentAppSettings().then((settings) => {
        const configuredLocation = settings.user?.backupLocation
        return (configuredLocation !== 'default' && configuredLocation) || BACKUP_BASE_PATH
      })
    }

    function setTemplate(id, template) {
      return templatesStore.setRawKey(id, template)
    }

    function setCustomTemplate(id, template) {
      return customTemplatesStore.setRawKey(id, template)
    }

    function deleteCustomTemplate(id) {
      return customTemplatesStore.delete(id)
    }

    const listenToTrialChanges = (cb) => {
      cb(trialStore.store)
      return trialStore.onDidAnyChange.bind(trialStore)(cb)
    }
    const currentTrial = () => {
      return trialStore.currentStore()
    }
    const startTrial = (numDays = null) => {
      const day = new Date()
      const startsAt = day.getTime()
      const end = addDays(startsAt, numDays || TRIAL_LENGTH)
      const endsAt = end.getTime()
      return trialStore.set({ startsAt, endsAt, extensions: EXTENSIONS })
    }
    const extendTrialWithReset = (days) => {
      return currentTrial().then((currentInfo) => {
        if (currentInfo.hasBeenReset) {
          return true
        }

        const newEnd = addDays(currentInfo.endsAt, days)
        return trialStore
          .setRawKey('endsAt', newEnd.getTime())
          .then(() => {
            return trialStore.setRawKey('extensions', EXTENSIONS)
          })
          .then(() => {
            trialStore.setRawKey('hasBeenReset', true)
          })
      })
    }

    const listenToLicenseChanges = (cb) => {
      cb(licenseStore.store)
      return licenseStore.onDidAnyChange.bind(licenseStore)(cb)
    }
    const currentLicense = () => {
      return licenseStore.currentStore()
    }
    const deleteLicense = () => {
      return licenseStore.clear()
    }
    const saveLicenseInfo = (newLicense) => {
      return licenseStore.set(newLicense)
    }

    const isValidKnownFile = (file) => {
      return typeof file.fileURL === 'string' && typeof file.lastOpened !== 'undefined'
    }

    const listenToknownFilesChanges = (cb) => {
      const transformStore = (store) => {
        return Object.entries(store)
          .filter(([key, file]) => {
            return isValidKnownFile(file)
          })
          .map(([key, file]) => {
            const withoutProtocol = helpers.file.withoutProtocol(file.fileURL)
            const fileBasename = path.basename(withoutProtocol)
            const pathToContainingFolder = withoutProtocol
              .replace(fileBasename, '')
              .split(path.sep)
              .filter(Boolean)
            return {
              pathToContainingFolder,
              fileURL: file.fileURL,
              fileName: file.fileName,
              lastOpened: file.lastOpened,
              isTempFile: file.fileURL.includes(TEMP_FILES_PATH),
            }
          })
      }

      const withFileSystemAsSource = (files) => {
        return cb(transformStore(files))
      }

      cb(transformStore(knownFilesStore.store))
      return knownFilesStore.onDidAnyChange.bind(knownFilesStore)(withFileSystemAsSource)
    }

    const currentKnownFiles = () => {
      return knownFilesStore.currentStore().then((fileIndex) => {
        return Object.entries(fileIndex)
          .filter(([key, file]) => {
            return isValidKnownFile(file)
          })
          .map(([key, file]) => {
            const withoutProtocol = helpers.file.withoutProtocol(file.fileURL)
            const fileBasename = path.basename(withoutProtocol)
            const pathToContainingFolder = withoutProtocol
              .replace(fileBasename, '')
              .split(path.sep)
              .filter(Boolean)
            return {
              fileURL: file.fileURL,
              fileName: file.fileName,
              lastOpened: file.lastOpened,
              isTempFile: file.fileURL.includes(TEMP_FILES_PATH),
              pathToContainingFolder,
            }
          })
      })
    }

    const listenToTemplatesChanges = (cb) => {
      cb(templatesStore.store)
      return templatesStore.onDidAnyChange.bind(templatesStore)(cb)
    }
    const currentTemplates = () => {
      return templatesStore.currentStore()
    }

    const listenToCustomTemplatesChanges = (cb) => {
      const withTemplatesAsArray = (templates) => {
        return cb(Object.values(templates))
      }
      cb(Object.values(customTemplatesStore.store))
      return customTemplatesStore.onDidAnyChange.bind(customTemplatesStore)(withTemplatesAsArray)
    }
    const currentCustomTemplates = () => {
      return customTemplatesStore.currentStore()
    }

    const listenToTemplateManifestChanges = (cb) => {
      cb(manifestStore.store)
      return manifestStore.onDidAnyChange.bind(manifestStore)(cb)
    }
    const currentTemplateManifest = () => {
      return manifestStore.currentStore()
    }

    const listenToExportConfigSettingsChanges = (cb) => {
      cb(exportConfigStore.store)
      return exportConfigStore.onDidAnyChange.bind(exportConfigStore)(cb)
    }
    const currentExportConfigSettings = () => {
      return exportConfigStore.currentStore()
    }
    const saveExportConfigSettings = (key, value) => {
      return exportConfigStore.set(key, value)
    }

    const listenToAppSettingsChanges = (cb) => {
      cb(SETTINGS.store)
      return SETTINGS.onDidAnyChange.bind(SETTINGS)(cb)
    }
    const saveAppSetting = (key, value) => {
      return SETTINGS.set(key, value)
    }

    const listenToUserSettingsChanges = (cb) => {
      cb(USER.store)
      return USER.onDidAnyChange.bind(USER)(cb)
    }
    const currentUserSettings = () => {
      return USER.currentStore()
    }

    const backupDirExists = () => {
      return backupBasePath()
        .then((basePath) => {
          return lstat(basePath).then((stats) => {
            return stats.isDirectory
          })
        })
        .catch((error) => {
          if (error.code !== 'ENOENT') {
            return Promise.reject(error)
          }
          return false
        })
    }

    const ensureBackupDirExists = () => {
      return backupDirExists().then((backupDirDoesExist) => {
        return backupBasePath().then((basePath) => {
          return !backupDirDoesExist
            ? mkdir(basePath, { recursive: true }).catch((error) => {
                if (error.code === 'EEXIST') {
                  logger.error(
                    'We tried to create the backup directory and it already exists (something beat us to it.)',
                    error
                  )
                  return Promise.resolve()
                } else {
                  return Promise.reject(error)
                }
              })
            : Promise.resolve(true)
        })
      })
    }

    const listenToBackupsChanges = (cb) => {
      let stopWatching = () => {}
      ensureBackupDirExists().then(() => {
        readBackupsDirectory((error, initialBackups) => {
          if (error) {
            logger.error('Error listening to backups changes', error)
            cb([])
          } else {
            cb(initialBackups)
          }
          const intervalId = setInterval(() => {
            readBackupsDirectory((error, newBackups) => {
              if (error) {
                logger.error('Failed to read backups directory', error)
                return
              }
              cb(newBackups)
            })
          }, BACKUP_WATCH_INTERVAL_MILLISECONDS)
          stopWatching = () => {
            clearInterval(intervalId)
          }
        })
      })

      return stopWatching
    }
    const currentBackups = () => {
      return new Promise((resolve, reject) => {
        logger.info('Reading current backups')
        readBackupsDirectory((error, newBackups) => {
          if (error) {
            logger.error('Error reading the current backups', error)
            reject(error)
            return
          }
          resolve(newBackups.map(withFromFileSystem))
        })
      })
    }

    function readBackupsDirectory(cb) {
      ensureBackupDirExists()
        .then(() => {
          return backupBasePath().then((basePath) => {
            return readdir(basePath)
              .then((entries) => {
                return Promise.all(
                  entries
                    .filter((d) => {
                      return d[0] !== '.' && !d.includes('.pltr') && d.match(BACKUP_FOLDER_REGEX)
                    })
                    .map((entry) => {
                      return lstat(path.join(basePath, entry)).then((fileStats) => {
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
                    const thisPath = path.join(basePath, directory)
                    return readdir(thisPath).then((entries) => {
                      return Promise.all(
                        entries
                          .filter((entry) => {
                            return entry.endsWith('.pltr')
                          })
                          .map((entry) => {
                            return lstat(path.join(thisPath, entry)).then((fileStats) => {
                              return {
                                name: entry,
                                size: fileStats.size,
                                lastEdited: fileStats.mtimeMs,
                              }
                            })
                          })
                      ).then((files) => {
                        return {
                          path: thisPath,
                          date: americanToYearFirst(directory),
                          backups: files,
                        }
                      })
                    })
                  })
                )
              })
          })
        })
        .then((results) => {
          cb(null, sortBy(results, (folder) => new Date(folder.date.replace(/_/g, '-'))).reverse())
        })
        .catch((error) => {
          logger.error('Error reading backup directory.', error)
          cb(error, [])
          return
        })
    }

    const copyFile = (sourceFileURL, newFileURL) => {
      return cp(
        helpers.file.withoutProtocol(sourceFileURL),
        helpers.file.withoutProtocol(newFileURL)
      )
    }

    const createFileShortcut = async (sourceFileURL, destinationURL, counter = 0) => {
      const shortcutDestination = helpers.file.withoutProtocol(destinationURL)
      const sourceURL = helpers.file.withoutProtocol(sourceFileURL)
      const shortcutSuffix = ' - Shortcut'
      const shortCutExt = os.platform() != 'linux' ? '.lnk' : '.sh'

      let newShortcutPath = path.join(
        shortcutDestination,
        shortcutSuffix + path.basename(sourceFileURL, path.extname(sourceFileURL)) + shortCutExt
      )
      newShortcutPath = path.join(
        shortcutDestination,
        path.basename(sourceFileURL, path.extname(sourceFileURL)) +
          shortcutSuffix +
          (counter ? ' ' + counter : '') +
          shortCutExt
      )
      if (os.platform() == 'win32') {
        // NOTE: this doesn't work on windows.  Use the main process
        // client instead.
        logger.info('Creating hard link on windows')
        return link(sourceURL, newShortcutPath)
          .then(() => {
            return newShortcutPath.replace(/\//g, '\\')
          })
          .catch((error) => {
            if (error.code == 'EEXIST') {
              return createFileShortcut(sourceFileURL, destinationURL, counter + 1)
            } else {
              logger.error('Failed to create hard link on windows', error)
              return Promise.reject(error)
            }
          })
      } else {
        return symlink(sourceURL, newShortcutPath)
          .then(() => newShortcutPath)
          .catch((error) => {
            if (error.code == 'EEXIST') {
              return createFileShortcut(sourceFileURL, destinationURL, counter + 1)
            } else {
              return Promise.reject(error)
            }
          })
      }
    }

    const watchForFilesInDefaultFolder = () => {
      let watcher = null
      let stopListeningToSettings = null
      let timeout = null
      let defaultFolder = null
      let defaultFolderLocation = null

      function listenWhenSettingsReady() {
        if (!SETTINGS.isInitialReadComplete()) {
          timeout = setTimeout(listenWhenSettingsReady, 1000)
        } else {
          clearTimeout(timeout)
          stopListeningToSettings = SETTINGS.onDidAnyChange((settings) => {
            const newDefaultFolder = SETTINGS.getKeyWithoutDefault('user.defaultFolder')
            const newDefaultFolderLocation = SETTINGS.getKeyWithoutDefault(
              'user.defaultFolderLocation'
            )
            if (
              newDefaultFolder &&
              typeof newDefaultFolderLocation === 'string' &&
              newDefaultFolderLocation !== ''
            ) {
              if (
                newDefaultFolder !== defaultFolder ||
                newDefaultFolderLocation !== defaultFolderLocation
              ) {
                logger.info('Default folder', newDefaultFolder)
                logger.info('Default folder location', newDefaultFolderLocation)
                defaultFolder = newDefaultFolder
                defaultFolderLocation = newDefaultFolderLocation
                logger.info(
                  'Settings changed.  Re-establishing default folder watcher.',
                  defaultFolderLocation
                )
                if (watcher) {
                  watcher.close()
                }
                const readDirectory = () => {
                  return readdir(defaultFolderLocation).then((entries) => {
                    return Promise.all(
                      entries.filter((d) => {
                        return d.endsWith('.pltr')
                      })
                    ).then((files) => {
                      const thunks = files.map((file) => () => {
                        const fileURL = helpers.file.filePathToFileURL(
                          path.join(defaultFolderLocation, file)
                        )
                        const hasFile = knownFilesStore.has(fileURL)
                        const fileName = path.basename(file).replace(/\.pltr$/, '')
                        if (!hasFile) {
                          logger.info('Adding from watcher', file)
                          knownFilesStore.setRawKey(fileURL, {
                            fileURL,
                            fileName,
                            lastOpened: null,
                          })
                        }
                      })
                      sequenceThunks(thunks)
                    })
                  })
                }
                lstat(defaultFolderLocation)
                  .catch((error) => {
                    if (error.code === 'ENOENT') {
                      logger.error("The default directory doesn't exist.  Creating it.")
                      return mkdir(defaultFolderLocation)
                        .then(() => {
                          return new Promise((resolve) => {
                            setTimeout(resolve, 1000)
                          })
                        })
                        .catch((error) => {
                          if (error.code === 'EEXIST') {
                            logger.error(
                              'We tried to create the default folder and something beat us to it.',
                              error
                            )
                            return Promise.resolve()
                          } else {
                            return Promise.reject(error)
                          }
                        })
                    } else {
                      logger.error('Error checking whether the default directory exists', error)
                      return Promise.reject(error)
                    }
                  })
                  .then(() => {
                    logger.info('The default folder exists.')
                    readDirectory()
                    watcher = fs.watch(defaultFolderLocation, readDirectory)
                  })
              }
            } else {
              if (watcher) {
                watcher.close()
              }
              if (timeout) {
                clearTimeout(timeout)
              }
            }
          })
        }
      }

      listenWhenSettingsReady()

      return () => {
        if (watcher) {
          watcher.close()
        }
        if (stopListeningToSettings) {
          stopListeningToSettings()
        }
        if (timeout) {
          clearTimeout(timeout)
        }
      }
    }

    const savePlottrLicense = (secret, machineInfo) => {
      return plottrLicenseStore.set({ secret, machineInfo })
    }

    const saveProLicense = (secret, machineInfo) => {
      return proLicenseStore.set({ secret, machineInfo })
    }

    const currentPlottrLicense = () => {
      return plottrLicenseStore.currentStore()
    }

    const listenToPlottrLicenseChanges = (cb) => {
      cb(plottrLicenseStore.store)
      return plottrLicenseStore.onDidAnyChange.bind(plottrLicenseStore)(cb)
    }

    const currentProLicense = (cb) => {
      cb(proLicenseStore.store)
      return proLicenseStore.onDidAnyChange.bind(proLicenseStore)(cb)
    }

    const listenToProLicenseChanges = () => {
      return Promise.resolve()
    }

    return {
      TEMP_FILES_PATH,
      setTemplate,
      setCustomTemplate,
      deleteCustomTemplate,
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
      listenToUserSettingsChanges,
      currentUserSettings,
      listenToBackupsChanges,
      currentBackups,
      customTemplatesPath,
      lastOpenedFile,
      setLastOpenedFilePath,
      copyFile,
      createFileShortcut,
      watchForFilesInDefaultFolder,
      savePlottrLicense,
      saveProLicense,
      currentPlottrLicense,
      currentProLicense,
      listenToPlottrLicenseChanges,
      listenToProLicenseChanges,
    }
  }
}

export default fileSystemModule
