import { t } from 'plottr_locales'
import { helpers, reducers, emptyFile, migrateIfNeeded, addMissingKeys, errorCodes } from 'pltr'
import { actions, selectors } from 'wired-up-pltr'
import { fetchFileJson } from 'wired-up-firebase'

import { openExistingFile as _openExistingFile } from './common/utils/window_manager'
import { store } from './app/store'
import logger from '../shared/logger'
import { uploadToFirebase } from './upload-to-firebase'
import { makeMainProcessClient } from './app/mainProcessClient'
import { getErrorReporterInstance } from '../shared/error-reporter-instance'

const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]

const {
  getVersion,
  showSaveDialog,
  showErrorBox,
  editKnownFilePath,
  userDocumentsPath,
  addToKnownFilesAndOpen,
  showOpenDialog,
} = makeMainProcessClient()

export const newEmptyFile = (fileName, appVersion, currentFile) => {
  const emptyFileState = emptyFile(fileName, appVersion)
  return {
    ...emptyFileState,
    project: currentFile.project,
    client: currentFile.client,
    permission: reducers.permission(),
    error: reducers.error(),
  }
}

const newFileName = (fileList, name) => {
  if (name) {
    return name
  }

  const untitledFileList = fileList.filter(({ fileName }) => {
    return fileName && fileName.match(/Untitled/g)
  })
  return t('Untitled') + ` - ${untitledFileList.length}`
}

export const newFile = (
  emailAddress,
  userId,
  fileList,
  state,
  clientId,
  template,
  openFile,
  name
) => {
  const fileName = newFileName(fileList, name)
  return getVersion().then((version) => {
    const newFile = newEmptyFile(fileName, version, state)
    const file = Object.assign({}, newFile, template?.templateData || {})
    if (!file.beats.series) {
      file.beats.series = newFile.beats.series
    }
    if (file.books[1]) {
      file.books[1].title = fileName
    }
    if (fileName) {
      file.series.name = fileName
    }
    return uploadToFirebase(emailAddress, userId, file, fileName).then((response) => {
      const fileId = response.data.fileId
      const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
      openFile(fileURL, false)
      return fileId
    })
  })
}

export const uploadExisting = (localClient, emailAddress, userId, fullState) => {
  const filePath = fullState.file.fileName
  return localClient
    .extname(filePath)
    .then((extension) => {
      return localClient.basename(filePath, extension)
    })
    .then((fileName) => {
      return uploadToFirebase(emailAddress, userId, fullState, fileName)
    })
}

export const messageRenameFile = (fileId) => {
  const renameEvent = new Event('rename-file', { bubbles: true, cancelable: false })
  // @ts-ignore
  renameEvent.fileId = fileId
  document.dispatchEvent(renameEvent)
}

export const saveFile = (localClient, fileURL, file) => {
  return localClient.saveFile(fileURL, file)
}

export { editKnownFilePath }

export const offlineFileURLFromFile = (localClient, fileURL) => {
  if (!fileURL || typeof fileURL !== 'string') {
    return Promise.resolve(null)
  } else {
    return localClient.offlineFileURL(fileURL)
  }
}

