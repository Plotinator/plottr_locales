import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import { app, ipcMain, dialog } from 'electron'
import { v4 as uuidv4 } from 'uuid'

import { t } from 'plottr_locales'

import { importFromSnowflake, importFromScrivener, importFromWord } from 'plottr_import_export'

import { helpers, emptyFile, tree, SYSTEM_REDUCER_KEYS, specialCaseFixes } from 'pltr'
import { broadcastToAllWindows } from './broadcast'
import { OFFLINE_FILE_FILES_PATH, isOfflineFile } from './offlineFilePath'

const { writeFile } = fs.promises
const { addUITimelineOrHierarchiesStateIfMissing } = specialCaseFixes

export const makeFileModule = (
  settingsModule,
  knownFilesModule,
  projectModule,
  localClient,
  errorReportingLogger
) => {
  const saveFile = (fileURL, jsonData) => {
    return localClient.saveFile(fileURL, jsonData)
  }

  function removeFromKnownFiles(fileURL) {
    return localClient.removeFromKnownFiles(fileURL)
  }

  function deleteKnownFile(fileURL) {
    return localClient.deleteKnownFile(fileURL)
  }

  function editKnownFilePath(oldPath, newPath) {
    return localClient.editKnownFilePath(oldPath, newPath)
  }

  function saveToDefaultLocation(json, name) {
    return localClient.saveToDefaultLocation(json, name)
  }

  function newFileFromTemplate(template, name) {
    if (!name) {
      return addUITimelineOrHierarchiesStateIfMissing(template.templateData)
    }

    return addUITimelineOrHierarchiesStateIfMissing({
      ...template.templateData,
      series: {
        ...template.templateData.series,
        name,
      },
    })
  }

  async function createNew(template, name) {
    return settingsModule.currentSettings().then(async (settings) => {
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
        await knownFilesModule.addToKnownFiles(fileURL)
        await openFile(fileURL)
      } catch (error) {
        errorReportingLogger.error('Failed to create a new file', name, error)
        throw error
      }
    })
  }

  function createFromSnowflake(importedPath, replyToWindow, isLoggedIntoPro) {
    const storyName = path.basename(importedPath, '.snowXML')
    let json = emptyFile(storyName, app.getVersion())
    // clear beats and lines
    // @ts-ignore
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    return Promise.all([
      settingsModule.currentSettings(),
      importFromSnowflake(importedPath, true, json, localClient.readFile),
    ]).then(([settings, importedJson]) => {
      if (isLoggedIntoPro) {
        replyToWindow('create-plottr-cloud-file', importedJson, storyName)
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
              return knownFilesModule.addToKnownFiles(fileURL).then(() => {
                return openFile(fileURL)
                  .then(() => {
                    log.info('Opened file from imported snowflake data', storyName)
                    replyToWindow('finish-creating-local-scrivener-imported-file')
                    return true
                  })
                  .catch((error) => {
                    replyToWindow('error-importing-scrivener', error)
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
            return knownFilesModule.addToKnownFiles(fileURL).then(() => {
              return openFile(fileURL)
            })
          })
          .catch((error) => {
            errorReportingLogger.error('Failed to create file from snowflake', error)
            return Promise.reject(error)
          })
      }
    })
  }

  function createRTFConversionFunction(replyToWindow) {
    return function (rtfString) {
      return new Promise((resolve, reject) => {
        const conversionId = uuidv4()
        ipcMain.once(conversionId, (event, replyChannel, slate) => {
          event.sender.send(replyChannel, conversionId)
          resolve(slate)
        })
        replyToWindow('convert-rtf-string-to-slate', rtfString, conversionId)
      })
    }
  }

  function createFromScrivener(importedPath, replyToWindow, isLoggedIntoPro, destinationFile) {
    const storyName = path.basename(importedPath, '.scriv')
    let json = emptyFile(storyName, app.getVersion())
    const isScrivener = true
    // @ts-ignore
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    const importedJsonPromise = importFromScrivener(
      importedPath,
      true,
      json,
      createRTFConversionFunction(replyToWindow),
      localClient.readFile,
      localClient.readdir,
      localClient.stat,
      localClient.extname,
      localClient.basename,
      localClient.join
    )

    if (isLoggedIntoPro) {
      importedJsonPromise
        .then((importedJson) => {
          replyToWindow('create-plottr-cloud-file', importedJson, storyName, isScrivener)
        })
        .catch((error) => {
          return replyToWindow('error-importing-scrivener', error)
        })
      return Promise.resolve()
    }

    return Promise.all([settingsModule.currentSettings(), importedJsonPromise]).then(
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
                  return knownFilesModule.addToKnownFiles(fileURL).then(() => {
                    return openFile(fileURL)
                      .then(() => {
                        log.info('Opened file from imported scrivener data', storyName)
                        replyToWindow('finish-creating-local-scrivener-imported-file')
                        return true
                      })
                      .catch((error) => {
                        replyToWindow('error-importing-scrivener', error)
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
              return knownFilesModule.addToKnownFiles(fileURL).then(() => {
                return openFile(fileURL)
                  .then(() => {
                    log.info('Opened file from imported scrivener data', storyName)
                    replyToWindow('finish-creating-local-scrivener-imported-file')
                    return true
                  })
                  .catch((error) => {
                    replyToWindow('error-importing-scrivener', error)
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
              replyToWindow('error-importing-scrivener', error)
            })
        }
      }
    )
  }

  function createFromWord(importedPath, replyToWindow, isLoggedIntoPro, destinationFile) {
    const storyName = path.basename(importedPath, '.docx')
    const isScrivener = false
    const isWord = true
    let json = emptyFile(storyName, app.getVersion())
    // @ts-ignore
    json.beats = {
      series: tree.newTree('id'),
    }
    json.lines = []
    const importedJsonPromise = importFromWord(
      importedPath,
      localClient.convertDocxToHtml,
      storyName,
      app.getVersion()
    )

    if (isLoggedIntoPro) {
      importedJsonPromise
        .then((importedJson) => {
          replyToWindow('create-plottr-cloud-file', importedJson, storyName, isScrivener, isWord)
        })
        .catch((error) => {
          return replyToWindow('error-importing-word', error)
        })
      return Promise.resolve()
    }

    return Promise.all([settingsModule.currentSettings(), importedJsonPromise]).then(
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
                  return knownFilesModule.addToKnownFiles(fileURL).then(() => {
                    return openFile(fileURL)
                      .then(() => {
                        log.info('Opened file from imported word data', storyName)
                        replyToWindow('finish-creating-local-word-imported-file')
                        return true
                      })
                      .catch((error) => {
                        replyToWindow('error-importing-word', error)
                        log.error('Failed to open a known file after importing from word', error)
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
              return knownFilesModule.addToKnownFiles(fileURL).then(() => {
                return openFile(fileURL)
                  .then(() => {
                    log.info('Opened file from imported word data', storyName)
                    replyToWindow('finish-creating-local-word-imported-file')
                    return true
                  })
                  .catch((error) => {
                    replyToWindow('error-importing-word', error)
                    log.error('Failed to open a known file after importing from word', error)
                    return Promise.reject(error)
                  })
              })
            })
            .catch((error) => {
              log.error('Failed to save imported word file', error)
              replyToWindow('error-importing-word', error)
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
          return null
        } else {
          return localClient
            .updateLastOpenedDate(fileURL)
            .then(() => {
              broadcastToAllWindows('reload-recents')
            })
            .catch((error) => {
              errorReportingLogger.error(
                `Failed to update a known files last opened date: ${fileURL}`,
                error
              )
            })
        }
      }, 500)
    }
    return projectModule
      .openProjectWindow(fileURL)
      .then(() => {
        log.info('Opened known file for', fileURL)
        if (unknown) {
          knownFilesModule.addToKnown(fileURL)
        }
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
    createFromWord,
    openFile,
    deleteKnownFile,
    removeFromKnownFiles,
  }
}
