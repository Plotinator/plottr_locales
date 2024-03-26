// Uncomment this to get helpful debug logs in the console re. what's
// causing re-renders! :)

// import React from 'react'
// const whyDidYouRender = require('@welldone-software/why-did-you-render')
// whyDidYouRender(React, {
//   trackAllPureComponents: true,
// })

import { setupI18n, t } from 'plottr_locales'

import { store } from 'store'

import { helpers, migrateIfNeeded, addMissingKeys } from 'pltr/v2'
import { actions, selectors } from 'wired-up-pltr'

import { rtfToHTML } from 'pltr/v2/slate_serializers/to_html'
import { convertHTMLNodeList } from 'pltr/v2/slate_deserializers/from_html'
import { imageToWebpDataURL } from 'plottr_import_export'
import exportConfig from 'plottr_import_export/src/exporter/default_config'
import world from 'world-api'

import MPQ from '../common/utils/MPQ'
import initMixpanel from '../common/utils/mixpanel'
import { ActionCreators } from 'redux-undo'
import { addNewCustomTemplate } from '../common/utils/custom_templates'
import { createFullErrorReport } from '../common/utils/full_error_report'
import { openDashboard, closeDashboard, createFromTemplate } from '../dashboard-events'
import { makeFileSystemAPIs } from '../api'
import { renderFile } from '../renderFile'
import { setOS, isWindows } from '../isOS'
import { uploadToFirebase } from '../upload-to-firebase'
import { openFile } from 'connected-components'
// import { instrumentLongRunningTasks } from './longRunning'
import { rootComponent } from './rootComponent'
import { makeFileModule } from './files'
import { openExistingFile } from '../files'
import { createClient, getPort, whenClientIsReady, setPort } from '../../shared/socket-client'
import logger from '../../shared/logger'
import { removeSystemKeys } from './bootFile'
import { makeMainProcessClient } from './mainProcessClient'
import { downloadStorageImage } from '../common/downloadStorageImage'
import createErrorReporter from '../../shared/error-reporter'
import { getErrorReporterInstance } from '../../shared/error-reporter-instance'

const {
  showErrorBox,
  showSaveDialog,
  getEnvObject,
  tellMeWhatOSImOn,
  pleaseTellMeTheSocketServerPort,
  getLocale,
  onExportFileFromMenu,
  onSave,
  onSaveAs,
  addToKnownFilesAndOpen,
  onUndo,
  onRedu,
  onCreateErrorReport,
  onCloseDashboard,
  onCreatePlottrCloudFile,
  errorImportingScrivener,
  onFinishCreatingLocalScrivenerImportedFile,
  onErrorImportingScrivener,
  onConvertRTFStringToSlate,
  replyToConvertRTFStringToSlateRequest,
  pleaseReloadMenu,
  onNewProject,
  onOpenExisting,
  onFromTemplate,
  onError,
  onUpdateWorkerPort,
  onReloadDarkMode,
  onImportScrivenerFile,
  createFromScrivener,
  listenersRegistered,
  onMPQMessage,
  onDownloadStorageImage,
  onMoveFromTemp,
  restartSocketServer,
  onCreateFileShortcut,
  showItemInFolder,
  userDesktopPath,
  askToExport,
  getVersion,
  createDesktopShortcut,
  userDocumentsPath,
  createNewFile,
  pleaseTellMeWhatPlatformIAmOn,
  markProjectAsSaved,
} = makeMainProcessClient()

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

const connectToSocketServer = (port) => {
  let doneTimeout = null
  const socketServerEventHandlers = {
    onBusy: () => {
      store().dispatch(actions.applicationState.startWorkThatPreventsQuitting())
    },
    onDone: () => {
      if (doneTimeout) {
        clearTimeout(doneTimeout)
        doneTimeout = null
      }
      doneTimeout = setTimeout(() => {
        store().dispatch(actions.applicationState.finishWorkThatPreventsQuitting())
      }, 2000)
    },
  }
  createClient(
    getPort(),
    logger,
    WebSocket,
    (error) => {
      errorReportingLogger.error(
        `Failed to reconnect to socket server on port: <${port}>.  Killing the window.`,
        error
      )
      showErrorBox(
        t('Error'),
        t("Plottr ran into a problem and can't start.  Please contact support.")
      ).then(() => {
        window.close()
      })
    },
    socketServerEventHandlers,
    restartSocketServer
  )
}

