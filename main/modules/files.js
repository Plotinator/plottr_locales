import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import { app, ipcMain, dialog } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'

import { addToKnownFiles, addToKnown } from './known_files'
import currentSettings from './settings'
import { importFromSnowflake, importFromScrivener } from 'plottr_import_export'

import { helpers, emptyFile, tree, SYSTEM_REDUCER_KEYS, specialCaseFixes } from 'pltr/v2'
import { openProjectWindow } from './windows/projects'
import { broadcastToAllWindows } from './broadcast'
import { OFFLINE_FILE_FILES_PATH, isOfflineFile } from './offlineFilePath'
import { whenClientIsReady } from '../../shared/socket-client'
import createErrorReporter from '../../shared/error-reporter'

const { writeFile } = fs.promises
const { addHierarchiesIfMissing } = specialCaseFixes

const makeFileModule = (errorReportingLogger) => {
  const saveFile = (fileURL, jsonData) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(fileURL, jsonData)
    })
  }

  function removeFromKnownFiles(fileURL) {
    return whenClientIsReady(({ removeFromKnownFiles }) => {
      return removeFromKnownFiles(fileURL)
    })
  }

  function deleteKnownFile(fileURL) {
    return whenClientIsReady(({ deleteKnownFile }) => {
      return deleteKnownFile(fileURL)
    })
  }

  function editKnownFilePath(oldPath, newPath) {
    return whenClientIsReady(({ editKnownFilePath }) => {
      return editKnownFilePath(oldPath, newPath)
    })
  }

  function saveToDefaultLocation(json, name) {
    return whenClientIsReady(({ saveToDefaultLocation }) => {
      return saveToDefaultLocation(json, name)
    })
  }

  function newFileFromTemplate(template, name) {
    if (!name) {
      return addHierarchiesIfMissing(template.templateData)
    }

    return addHierarchiesIfMissing({
      ...template.templateData,
      series: {
        ...template.templateData.series,
        name,
      },
    })
  }

  async function createNew(template, name) {
    return currentSettings().then(async (settings) => {
      let projectName = name || t('Untitled')
      if (!settings.user.defaultFolder) {
        projectName = path.basename(name, '.pltr')
      }

      let fileJSON = template
        ? newFileFromTemplate(template, projectName)
        : emptyFile(projectName, app.getVersion())

      if (template && fileJSON.books[1]) {
        fileJSON.books[1].title = projectName
      }

      try {
        const fileURL = await saveToDefaultLocation(fileJSON, name)
        await addToKnownFiles(fileURL)
        await openFile(fileURL)
      } catch (error) {
        errorReportingLogger.error('Failed to create a new file', name, error)
        throw error
      }
    })
  }

  function createFromSnowflake(importedPath, sender, isLoggedIntoPro) {
    const storyName = path.basename(importedPath, '.snowXML')
    let json = emptyFile(storyName, app.getVersion())
    // clear beats and lines
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    return whenClientIsReady(({ readFile }) => {
      return Promise.all([
        currentSettings(),
        importFromSnowflake(importedPath, true, json, readFile),
      ]).then(([settings, importedJson]) => {
        if (isLoggedIntoPro) {
          sender.send('create-plottr-cloud-file', importedJson, storyName)
          return Promise.resolve()
        }

        if (!settings.user.defaultFolder) {
          const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
          const title = t('Where would you like to save the imported file?')
          const destinationPath = dialog.showSaveDialog({
            filters,
            title,
            defaultPath: app.getPath('documents'),
          })
          return destinationPath.then(({ filePath, canceled }) => {
            if (canceled) {
              return Promise.resolve()
            } else {
              const finalPath = helpers.file.ensureEndsInPltr(filePath)
              return writeFile(finalPath, JSON.stringify(importedJson, null, 2)).then(() => {
                // Right now, this is only used for testing so we want to quit when we're done.
                log.info(`Finished importing from ${importedPath} to ${finalPath}`)
                const fileURL = helpers.file.filePathToFileURL(finalPath)
                return addToKnownFiles(fileURL).then(() => {
                  return openFile(fileURL)
                    .then(() => {
                      log.info('Opened file from imported snowflake data', storyName)
                      sender.send('finish-creating-local-scrivener-imported-file')
                      return true
                    })
                    .catch((error) => {
                      sender.send('error-importing-scrivener', error)
                      errorReportingLogger.error(
                        'Failed to open a known file after importing from Snowflake',
                        error
                      )
                      return Promise.reject(error)
                    })
                })
              })
            }
          })
        } else {
          return saveToDefaultLocation(importedJson, storyName)
            .then((fileURL) => {
              return addToKnownFiles(fileURL).then(() => {
                return openFile(fileURL)
              })
            })
            .catch((error) => {
              errorReportingLogger.error('Failed to create file from snowflake', error)
              return Promise.reject(error)
            })
        }
      })
    })
  }

  function createRTFConversionFunction(sender) {
    return function (rtfString) {
      return new Promise((resolve, reject) => {
        const conversionId = uuidv4()
        ipcMain.once(conversionId, (event, replyChannel, slate) => {
          event.sender.send(replyChannel, conversionId)
          resolve(slate)
        })
        sender.send('convert-rtf-string-to-slate', rtfString, conversionId)
      })
    }
  }

  function createFromScrivener(importedPath, sender, isLoggedIntoPro, destinationFile) {
    const storyName = path.basename(importedPath, '.scriv')
    let json = emptyFile(storyName, app.getVersion())
    const isScrivener = true
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    const importedJsonPromise = whenClientIsReady(
      ({ readFile, readdir, stat, extname, basename, join }) => {
        return importFromScrivener(
          importedPath,
          true,
          json,
          createRTFConversionFunction(sender),
          readFile,
          readdir,
          stat,
          extname,
          basename,
          join
        )
      }
    )

    if (isLoggedIntoPro) {
      importedJsonPromise
        .then((importedJson) => {
          sender.send('create-plottr-cloud-file', importedJson, storyName, isScrivener)
        })
        .catch((error) => {
          return sender.send('error-importing-scrivener', error)
        })
      return Promise.resolve()
    }

    return Promise.all([currentSettings(), importedJsonPromise]).then(
      ([settings, importedJson]) => {
        if (!settings.user.defaultFolder) {
          const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]
          const title = t('Where would you like to save the imported file?')
          const destinationPath =
            typeof destinationFile === 'string'
              ? Promise.resolve({ filePath: destinationFile, canceled: false })
              : dialog.showSaveDialog({ filters, title, defaultPath: app.getPath('documents') })
          return destinationPath.then(({ filePath, canceled }) => {
            if (canceled) {
              return Promise.resolve()
            } else {
              const finalPath = helpers.file.ensureEndsInPltr(filePath)
              return writeFile(finalPath, JSON.stringify(importedJson, null, 2)).then(() => {
                // Right now, this is only used for testing so we want to quit when we're done.
                log.info(`Finished importing from ${importedPath} to ${finalPath}`)
                // If we have a forced path then this was invoked by
                // an automated script.
                if (typeof destinationFile === 'string') {
                  app.quit()
                  return Promise.resolve()
                } else {
                  const fileURL = helpers.file.filePathToFileURL(finalPath)
                  return addToKnownFiles(fileURL).then(() => {
                    return openFile(fileURL)
                      .then(() => {
                        log.info('Opened file from imported scrivener data', storyName)
                        sender.send('finish-creating-local-scrivener-imported-file')
                        return true
                      })
                      .catch((error) => {
                        sender.send('error-importing-scrivener', error)
                        errorReportingLogger.error(
                          'Failed to open a known file after importing from scrivener',
                          error
                        )
                        return Promise.reject(error)
                      })
                  })
                }
              })
            }
          })
        } else {
          return saveToDefaultLocation(importedJson, storyName)
            .then((fileURL) => {
              return addToKnownFiles(fileURL).then(() => {
                return openFile(fileURL)
                  .then(() => {
                    log.info('Opened file from imported scrivener data', storyName)
                    sender.send('finish-creating-local-scrivener-imported-file')
                    return true
                  })
                  .catch((error) => {
                    sender.send('error-importing-scrivener', error)
                    errorReportingLogger.error(
                      'Failed to open a known file after importing from scrivener',
                      error
                    )
                    return Promise.reject(error)
                  })
              })
            })
            .catch((error) => {
              errorReportingLogger.error('Failed to save imported scrivener file', error)
              sender.send('error-importing-scrivener', error)
            })
        }
      }
    )
  }

  function openFile(fileURL, unknown) {
    if (helpers.file.isDeviceFileURL(fileURL)) {
      // update lastOpen, but wait a little so the file doesn't move from under their mouse
      setTimeout(() => {
        if (isOfflineFile(fileURL)) {
          log.info('Opening offline file', fileURL)
          return
        }
        whenClientIsReady(({ updateLastOpenedDate }) => {
          return updateLastOpenedDate(fileURL)
        })
          .then(() => {
            broadcastToAllWindows('reload-recents')
          })
          .catch((error) => {
            errorReportingLogger.error(
              `Failed to update a known files last opened date: ${fileURL}`,
              error
            )
          })
      }, 500)
    }
    return openProjectWindow(fileURL)
      .then(() => {
        log.info('Opened known file for', fileURL)
        if (unknown) addToKnown(fileURL)
      })
      .catch((error) => {
        errorReportingLogger.error(
          `Failed to open a project window for know file ${fileURL}`,
          error
        )
        return Promise.reject(error)
      })
  }

  return {
    saveFile,
    editKnownFilePath,
    createNew,
    createFromSnowflake,
    createFromScrivener,
    openFile,
    deleteKnownFile,
    removeFromKnownFiles,
  }
}

const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production'
const errorReporterAccessToken = process.env.ROLLBAR_ACCESS_TOKEN
const errorReporter = createErrorReporter(
  errorReporterAccessToken,
  app.getVersion(),
  environment,
  log,
  'MainProcess',
  process.platform,
  'not-knowable-from-main',
  'not-knowable-from-main'
)
const errorReportingLogger = {
  info: log.info,
  warn: log.warn,
  error: (...args) => {
    log.error(...args)
    errorReporter.error(...args)
  },
}

const {
  saveFile,
  editKnownFilePath,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openFile,
  deleteKnownFile,
  removeFromKnownFiles,
} = makeFileModule(errorReportingLogger)

export {
  saveFile,
  editKnownFilePath,
  createNew,
  createFromSnowflake,
  createFromScrivener,
  openFile,
  deleteKnownFile,
  removeFromKnownFiles,
}