export const renameFile = (localClient, fileURL) => {
  const state = store().getState()
  const isCloudFile = selectors.isCloudFileSelector(state)
  const isOffline = selectors.isOfflineSelector(state)
  if (isOffline && isCloudFile) {
    logger.info('Tried to save-as a file, but it is offline', fileURL)
    return Promise.resolve()
  }
  if (helpers.file.urlPointsToPlottrCloud(fileURL)) {
    const fileList = selectors.knownFilesSelector(state)
    const fileId = fileURL.replace(/^plottr:\/\//, '')
    if (!fileList.find(({ id }) => id === fileId)) {
      getErrorReporterInstance().then((errorReporter) => {
        errorReporter.error(
          `Coludn't find file with id: ${fileId} to rename`,
          new Error('Error renaming file')
        )
      })
      logger.error(`Coludn't find file with id: ${fileId} to rename`)
      return Promise.resolve()
    }
    if (fileId) messageRenameFile(fileId)
    return Promise.resolve()
  }
  return localClient
    .basename(helpers.file.withoutProtocol(fileURL))
    .then((basenameWithExtension) => {
      return localClient.currentAppSettings().then((settings) => {
        const basePath = settings?.user?.defaultFolder
          ? Promise.resolve(settings?.user?.defaultFolderLocation)
          : userDocumentsPath()
        return basePath.then((path) => {
          return localClient.join(path, basenameWithExtension)
        })
      })
    })
    .then((defaultPath) => {
      return showSaveDialog(filters, t('Give this file a new name'), defaultPath).then(
        (fileName) => {
          if (fileName) {
            try {
              const newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
              const newFileURL = `device://${newFilePath}`
              return localClient
                .readFile(helpers.file.withoutProtocol(fileURL), 'utf-8')
                .then((rawFile) => {
                  const contents = JSON.parse(rawFile)
                  return saveFile(localClient, newFileURL, contents)
                    .then(() => {
                      return localClient.trash(fileURL, true)
                    })
                    .then(() => {
                      return editKnownFilePath(fileURL, newFileURL)
                    })
                    .then(() => {
                      store().dispatch(actions.applicationState.finishRenamingFile())
                    })
                })
                .catch((error) => {
                  logger.error('Error renaming file', error)
                  getErrorReporterInstance().then((errorReporter) => {
                    errorReporter.error('Error renaming file', error)
                  })
                  store().dispatch(actions.applicationState.finishRenamingFile())
                  if (error.code === errorCodes.FILE_LACKS_ALL_KEYS) {
                    return showErrorBox(
                      t('File too old'),
                      t('Please open and then close the file before renaming it.')
                    )
                  } else {
                    return showErrorBox(t('Error'), t('There was an error doing that. Try again'))
                  }
                })
            } catch (error) {
              logger.error('Error renaming file', error)
              getErrorReporterInstance().then((errorReporter) => {
                errorReporter.error('Error renaming file', error)
              })
              store().dispatch(actions.applicationState.finishRenamingFile())
              return showErrorBox(t('Error'), t('There was an error doing that. Try again'))
            }
          }
          return Promise.resolve()
        }
      )
    })
}

export const deleteCloudBackupFile = (localClient, fileURL) => {
  return localClient.offlineFileBasePath().then((offlineFileFilesPath) => {
    if (
      !helpers.file.isDeviceFileURL(fileURL) ||
      !helpers.file.withoutProtocol(fileURL).startsWith(offlineFileFilesPath)
    ) {
      return Promise.reject(
        new Error(`Attempted to delete an offline file for non-offline file: ${fileURL}`)
      )
    }

    const filePath = helpers.file.withoutProtocol(fileURL)
    return localClient.rmRf(filePath).catch((_error) => {
      // Ignore errors deleting the backup file.
      return true
    })
  })
}

const migrateSaveAndOpen = (localClient, json, oldUrl, newFileURL) => {
  return getVersion().then((version) => {
    return new Promise((resolve, reject) => {
      migrateIfNeeded(version, json, oldUrl, null, (err, _didMigrate, migratedState) => {
        if (err) {
          reject(err)
        } else {
          console.log('addMissingKeys(migratedState)', addMissingKeys(migratedState))
          saveFile(localClient, newFileURL, addMissingKeys(migratedState)).then(() => {
            addToKnownFilesAndOpen(newFileURL, true).then(resolve).catch(reject)
          })
        }
      })
    })
  })
}

export const createAndOpenCopy = (localClient, oldFilePathSegments, copiedFileName) => {
  return localClient.currentAppSettings().then((settings) => {
    return localClient.join(...oldFilePathSegments).then((oldFilePath) => {
      return localClient.readFile(oldFilePath).then((fileText) => {
        const fileJSON = JSON.parse(fileText)
        if (settings.user.defaultFolder && settings.user.defaultFolderLocation) {
          return localClient
            .join(
              settings.user.defaultFolderLocation,
              helpers.file.ensureEndsInPltr(copiedFileName)
            )
            .then((newFullPath) => {
              return localClient.findUniqueNameInPath(newFullPath).then((uniquePath) => {
                const newFileURL = helpers.file.filePathToFileURL(uniquePath)
                return migrateSaveAndOpen(localClient, fileJSON, oldFilePath, newFileURL)
              })
            })
        } else {
          return userDocumentsPath().then((docPath) => {
            return localClient
              .join(docPath, helpers.file.ensureEndsInPltr(copiedFileName))
              .then((newFullPath) => {
                return showSaveDialog(
                  filters,
                  t('Where would you like to save this copy?'),
                  newFullPath
                ).then((fileName) => {
                  if (fileName) {
                    const newFilePath = helpers.file.ensureEndsInPltr(fileName)
                    const newFileURL = helpers.file.filePathToFileURL(newFilePath)
                    return migrateSaveAndOpen(localClient, fileJSON, oldFilePath, newFileURL)
                  } else {
                    return Promise.reject(
                      new Error(
                        `Failed to create new file name for creating and opening a copy: ${copiedFileName}`
                      )
                    )
                  }
                })
              })
          })
        }
      })
    })
  })
}

export const userFilePickerDefaultFolder = () => {
  const hasDefaultFolder = selectors.hasDefaultFolderSelector(store().getState())
  if (hasDefaultFolder) {
    return Promise.resolve(selectors.defaultFolderLocationSelector(store().getState()))
  } else {
    return userDocumentsPath()
  }
}

export const openExistingFile = (localClient, uploadToProAsDuplicate) => {
  const state = store().getState()
  const isInOfflineMode = selectors.isInOfflineModeSelector(state)
  if (!isInOfflineMode) {
    const emailAddress = selectors.emailAddressSelector(state)
    const userId = selectors.userIdSelector(state)
    const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
    if (isInProMode) {
      store().dispatch(actions.applicationState.startUploadingFileToCloud())
    }

    store().dispatch(actions.project.showLoader(true))
    userFilePickerDefaultFolder().then((defaultPath) => {
      // ask user where it is
      const properties = ['openFile', 'createDirectory']
      showOpenDialog('', filters, properties, defaultPath).then((files) => {
        if (files.length === 0) {
          return Promise.resolve()
        } else {
          const filePath = files && files.length && files[0]
          localClient
            .isInBackupFolder(helpers.file.filePathToFileURL(filePath))
            .then((isInBackupFolder) => {
              if (isInBackupFolder) {
                // Open as backup
                return localClient.basename(filePath, '.pltr').then((name) => {
                  const newName = helpers.file.genericBackupNameForToday(name)
                  return localClient.pathSep().then((sep) => {
                    const localFilePathSegments = ['/'].concat(filePath.split(sep))
                    if (isInProMode) {
                      uploadToProAsDuplicate(localFilePathSegments, newName).then(() => {
                        store().dispatch(actions.applicationState.finishUploadingFileToCloud())
                      })
                    } else {
                      createAndOpenCopy(localClient, localFilePathSegments, newName)
                    }
                  })
                })
              } else {
                _openExistingFile(localClient, isInProMode, userId, emailAddress, filePath)
                  .then(() => {
                    logger.info('Opened existing file')
                    store().dispatch(actions.project.showLoader(false))
                    if (isInProMode) {
                      store().dispatch(actions.applicationState.finishUploadingFileToCloud())
                    }
                  })
                  .catch((error) => {
                    logger.error('Error opening existing file', error)
                    getErrorReporterInstance().then((errorReporter) => {
                      errorReporter.error('Error opening existing file', error)
                    })
                    showErrorBox(t('Error'), t('There was an error doing that. Try again.')).then(
                      () => {
                        store().dispatch(actions.project.showLoader(false))
                        if (isInProMode) {
                          store().dispatch(actions.applicationState.finishUploadingFileToCloud())
                        }
                      }
                    )
                  })
              }
            })
        }
      })
    })
  }
}

export const showRecentFilesInImportModal = () => {
  const state = store().getState()
  const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
  if (isInProMode) {
    return store().dispatch(actions.ui.showProAccountRecentFiles())
  }
}

export const importExistingCloudFile = (fileURL) => {
  const state = store().getState()
  store().dispatch(actions.applicationState.startProjectImporter())
  const isInProMode = selectors.isLoggedIntoProWithActiveLicenseSelector(state)
  const userId = selectors.userIdSelector(state)
  const clientId = selectors.clientIdSelector(state)
  const isCloudFile = helpers.file.urlPointsToPlottrCloud(fileURL)

  if (isInProMode && !!isCloudFile) {
    const fileId = helpers.file.fileIdFromPlottrProFile(fileURL)
    return getVersion()
      .then((version) => {
        return fetchFileJson(userId, fileId, clientId, version).then((fetchedFile) => {
          return new Promise((resolve, reject) => {
            migrateIfNeeded(
              version,
              fetchedFile,
              fileURL,
              null,
              (error, didMigrate, migratedState) => {
                if (error) {
                  getErrorReporterInstance().then((errorReporter) => {
                    errorReporter.error('Error migrating file', error)
                  })
                  logger.error('Error migrating file', error)
                  reject(error)
                  return
                } else {
                  const fileState = addMissingKeys(migratedState)
                  const state = store().getState()
                  const fullSystemState = selectors.fullSystemStateSelector(state)
                  store().dispatch(actions.ui.showImportDataPicker(fileState, fullSystemState))
                  store().dispatch(actions.applicationState.finishProjectImporter())
                  resolve(null)
                }
              }
            )
          })
        })
      })
      .catch((error) => {
        store().dispatch(actions.applicationState.finishProjectImporter())
        return showErrorBox(t('Error'), t('There was an error doing that. Try again')).then(() => {
          return Promise.reject(error)
        })
      })
  } else if (!isInProMode && !!isCloudFile) {
    store().dispatch(actions.applicationState.finishProjectImporter())
    return showErrorBox(
      t('Error importing file'),
      t("Attempted to import pro file, but we're not in Pro")
    )
  }
}

export const importExistingFile = (localClient) => {
  return userFilePickerDefaultFolder().then((defaultPath) => {
    return showOpenDialog('Choose file to import', filters, ['openFile'], defaultPath).then(
      (files) => {
        const filePath = files && files.length && files[0]

        if (typeof filePath !== 'string') {
          return Promise.resolve('No file selected')
        }
        const fileUrl = helpers.file.filePathToFileURL(filePath)

        store().dispatch(actions.applicationState.startProjectImporter())
        return localClient
          .readFile(helpers.file.withoutProtocol(filePath), 'utf-8')
          .then((rawFile) => {
            const contents = JSON.parse(rawFile)

            return getVersion()
              .then((version) => {
                return new Promise((resolve, reject) => {
                  migrateIfNeeded(
                    version,
                    contents,
                    fileUrl,
                    null,
                    (error, didMigrate, migratedState) => {
                      if (error) {
                        getErrorReporterInstance().then((errorReporter) => {
                          errorReporter.error('Error migrating file', error)
                        })
                        logger.error('Error migrating file', error)
                        reject(error)
                        return
                      } else {
                        const fileState = addMissingKeys(migratedState)
                        const state = store().getState()
                        const fullSystemState = selectors.fullSystemStateSelector(state)
                        store().dispatch(
                          actions.ui.showImportDataPicker(fileState, fullSystemState)
                        )
                        store().dispatch(actions.applicationState.finishProjectImporter())
                        resolve(null)
                      }
                    }
                  )
                })
              })
              .catch((error) => {
                getErrorReporterInstance().then((errorReporter) => {
                  errorReporter.error('Error importing project', error)
                })
              })
          })
      }
    )
  })
}

export const duplicateFile = (fileUrl, suggestedNewName, forceCloseWhenDone) => {
  const state = store().getState()
  const isLoggedIntoPro = selectors.isLoggedIntoProWithActiveLicenseSelector(state)

  const event = isLoggedIntoPro
    ? // @ts-ignore
      new Event('save-as--pro', { fileUrl, suggestedNewName })
    : // @ts-ignore
      new Event('save-as', { fileUrl })
  // @ts-ignore
  event.fileUrl = fileUrl
  // @ts-ignore
  event.suggestedNewName = suggestedNewName
  // @ts-ignore
  event.forceCloseWhenDone = forceCloseWhenDone
  document.dispatchEvent(event)
}
