import { helpers, SYSTEM_REDUCER_KEYS, migrateIfNeeded, Migrator, emptyFile } from 'pltr'
import { actions, selectors } from 'wired-up-pltr'
import { t } from 'plottr_locales'
import { v4 as uuid } from 'uuid'
import {
  currentUser,
  initialFetch,
  overwriteAllKeys,
  saveBackup as saveBackupOnFirebase,
  writeUserOwnershipNote,
} from 'wired-up-firebase'
import exportToSelfContainedPlottrFile from '../../lib/plottr_import_export/src/exporter/plottr'

import { makeFileSystemAPIs } from '../api'
import { offlineFileURLFromFile } from '../files'
import { uploadProject } from '../common/utils/upload_project'
import { resumeDirective } from '../resume'
import logger from '../../shared/logger'
import { store } from './store'
import MPQ from '../common/utils/MPQ'
import { makeFileModule } from './files'
import { offlineFileURL } from '../common/utils/files'
import Saver from './saver'
import { saveFile, backupFile } from './save'
import {
  makeCachedDownloadStorageImage,
  downloadStorageImage,
} from '../common/downloadStorageImage'
import { makeMainProcessClient } from './mainProcessClient'
import createErrorReporter from '../../shared/error-reporter'

const {
  setWindowTitle,
  setRepresentedFileName,
  getVersion,
  showErrorBox,
  showMessageBox,
  machineId,
  setMyFilePath,
  isRestarting,
  pleaseTellMeWhatPlatformIAmOn,
  showSaveDialog,
  userDocumentsPath,
  markProjectAsSaved,
} = makeMainProcessClient()

const withFileId = (fileId, file) => ({
  ...file,
  file: {
    ...file.file,
    id: fileId,
  },
})

const isPlottrCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

const MAX_ATTEMPTS = 5

const UPDATE_MESSAGE = 'Need to update Plottr'

function waitForUser() {
  return new Promise((resolve, reject) => {
    function iter(attempts) {
      if (attempts >= MAX_ATTEMPTS) {
        reject(new Error(`Couldn't get the user after 5 seconds of trying.`))
        return
      }
      const user = currentUser()
      if (user) {
        resolve(user)
      } else {
        setTimeout(() => {
          iter(attempts + 1)
        }, 1000)
      }
    }
    iter(0)
  })
}

// NOTE: Only for cloud files.
const loadFileIntoRedux = (data, fileId) => {
  store().dispatch(
    actions.ui.loadFile(
      data.file.fileName,
      false,
      Object.assign({}, emptyFile(data.file.fileName, data.file.version), withFileId(fileId, data)),
      data.file.version,
      helpers.file.fileIdToPlottrCloudFileURL(fileId)
    )
  )
  store().dispatch(
    actions.project.selectFile(
      data.file.permission,
      helpers.file.fileIdToPlottrCloudFileURL(fileId)
    )
  )
}

export function removeSystemKeys(jsonData) {
  const withoutSystemKeys = {}
  Object.keys(jsonData).map((key) => {
    if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
    withoutSystemKeys[key] = jsonData[key]
  })
  return withoutSystemKeys
}

const MAX_FILE_BOOT_TIME_MS = 60000

const SAVE_INTERVAL_MS = 10000
const BACKUP_INTERVAL_MS = 60000
/**
 * @type {SaverRef}
 * @typedef Saver
 * @property {function(): void} start
 * @property {function(): void} stop
 * @property {function(): void} cancelAllRemainingRequests
 * @typedef SaverRef
 * @property {Saver | null} current
 */
const saverRef = { current: null }
/**
 * @type {BootFileRef}
 * @typedef BootFileRef
 * @property {null | Number} current
 */
const bootingFile = { current: null }