const IGNORED_ERRORS = [
  // This error happens because sticky table schedules a check that
  // doesn't check the table was unmounted.
  "Cannot read properties of undefined (reading 'childNodes')",
]
let errorReporter = null
tellMeWhatOSImOn()
  .then((osIAmOn) => {
    setOS(osIAmOn)
    onUpdateWorkerPort((newPort) => {
      logger.info(`Updating the socket server port to: ${newPort}`)
      setPort(newPort)
      connectToSocketServer(newPort)
    })
    return pleaseTellMeTheSocketServerPort()
  })
  .then((socketWorkerPort) => {
    setPort(socketWorkerPort)
    return connectToSocketServer(socketWorkerPort)
  })
  .then(() => {
    const state = store().getState()
    const licenseUserObject = selectors.userSettingsSelector(state)
    const userId = selectors.userIdSelector(state) || licenseUserObject.payment_id || 'UNKNOWN_USER'
    const userEmail =
      selectors.emailAddressSelector(state) || licenseUserObject.customer_email || 'UNKNOWN_EMAIL'
    Promise.all([pleaseTellMeWhatPlatformIAmOn(), getVersion()]).then(([os, version]) => {
      errorReporter = createErrorReporter(
        process.env.ROLLBAR_ACCESS_TOKEN,
        version,
        process.env.NODE_ENV,
        logger,
        'app.html',
        os,
        userId,
        userEmail
      )
    })
  })
  .then(() => {
    const _unsubscribeToMPQMessage = onMPQMessage((args) => {
      const finalisedArgs = typeof args === 'string' ? [args] : args
      MPQ.push(...finalisedArgs)
    })
  })
  .then(() => {
    const _unsubscribeToDownloadImage = onDownloadStorageImage((reply, url, fileId, userId) => {
      return downloadStorageImage(url, fileId, userId).then((image) => {
        imageToWebpDataURL(image).then((imageURL) => reply(imageURL))
      })
    })
  })
  .then(() => {
    const { saveOfflineFile, saveFile, isTempFile, basename, copyFile, createFileShortcut } =
      makeFileModule(whenClientIsReady)

    const fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)

    // instrumentLongRunningTasks()

    fileSystemAPIs
      .currentAppSettings()
      .then((settings) => {
        store().dispatch(actions.settings.setDarkMode(settings.user?.dark))
        return getLocale().then((locale) => {
          setupI18n(settings, { locale })
        })
      })
      .then(() => {
        getEnvObject().then((envObject) => {
          if (!window.env) {
            window.env = {}
          }
          Object.entries(envObject).forEach(([key, value]) => {
            window.env[key] = value
          })
        })
      })
      .then(() => {
        // Secondary SETUP //
        window.requestIdleCallback(
          () => {
            whenClientIsReady(
              ({ ensureBackupFullPath, ensureBackupTodayPath, attemptToFetchTemplates }) => {
                return ensureBackupFullPath()
                  .then(ensureBackupTodayPath)
                  .then(attemptToFetchTemplates)
              }
            )
            initMixpanel()
          },
          { timeout: 1000 }
        )

        document.addEventListener('save-custom-template', (event) => {
          const currentState = store().getState()
          const options = event.payload
          addNewCustomTemplate(currentState, options)
        })

        onExportFileFromMenu(({ type }) => {
          const currentState = store().getState()
          const bookId = selectors.currentTimelineSelector(currentState)
          const name = selectors.seriesNameSelector(currentState)
          const books = selectors.allBooksSelector(currentState)
          const defaultPath =
            bookId == 'series' ? name + ' ' + t('(Series View)') : books[`${bookId}`].title
          const userId = selectors.userIdSelector(currentState)
          const file = selectors.fullFileStateSelector(currentState)

          askToExport(defaultPath, file, type, exportConfig[type], userId).catch((error) => {
            errorReportingLogger.error('Error exporting', error)
            showErrorBox(t('Error'), t('There was an error doing that. Try again'))
            return
          })
        })

        onSave(() => {
          const state = store().getState()
          const isOffline = selectors.isOfflineSelector(state)
          const isOfflineModeEnabled = selectors.offlineModeEnabledSelector(state)
          const isCloudFile = selectors.isCloudFileSelector(state)
          const fileState = selectors.fullFileStateSelector(state)
          if (isCloudFile && isOffline && isOfflineModeEnabled) {
            saveOfflineFile(fileState)
              .then(() => {
                store().dispatch(actions.ui.fileSaved())
              })
              .catch((error) => {
                errorReportingLogger.error('Failed to save offline file', error)
              })
          } else if (!isCloudFile) {
            const fileURL = selectors.fileURLSelector(state)
            saveFile(fileURL, fileState)
              .then(() => {
                const isDeviceFile = selectors.isDeviceFileSelector(store().getState())
                if (isDeviceFile) {
                  markProjectAsSaved()
                }
                store().dispatch(actions.ui.fileSaved())
              })
              .catch((error) => {
                errorReportingLogger.error('Failed to save classic file', error)
                showErrorBox(t('Error'), t('There was a problem saving your file'))
              })
          }
        })

        const saveAsHandler = ({ fileUrl, suggestedNewName, forceCloseWhenDone }) => {
          const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
          const title = t('Where would you like to save this copy?')

          const forceCloseWindow = () => {
            const event = new Event('force-close')
            window.dispatchEvent(event)
          }

          whenClientIsReady(({ basename, join, saveToDefaultLocation }) => {
            return fileSystemAPIs.currentAppSettings().then((settings) => {
              const useUserDefault =
                settings.user.defaultFolder && settings.user.defaultFolderLocation
              let defaultPath = settings.user.defaultFolderLocation
              if (fileUrl) {
                const fileUrlSansProto = helpers.file.withoutProtocol(fileUrl)
                return basename(fileUrlSansProto)
                  .then((fileBaseName) => {
                    defaultPath = useUserDefault ? defaultPath : fileUrlSansProto
                    const defaultBaseName = suggestedNewName || (useUserDefault ? fileBaseName : '')
                    return useUserDefault
                      ? defaultBaseName
                      : userDocumentsPath().then((documentsPath) => {
                          return join(documentsPath, fileBaseName)
                        })
                  })
                  .then((defaultBaseName) => {
                    return join(defaultPath, defaultBaseName).then((finalDefaultPath) => {
                      return getVersion()
                        .then((version) => {
                          return whenClientIsReady(({ readFile }) => {
                            return readFile(helpers.file.withoutProtocol(fileUrl), 'utf-8').then(
                              (rawFile) => {
                                const contents = JSON.parse(rawFile)
                                return new Promise((resolve, reject) => {
                                  migrateIfNeeded(
                                    version,
                                    contents,
                                    fileUrl,
                                    null,
                                    (err, didMigrate, migratedState) => {
                                      if (err) {
                                        errorReportingLogger.error('Error migrating a file', err)
                                        if (err === 'Plottr behind file') {
                                          showErrorBox(t('Error'), t('Please update Plottr'))
                                          reject(new Error('Need to update Plottr'))
                                        } else {
                                          reject(err)
                                        }
                                      } else {
                                        resolve(contents)
                                      }
                                    }
                                  )
                                })
                              }
                            )
                          })
                        })
                        .then((migratedState) => {
                          return showSaveDialog(filters, title, finalDefaultPath).then(
                            (fileName) => {
                              if (fileName) {
                                const backupFolder = selectors.backupFolderPathSelector(
                                  store().getState()
                                )
                                if (fileName.startsWith(backupFolder)) {
                                  return showErrorBox(
                                    t('Error'),
                                    t('Please choose a destination other than your backup folder')
                                  )
                                } else {
                                  const newFilePath = helpers.file.ensureEndsInPltr(fileName)
                                  const newFileURL = helpers.file.filePathToFileURL(newFilePath)
                                  return saveFile(newFileURL, addMissingKeys(migratedState))
                                    .then(() => {
                                      store().dispatch(
                                        actions.applicationState.finishRenamingFile()
                                      )
                                      return addToKnownFilesAndOpen(newFileURL)
                                    })
                                    .then(() => {
                                      if (forceCloseWhenDone) {
                                        forceCloseWindow()
                                      }
                                    })
                                }
                              } else {
                                return Promise.resolve()
                              }
                            }
                          )
                        })
                    })
                  })
              } else {
                const currentState = store().getState()
                const isInOfflineMode = selectors.isInOfflineModeSelector(currentState)
                const fileState = selectors.fullFileStateSelector(currentState)
                if (isInOfflineMode) {
                  logger.info('Tried to save-as a file, but it is offline')
                  return Promise.resolve()
                }
                return basename(fileState.file.fileName, '.pltr').then((fileBaseName) => {
                  defaultPath = useUserDefault ? defaultPath : fileState.file.fileName
                  let defaultBaseName = suggestedNewName || (useUserDefault ? fileBaseName : '')
                  return join(defaultPath, defaultBaseName)
                    .then((defaultPath) => {
                      return useUserDefault
                        ? defaultPath
                        : userDocumentsPath().then((documentsPath) => {
                            return join(documentsPath, fileBaseName)
                          })
                    })
                    .then((finalDefaultPath) => {
                      return showSaveDialog(filters, title, finalDefaultPath).then((fileName) => {
                        if (fileName) {
                          const backupFolder = selectors.backupFolderPathSelector(
                            store().getState()
                          )
                          if (fileName.startsWith(backupFolder)) {
                            return showErrorBox(
                              t('Error'),
                              t('Please choose a destination other than your backup folder')
                            )
                          } else {
                            const newFilePath = helpers.file.ensureEndsInPltr(fileName)
                            const newFileURL = helpers.file.filePathToFileURL(newFilePath)
                            return saveFile(newFileURL, fileState)
                              .then(() => {
                                return addToKnownFilesAndOpen(newFileURL)
                              })
                              .then(() => {
                                if (forceCloseWhenDone) {
                                  forceCloseWindow()
                                }
                              })
                          }
                        } else {
                          return Promise.resolve()
                        }
                      })
                    })
                })
              }
            })
          })
        }

        // FIXME: remove this in the next release!!!  Kept for the
        // default folder release because this was discovered on the
        // eve of releasing.
        const moveFromTempHandler = () => {
          const state = store().getState()
          const file = selectors.fullFileStateSelector(state)
          const isCloudFile = selectors.isCloudFileSelector(state)
          if (isCloudFile) {
            return
          }

          isTempFile(file).then((isTemp) => {
            const oldFileURL = selectors.fileURLSelector(state)
            if (!oldFileURL) {
              errorReportingLogger.error(
                `Tried to move the current file from temp but we couldn't compute its URL.`,
                new Error('Failed to move from temp directory')
              )
              return
            }
            if (!isTemp) {
              saveFile(oldFileURL, file).then(() => {
                store().dispatch(actions.ui.fileSaved())
              })
              return
            }
            const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
            showSaveDialog(filters, t('Where would you like to save this file?')).then(
              (filePath) => {
                const newFilePath = helpers.file.ensureEndsInPltr(filePath)
                if (newFilePath) {
                  // Point at the new file
                  const newFileURL = helpers.file.filePathToFileURL(newFilePath)
                  const oldFileURL = selectors.fileURLSelector(state)
                  if (!newFilePath || !newFileURL) {
                    errorReportingLogger.error(
                      `Tried to move file at ${oldFileURL} to ${newFilePath} (path: ${newFilePath})`,
                      new Error('Need destination and source to move a file')
                    )
                    return
                  }
                  copyFile(oldFileURL, newFileURL).then(() => {
                    return basename(newFilePath).then((newFileName) => {
                      // load the new file: the only way to set a new
                      // `project.fileURL`(!)
                      store().dispatch(
                        actions.ui.loadFile(
                          newFileName,
                          false,
                          removeSystemKeys(file),
                          file.file.version,
                          newFileURL
                        )
                      )
                    })
                  })
                }
              }
            )
          })
        }
        const _unsubscribeFromMoveFromTemp = onMoveFromTemp(moveFromTempHandler)
        document.addEventListener('move-from-temp', moveFromTempHandler)

        const _unsubscribeFromSaveAs = onSaveAs(saveAsHandler)
        document.addEventListener('save-as', saveAsHandler)

        onUndo(() => {
          store().dispatch(ActionCreators.undo())
        })

        onRedu(() => {
          store().dispatch(ActionCreators.redo())
        })

        let lastError = null
        window.addEventListener('error', (event) => {
          // If we hit an unhandled error, let this be the handler.
          event.preventDefault()
          event.stopPropagation()
          const error = event.error
          if (error === lastError || IGNORED_ERRORS.includes(error.message)) {
            return
          } else {
            logger.error(error)
            errorReporter.error('Top level error handler', error)
          }
          lastError = error
        })

        document.addEventListener('keydown', (e) => {
          const state = store().getState()
          const cardDialogIsOpen = selectors.cardDialogCardIdSelector(state)
          const attributesDialogIsOpen = selectors.attributesDialogIsOpenSelector(state)
          const viewIsTimeline = selectors.currentViewSelector(state)
          const actConfigModalIsOpen = selectors.actConfigModalIsOpenSelector(state)
          const searchModalIsOpen = selectors.searchDialogIsOpenSelector(state)
          if (!cardDialogIsOpen) {
            const table = document.querySelector('.sticky-table')
            const targetIsEditable = e.target.isContentEditable || e.target.nodeName === 'INPUT'
            // No redux state for a few.  Here's a catch all for modals.
            const aModalIsOpen = document.querySelector('.ReactModalPortal')
            const aPopoverIsOpen = document.querySelector('.react-tiny-popover-container')
            const SCROLL_KEYS = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft']
            if (
              !searchModalIsOpen &&
              !aModalIsOpen &&
              !aPopoverIsOpen &&
              !actConfigModalIsOpen &&
              !targetIsEditable &&
              !attributesDialogIsOpen &&
              typeof table?.scrollTop === 'number' &&
              typeof table?.scrollLeft === 'number' &&
              viewIsTimeline &&
              typeof table !== 'undefined' &&
              SCROLL_KEYS.includes(e.key)
            ) {
              e.preventDefault()
              e.stopPropagation()
              if (e.key === 'ArrowUp') {
                let amount = 300
                if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
                table.scrollTop -= amount
              } else if (e.key === 'ArrowRight') {
                let amount = 400
                if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
                table.scrollLeft += amount
              } else if (e.key === 'ArrowDown') {
                let amount = 300
                if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
                table.scrollTop += amount
              } else if (e.key === 'ArrowLeft') {
                let amount = 400
                if (e.metaKey || e.ctrlKey || e.altKey) amount = 800
                table.scrollLeft -= amount
              }
            }
          }
        })

        window.logger = function (which) {
          process.env.LOGGER = which.toString()
        }

        onCreateErrorReport(() => {
          createFullErrorReport()
        })

        onCloseDashboard(closeDashboard)

        onCreatePlottrCloudFile((json, fileName, isScrivenerFile) => {
          const state = store().getState()
          const emailAddress = selectors.emailAddressSelector(state)
          const userId = selectors.userIdSelector(state)
          uploadToFirebase(emailAddress, userId, json, fileName)
            .then((response) => {
              const fileId = response.data.fileId
              if (!fileId) {
                const message = `Tried to create cloud file for ${fileName} but we didn't get a fileId back`
                errorReportingLogger.error(message, new Error('Error creating plottr cloud file'))
                return Promise.reject(new Error(message))
              }
              const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
              openFile(fileURL, false)

              if (isScrivenerFile) {
                store().dispatch(actions.applicationState.finishScrivenerImporter())
              }

              closeDashboard()
              return fileId
            })
            .catch((error) => {
              errorImportingScrivener(error)
            })
        })

        onFinishCreatingLocalScrivenerImportedFile(() => {
          store().dispatch(actions.applicationState.finishScrivenerImporter())
        })

        onErrorImportingScrivener((error) => {
          logger.warn('[scrivener import]', error)
          errorReporter.error(`Error importing from scrivener ${error}`)
          store().dispatch(actions.applicationState.finishScrivenerImporter())
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        })

        onConvertRTFStringToSlate((rtfString, conversionId) => {
          rtfToHTML(rtfString).then((html) => {
            return replyToConvertRTFStringToSlateRequest(conversionId, convertHTMLNodeList(html))
          })
        })

        const reloadMenu = () => pleaseReloadMenu()
        window.addEventListener('load', reloadMenu)
        window.addEventListener('focus', reloadMenu)

        onNewProject(() => {
          fileSystemAPIs.currentAppSettings().then((settings) => {
            if (settings.user.defaultFolder && settings.user.defaultFolderLocation) {
              store().dispatch(actions.project.startCreatingNewProject())
            } else {
              userDocumentsPath().then((docPath) => {
                const title = t('Choose where to save this file on your computer')
                const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
                showSaveDialog(filters, title, docPath).then((fileName) => {
                  if (fileName) {
                    const backupFolder = selectors.backupFolderPathSelector(store().getState())
                    if (fileName.startsWith(backupFolder)) {
                      showErrorBox(
                        t('Error'),
                        t('Please choose a destination other than your backup folder')
                      )
                    } else {
                      const newFilePath = helpers.file.ensureEndsInPltr(fileName)
                      createNewFile(null, newFilePath)
                    }
                  }
                })
              })
            }
          })
        })

        onCreateFileShortcut((sourceFile, destinationURL) => {
          if (destinationURL == 'desktop') {
            return userDesktopPath().then((desktopPath) => {
              if (isWindows()) {
                return createDesktopShortcut(sourceFile, desktopPath).then((shortcut) => {
                  return showItemInFolder(shortcut)
                })
              } else {
                return createFileShortcut(sourceFile, desktopPath).then((shortcut) => {
                  return showItemInFolder(shortcut)
                })
              }
            })
          } else {
            if (isWindows()) {
              return createDesktopShortcut(sourceFile, destinationURL).then((shortcut) => {
                return showItemInFolder(shortcut)
              })
            } else {
              return createFileShortcut(sourceFile, destinationURL).then((shortcut) => {
                return showItemInFolder(shortcut)
              })
            }
          }
        })

        onOpenExisting(() => openExistingFile())
        onFromTemplate(() => {
          openDashboard()
          setTimeout(createFromTemplate, 300)
        })

        onError(({ message, source }) => {
          logger.error(`Error reported via IPC from <${source}> with message: ${message}`)
          store().dispatch(actions.error.saveTempFileError(message))
        })

        onReloadDarkMode((newValue) => {
          fileSystemAPIs.saveAppSetting('user.dark', newValue).catch((error) => {
            logger.error(`Failed to set user.dark to ${newValue}`, error)
          })
          store().dispatch(actions.settings.setDarkMode(newValue))
        })

        onImportScrivenerFile((sourceFile, destinationFile) => {
          logger.info(`Received instruction to import from ${sourceFile} to ${destinationFile}`)
          createFromScrivener(sourceFile, false, destinationFile)
        })

        // TODO: not sure when/whether we should unsubscribe.  Presumably
        // when the window is refreshed/closed?
        //
        // Could be important to do so because it might set up inotify
        // listeners and too many of those cause slow-downs.
        const _unsubscribeToPublishers = world(whenClientIsReady).publishChangesToStore(store())

        const root = rootComponent()

        renderFile(root, whenClientIsReady)

        listenersRegistered()
      })
      .then(() => {
        whenClientIsReady(({ savePlottrLicense, saveProLicense }) => {
          savePlottrLicense('secrets', {
            id: 'bro_machine_1',
            name: 'charles',
            os: 'mega_os',
            localUsername: 'sam',
          })
          saveProLicense('secrets', {
            id: 'bro_machine_1',
            name: 'charles',
            os: 'mega_os',
            localUsername: 'sam',
          })
        })
      })
  })