export function bootFile(
  localClient,
  fileURL,
  options,
  numOpenFiles,
  saveBackup,
  mountState,
  bootingOfflineFile
) {
  const now = new Date().getTime()
  if (bootingFile.current && now - bootingFile.current < MAX_FILE_BOOT_TIME_MS) {
    logger.warn(
      `Trying to boot ${fileURL} and we're trying to boot a file already.  It's been ${
        (now - bootingFile.current) / 1000
      } seconds since we started booting.`
    )
    return Promise.resolve()
  }
  bootingFile.current = now

  if (saverRef.current) {
    saverRef.current.cancelAllRemainingRequests()
  }

  const recordedErrorsDuringStartup = []

  function offerSaveAsThenQuit() {
    saverRef?.current?.stop?.()
    const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
    return showErrorBox(
      t('Error'),
      t(
        'There was an error saving your file.  Please use the following dialog to save your file and contact support.'
      )
    ).then(() => {
      return showSaveDialog(filters, t('Please name this backup')).then((fileName) => {
        if (fileName) {
          const backupFolder = selectors.backupFolderPathSelector(store().getState())
          if (fileName.startsWith(backupFolder)) {
            return showErrorBox(
              t('Error'),
              t('Please choose a destination other than your backup folder')
            )
          } else {
            const newFilePath = helpers.file.ensureEndsInPltr(fileName)
            return localClient
              .saveRawFile(newFilePath, JSON.stringify(removeSystemKeys(store().getState())))
              .then(() => {
                setTimeout(() => {
                  const event = new Event('force-close')
                  window.dispatchEvent(event)
                }, 3000)
              })
          }
        } else {
          return userDocumentsPath().then((documentsPath) => {
            return localClient
              .join(documentsPath, `Plottr-fatal-exit-backup-${uuid()}.pltr`)
              .then((newFilePath) => {
                return localClient
                  .saveRawFile(newFilePath, JSON.stringify(removeSystemKeys(store().getState())))
                  .then(() => {
                    setTimeout(() => {
                      const event = new Event('force-close')
                      window.dispatchEvent(event)
                    }, 3000)
                  })
              })
          })
        }
      })
    })
  }

  const migrate = (originalFile, fileId) => (overwrittenFile) => {
    const json = overwrittenFile || originalFile
    const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
    return getVersion().then((version) => {
      return new Promise((resolve, reject) => {
        if (json.file.permission !== 'owner') {
          const migrator = new Migrator(json, fileURL, json.file.version, version, () => {}, logger)
          if (migrator.plottrBehindFile()) {
            reject(new Error(UPDATE_MESSAGE))
          } else {
            machineId().then((clientId) => {
              loadFileIntoRedux(json, fileId)
              store().dispatch(actions.client.setClientId(clientId))
              resolve(json)
            })
          }
          return
        } else {
          migrateIfNeeded(
            version,
            json,
            fileURL,
            null,
            (error, migrated, data) => {
              if (error) {
                recordedErrorsDuringStartup.push({
                  message: 'Plottr behind file',
                  error,
                })
                if (error === 'Plottr behind file') {
                  reject(new Error(UPDATE_MESSAGE))
                  return
                }
                reject(error)
                return
              }
              machineId().then((clientId) => {
                if (migrated) {
                  logger.info(
                    `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
                  )
                  overwriteAllKeys(fileId, clientId, removeSystemKeys(data))
                    .then((results) => {
                      loadFileIntoRedux(data, fileId)
                      store().dispatch(actions.client.setClientId(clientId))
                      return results
                    })
                    .then(resolve, reject)
                } else {
                  loadFileIntoRedux(data, fileId)
                  store().dispatch(actions.client.setClientId(clientId))
                  resolve(data)
                }
              })
            },
            logger
          )
        }
      })
    })
  }

  const nukeLastKnown = localClient.nukeLastOpenedFileURL

  const fileSystemAPIs = makeFileSystemAPIs(localClient)

  const { backupOfflineBackupForResume } = makeFileModule(localClient)

  const cachedDowloadStorageImage = makeCachedDownloadStorageImage(downloadStorageImage)

  /* If we find that we had an offline backup, we need to either:
   *  - Backup the local copy and open the online copy,
   *  - overwrite the cloud copy, or
   *  - do nothing (i.e. just load the cloud copy).
   *
   * We signal to the caller that we overwrote the cloud copy by
   * producing the new file for it to load.  Otherwise, we produce false
   * to signal that it should load the original file.
   */
  const handleOfflineBackup = (backupOurs, uploadOurs, fileId, offlineFile, email, userId) => {
    return backupOfflineBackupForResume(offlineFile).then(() => {
      if (backupOurs) {
        logger.info(
          `Backing up a local version of ${fileId} because both offline and online versions changed.`
        )
        const date = new Date()
        const file = {
          ...offlineFile,
          file: {
            ...offlineFile.file,
            fileName: `${decodeURI(offlineFile.file.fileName)} - Resume Backup - ${
              date.getMonth() + 1
            }-${date.getDate()}-${date.getFullYear()}`,
          },
        }
        return uploadProject(localClient, file, email, userId)
          .then((result) => ({
            ...offlineFile,
            file: {
              ...offlineFile.file,
              id: result.data.fileId,
            },
          }))
          .then(() => {
            return false
          })
      } else if (uploadOurs) {
        logger.info(
          `Overwriting the cloud version of ${fileId} with a local offline version because it didn't change but the local version did.`
        )
        return machineId().then((clientId) => {
          return overwriteAllKeys(fileId, clientId, {
            ...removeSystemKeys(offlineFile),
            file: {
              ...offlineFile.file,
              fileName: offlineFile.file.originalFileName || offlineFile.file.fileName,
            },
          }).catch((error) => {
            logger.error(`Error uploading our offline file ${fileId}`, error)
            recordedErrorsDuringStartup.push({
              message: `Error uploading our offline file ${fileId}`,
              error,
            })
            return showErrorBox(
              t('Error'),
              t('There was an error uploading your offline backup. Please exit and start again')
            )
          })
        })
      }
      return Promise.resolve(false)
    })
  }

  function handleNoFileId(fileId, fileURL) {
    const errorObject = new Error('Could not open cloud file.')
    recordedErrorsDuringStartup.push({
      message: `Attempted to open ${fileURL} as a cloud file, but it's not a cloud file.  We think it's id is ${fileId} based on that name.`,
      error: errorObject,
    })
    logger.error(
      `Attempted to open ${fileURL} as a cloud file, but it's not a cloud file.  We think it's id is ${fileId} based on that name.`,
      errorObject
    )
    return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(() => {
      return Promise.reject(
        new Error(`Cannot open file with id: ${fileId} from fileURL: ${fileURL}`)
      )
    })
  }

  function handleNoUserId(fileURL) {
    const errorMessage = `Tried to boot plottr cloud file (${fileURL}) without a user id.`
    recordedErrorsDuringStartup.push({ message: errorMessage, error: new Error(errorMessage) })
    return Promise.reject(new Error(errorMessage))
  }

  const handleEroneousUserStates = (fileURL) => (user) => {
    if (typeof user?.uid !== 'string') {
      return handleNoUserId(fileURL)
    }
    return user
  }

  const computeAndHandleResumeDirectives = (fileId, email, userId, json) => {
    return fileSystemAPIs.currentAppSettings().then((settings) => {
      if (!settings.user.enableOfflineMode) {
        return Promise.resolve(false)
      }
      const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
      return offlineFileURLFromFile(localClient, fileURL).then((offlineURL) => {
        if (!offlineURL) {
          logger.warn(`Could not compute an offline path for file: ${JSON.stringify(json?.file)}`)
          return Promise.resolve(false)
        }
        const offlinePath = helpers.file.withoutProtocol(offlineURL)
        return localClient
          .fileExists(offlinePath)
          .then((exists) => {
            return offlinePath && exists
          })
          .then((exists) => {
            return exists
              ? localClient.readFile(offlinePath).then((file) => {
                  return JSON.parse(file)
                })
              : Promise.resolve(null)
          })
          .then((offlineFile) => {
            if (!offlineFile) {
              return false
            }
            if (!offlineFile.file) {
              logger.warn(
                `There's an offline backup of file with id ${fileId} at ${offlinePath}, but it appears to be broken or incomplete`
              )
              return Promise.resolve(false)
            }
            const [uploadOurs, backupOurs] = resumeDirective(offlineFile, json)
            return handleOfflineBackup(backupOurs, uploadOurs, fileId, offlineFile, email, userId)
          })
      })
    })
  }

  const afterLoading = (userId, saveBackup) => (json) => {
    logger.info(`Loaded file ${json.file.fileName}.`)
    exportToSelfContainedPlottrFile(
      json,
      userId,
      cachedDowloadStorageImage.downloadStorageImage
    ).then((selfContainedFile) => {
      saveBackup(`${json.file.fileName}.pltr`, mountState(selfContainedFile))
    })
  }

  const bootWithUser = (fileId, saveBackup) => (user) => {
    const userId = user.uid
    const email = user.email
    return Promise.all([getVersion(), machineId()]).then(([version, clientId]) => {
      return initialFetch(userId, fileId, clientId, version)
        .then((fetchedFile) => {
          return computeAndHandleResumeDirectives(fileId, email, userId, fetchedFile)
            .then(migrate(fetchedFile, fileId))
            .then(afterLoading(userId, saveBackup))
        })
        .then((result) => {
          const permission = selectors.permissionSelector(store().getState())
          return writeUserOwnershipNote(userId, fileId, permission).then(() => {
            return result
          })
        })
        .catch((error) => {
          const errorMessage = `Error fetching ${fileId} for user: ${userId}, clientId: ${clientId}`
          logger.error(errorMessage, error)
          recordedErrorsDuringStartup.push({ message: errorMessage, error })
          if (error.message === UPDATE_MESSAGE) {
            return Promise.reject(error)
          } else {
            return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(
              () => {
                return Promise.reject(error)
              }
            )
          }
        })
    })
  }

  const handleErrorBootingFile = (fileId) => (error) => {
    return machineId().then((clientId) => {
      const errorMessage = `Error booting ${fileId} clientId: ${clientId}`
      logger.error(errorMessage, error)
      recordedErrorsDuringStartup.push({ message: errorMessage, error })
      if (error.message === UPDATE_MESSAGE) {
        return Promise.reject(error)
      } else {
        return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(() => {
          return Promise.reject(error)
        })
      }
    })
  }

  function bootCloudFile(fileURL, saveBackup) {
    const fileId = fileURL.split('plottr://')[1]
    if (!fileId) {
      return handleNoFileId(fileId, fileURL)
    }

    return waitForUser()
      .then(handleEroneousUserStates(fileURL))
      .then(bootWithUser(fileId, saveBackup))
      .catch(handleErrorBootingFile(fileId))
  }

  function bootLocalFile(fileURL, numOpenFiles, saveBackup) {
    return setWindowTitle('Plottr')
      .then(() => {
        return setRepresentedFileName(helpers.file.withoutProtocol(fileURL))
      })
      .then(() => {
        return offlineFileURL(localClient, fileURL)
          .then((offlineFileURL) => {
            const filePath = helpers.file.withoutProtocol(
              bootingOfflineFile ? offlineFileURL : fileURL
            )
            return localClient
              .readFile(filePath)
              .then((rawFile) => {
                return JSON.parse(rawFile)
              })
              .then((json) => {
                // In case this file was downloaded and we want to open it while
                // logged out, we need to reset the cloud flag.  (This is usually
                // set when we receive the file from Firebase, but it gets
                // synchronised back up to the database and if you then download
                // the file it'll be there.)
                //
                // This use case is actually quite common: you might
                // want to simply open a backup file locally.
                return {
                  ...json,
                  file: {
                    ...json.file,
                    isCloudFile: false,
                  },
                }
              })
          })
          .then((json) => {
            return saveBackup(fileURL, json).then(() => {
              return json
            })
          })
          .then((json) => {
            return getVersion().then((version) => {
              return new Promise((resolve, reject) => {
                migrateIfNeeded(
                  version,
                  json,
                  fileURL,
                  null,
                  (err, didMigrate, state) => {
                    if (err) {
                      recordedErrorsDuringStartup.push({
                        message: 'Error migrating file',
                        error: err,
                      })
                      logger.error(err)
                      if (err === 'Plottr behind file') {
                        return reject(new Error(UPDATE_MESSAGE))
                      }
                      return reject(`bootLocalFile002: migration (${fileURL})`)
                    }
                    store().dispatch(
                      actions.ui.loadFile(
                        state.file.fileName || helpers.file.withoutProtocol(fileURL),
                        didMigrate,
                        state,
                        state.file.version,
                        fileURL
                      )
                    )
                    store().dispatch(
                      actions.project.selectFile({
                        ...state.file,
                        fileURL,
                        id: helpers.file.fileIdFromPlottrProFile(fileURL),
                      })
                    )

                    MPQ.projectEventStats(
                      'open_file',
                      {
                        online: navigator.onLine,
                        version: state.file.version,
                        number_open: numOpenFiles,
                      },
                      state
                    )

                    if (state && state.tour && state.tour.showTour)
                      store().dispatch(actions.ui.changeOrientation('horizontal'))

                    return machineId().then((clientId) => {
                      store().dispatch(actions.client.setClientId(clientId))

                      resolve(null)
                    })
                  },
                  logger
                )
              })
            })
          })
      })
  }

  function _bootFile(fileURL, options, numOpenFiles, saveBackup) {
    const latestExpiryDate = selectors.latestExpiryDateSelector(store().getState())
    const inTrialMode = selectors.isInTrialModeSelector(store().getState())
    return getVersion().then((version) => {
      const dateBooted = helpers.date.versionToDate(version)
      if (dateBooted === null) {
        const message = `Invalid file version: ${version}`
        recordedErrorsDuringStartup.push({
          message,
          error: new Error('Invalid file version'),
        })
        logger.error(message)
        store().dispatch(actions.applicationState.errorLoadingFile())
        return Promise.reject(new Error(message))
      } else if (
        !inTrialMode &&
        latestExpiryDate !== null &&
        latestExpiryDate < helpers.date.subtractMonths(dateBooted, 3)
      ) {
        showErrorBox(
          t('Error'),
          t('Your license expired before this version of Plottr was released')
        )
        return new Promise(() => {
          // Never resolve, because we'd rather just quit.
          setTimeout(() => {
            window.close()
          }, 3000)
        })
      } else {
        if (!helpers.file.isProtocolString(fileURL)) {
          const message = `Can't boot a file without a protocol: ${fileURL}`
          recordedErrorsDuringStartup.push({
            message,
            error: new Error('Cannot boot file without protocol'),
          })
          logger.error(message)
          store().dispatch(actions.applicationState.errorLoadingFile())
          return Promise.reject(new Error(message))
        }
        store().dispatch(actions.applicationState.startLoadingFile())

        // Now that we know what the file path for this window should be,
        // tell the main process.
        return setMyFilePath(fileURL).then(() => {
          // And then boot the file.
          const isCloudFile = isPlottrCloudFile(fileURL) && !bootingOfflineFile
          const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(store().getState())
          if (isCloudFile && !isInProMode) {
            const error = Error(
              "Error booting file.  Attempted to boot pro file, but we're not in Pro"
            )
            recordedErrorsDuringStartup.push({
              message: `Error booting a file: ${fileURL}`,
              error,
            })
            return Promise.reject(error)
          } else {
            try {
              return (
                isCloudFile
                  ? bootCloudFile(fileURL, saveBackup)
                  : bootLocalFile(fileURL, numOpenFiles, saveBackup)
              )
                .then(() => {
                  store().dispatch(actions.applicationState.finishLoadingFile())
                })
                .catch((error) => {
                  nukeLastKnown()
                  logger.error(error)
                  recordedErrorsDuringStartup.push({
                    message: `Error booting the file: ${fileURL}`,
                    error,
                  })
                  store().dispatch(
                    actions.applicationState.errorLoadingFile(error.message === UPDATE_MESSAGE)
                  )
                })
            } catch (error) {
              nukeLastKnown()
              logger.error(error)
              recordedErrorsDuringStartup.push({
                message: `Error booting a file: ${fileURL}`,
                error,
              })
              store().dispatch(actions.applicationState.errorLoadingFile())
              return Promise.reject(error)
            }
          }
        })
      }
    })
  }

  return _bootFile(fileURL, options, numOpenFiles, saveBackup).then(() => {
    if (saverRef.current) {
      saverRef.current.cancelAllRemainingRequests()
    }
    const postSaveHook = () => {
      const isDeviceFile = selectors.isDeviceFileSelector(store().getState())
      if (isDeviceFile) {
        markProjectAsSaved()
      }
      store().dispatch(actions.ui.fileSaved())
    }
    const postBackupHook = () => {
      // NOP
    }
    const state = store().getState()
    const licenseUserObject = selectors.userSettingsSelector(state)
    const userId = selectors.userIdSelector(state) || licenseUserObject.payment_id || 'UNKNOWN_USER'
    const userEmail =
      selectors.emailAddressSelector(state) || licenseUserObject.customer_email || 'UNKNOWN_EMAIL'
    Promise.all([pleaseTellMeWhatPlatformIAmOn(), getVersion()])
      .then(([os, version]) => {
        const errorReporter = createErrorReporter(
          process.env.ROLLBAR_ACCESS_TOKEN,
          version,
          process.env.NODE_ENV,
          logger,
          'app_entrypoint',
          os,
          userId,
          userEmail
        )
        const errorReportingLogger = {
          info: logger.info,
          warn: logger.warn,
          error: (...args) => {
            logger.error(...args)
            errorReporter.error(...args)
          },
        }
        if (recordedErrorsDuringStartup.length > 0) {
          recordedErrorsDuringStartup.forEach(({ message, error }) => {
            errorReporter.error(message, error)
          })
          // Drain the errors reported during startup to save on
          // memory and remove ambiguity.
          recordedErrorsDuringStartup.splice(0, recordedErrorsDuringStartup.length)
        }
        saverRef.current = Saver(
          () => {
            return store().getState()
          },
          saveFile(localClient, errorReportingLogger, postSaveHook),
          backupFile(
            localClient,
            saveBackupOnFirebase,
            cachedDowloadStorageImage.downloadStorageImage,
            errorReportingLogger,
            postBackupHook
          ),
          SAVE_INTERVAL_MS,
          BACKUP_INTERVAL_MS,
          errorReportingLogger,
          (title, message) => {
            showMessageBox(title, message)
          },
          (title, message) => {
            showErrorBox(title, message)
          },
          isRestarting,
          () => {
            return selectors.isLoggedInSelector(store().getState())
          },
          offerSaveAsThenQuit
        )
      })
      .catch((error) => {
        logger.error(`Could not set up auto saver.  Bailing.  ${error.message}`)
        return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(() => {
          setTimeout(() => {
            window.close()
          }, 3000)
        })
      })
      .finally(() => {
        bootingFile.current = null
      })
  })
}
