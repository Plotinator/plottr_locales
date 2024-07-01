import electron, { shell, Notification, dialog } from 'electron'
import { setupI18n } from 'plottr_locales'
import { identity } from 'lodash'
import https from 'https'
import fs from 'fs'
import { machineId } from 'node-machine-id'
import { parse } from 'dotenv'
import { v4 as uuid } from 'uuid'
import computerName from 'computer-name'
import { userInfo } from 'os'

import { helpers, selectors as pltrSelectors } from 'pltr'
import { askToExport } from 'plottr_import_export'
import { t } from 'plottr_locales'

import path from 'path'
import { is } from 'electron-util'
import './modules/updater_events'
import { loadMenu } from './modules/menus'
import { getWindowById, numberOfWindows } from './modules/windows'
import { reloadAllWindows } from './modules/windows'
import { openLoginPopupWindow } from './modules/windows/login'
import { broadcastToAllWindows } from './modules/broadcast'
import { editWindowPath, setFilePathForWindowWithId } from './modules/windows/index'
import replyWithError from './lib/replyWithError'

const selectors = pltrSelectors(identity)

const { readFile } = fs.promises

const { app, ipcMain } = electron

const ask = (replyToWindow, channel, ...args) => {
  const listenToken = `${channel}-${uuid()}`
  // Maybe add a timeout?
  return new Promise((resolve, reject) => {
    try {
      const listener = (event, ...args) => {
        ipcMain.removeListener(listenToken, listener)
        if (args[0] && args[0].error) {
          reject(new Error(args[0].error))
        } else if (args.length === 1) {
          resolve(args[0])
        } else {
          resolve(args)
        }
      }
      ipcMain.on(listenToken, listener)
      replyToWindow(channel, listenToken, ...args)
    } catch (error) {
      reject(error)
    }
  })
}

const makeDownloadStorageImage = (replyToWindow) => (url, fileId, userId) => {
  return ask(replyToWindow, 'download-storage-image', url, fileId, userId)
}

const makeMPQ = (replyToWindow) => {
  return {
    push: (...args) => {
      replyToWindow('mpq', ...args)
    },
  }
}

function saveDialog(window, filters, title, defaultPath) {
  return dialog.showSaveDialog(window, {
    filters,
    title,
    defaultPath,
    properties: ['createDirectory'],
  })
}

const makeSaveDialog = (getOwnerBrowserWindow) => {
  return (defaultPath) => {
    return saveDialog(getOwnerBrowserWindow(), null, 'Export as', defaultPath).then((result) => {
      return result.filePath
    })
  }
}

function showNotification(title, body) {
  const notification = new Notification({
    title,
    body,
    silent: true,
  })
  notification.show()
  setTimeout(() => {
    notification.close()
  }, 5000)
}

export function notifyUser(exportPath, type) {
  const messageForType = {
    word: t('Your Plottr file was exported to a .docx file'),
    scrivener: t('Your Plottr file was exported to a Scrivener project package'),
  }
  showNotification(t('File Exported'), messageForType[type])
  shell.showItemInFolder(exportPath)
}

class ReplyChannel {
  constructor(channel, event, log, ...args) {
    this.channel = channel
    this.event = event
    this.log = log
    this.args = args
  }

  reply = (...replyArgs) => {
    if (this.event.sender.isDestroyed()) {
      this.log.warn(
        `Window that dispatched ${this.channel} was since destroyed.  Would have replied with`,
        ...this.args
      )
    } else {
      this.event.sender.send(...replyArgs)
    }
  }

  getOwnerBrowserWindow = () => this.event.sender.getOwnerBrowserWindow()
}

// NOTE: restartServerRef contains a mutable reference to the function
// to call to restart the server.  That function gets updated by
// itself when it's called
export const listenOnIPCMain = (
  fileModule,
  lastOpenedModule,
  projectModule,
  settingsModule,
  featureFlagsModule,
  themeModule,
  knownFilesModule,
  localClient,
  getLocalServerPort,
  processSwitches,
  safelyExitModule,
  restartServerRef,
  log,
  getLocalServerSecret
) => {
  const listen = (name, cb) => {
    return ipcMain.on(name, (event, ...args) => {
      const replyChannel = new ReplyChannel(name, event, log, ...args)
      return cb(replyChannel, ...args)
    })
  }

  ipcMain.on('pls-open-window', (event, replyChannel, fileURL, unknown) => {
    log.info('Received command to open window for', fileURL)
    projectModule
      .openProjectWindow(fileURL)
      .then(() => {
        if (unknown) {
          return knownFilesModule.addToKnown(fileURL)
        } else {
          return true
        }
      })
      .then(() => {
        event.sender.send(replyChannel, fileURL)
      })
      .catch((error) => {
        log.error('Error opening a new window', error)
        replyWithError(replyChannel, error)
      })
  })

  listen('pls-fetch-state', ({ reply, getOwnerBrowserWindow }, replyChannel, _proMode) => {
    lastOpenedModule
      .lastOpenedFile()
      .catch((_error) => {
        return null
      })
      .then((lastFile) => {
        return settingsModule.currentSettings().then((settings) => {
          // If the user asked for dashboard first, then never reply
          // with the last known file.
          return (
            (settings?.user?.openDashboardFirst && null) ||
            (!settings?.user?.openDashboardFirst && lastFile)
          )
        })
      })
      .then((lastFile) => {
        const lastFileURL =
          (lastFile && !helpers.file.isProtocolString(lastFile)
            ? helpers.file.filePathToFileURL(lastFile)
            : lastFile) || null
        const win = getWindowById(getOwnerBrowserWindow()?.id)
        if (win) {
          const fileURL = win.fileURL || lastFileURL
          featureFlagsModule.featureFlags().then((flags) => {
            reply(
              replyChannel,
              fileURL,
              flags,
              numberOfWindows(),
              win.fileURL,
              processSwitches.serialise()
            )
          })
        }
      })
      .catch((error) => {
        log.error('Error fetching state', error)
        replyWithError(replyChannel, error)
      })
  })

  listen('pls-tell-me-the-local-server-port', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, {
        localServerPort: getLocalServerPort(),
        localServerSecret: getLocalServerSecret(),
      })
    } catch (error) {
      log.error('Error retrieving the current worker socket port', error)
      replyWithError(replyChannel, error)
    }
  })

  listen('pls-set-dark-setting', ({ reply }, replyChannel, newValue) => {
    themeModule
      .setDarkMode(newValue)
      .then(() => {
        return settingsModule.currentSettings().then((settings) => {
          return broadcastToAllWindows('reload-dark-mode', settings.user.dark)
        })
      })
      .then(() => {
        reply(replyChannel, newValue)
      })
      .catch((error) => {
        log.error('Failed to set dark mode setting from main listener', error)
        replyWithError(replyChannel, error)
      })
  })

  listen('pls-update-language', ({ reply }, replyChannel, newLanguage) => {
    settingsModule
      .saveAppSetting('locale', newLanguage)
      .then(() => {
        settingsModule.currentSettings().then((settings) => {
          setupI18n(settings, { locale: electron.app.getLocale() })
          return loadMenu(
            safelyExitModule,
            projectModule,
            featureFlagsModule,
            settingsModule,
            knownFilesModule,
            localClient
          ).then(() => {
            reloadAllWindows()
          })
        })
      })
      .then(() => {
        reply(replyChannel, newLanguage)
      })
      .catch((error) => {
        log.error('Error updating language', error)
        replyWithError(replyChannel, error)
      })
  })

  listen('pls-tell-dashboard-to-reload-recents', ({ reply }, replyChannel) => {
    try {
      broadcastToAllWindows('reload-recents')
      reply(replyChannel, 'done')
    } catch (error) {
      log.error('Error reloading recents', error)
      replyWithError(replyChannel, error)
    }
  })

  listen('add-to-known-files-and-open', ({ reply }, replyChannel, fileURL) => {
    if (!fileURL || fileURL === '') {
      return
    } else {
      knownFilesModule
        .addToKnownFiles(fileURL)
        .then(() => {
          log.info('Adding to known files and opening', fileURL)
          fileModule
            .openFile(fileURL, false)
            .then(() => {
              log.info('Opened file', fileURL)
            })
            .catch((error) => {
              log.error('Error opening file and adding to known', fileURL, error)
            })
        })
        .then(() => {
          reply(replyChannel, fileURL)
        })
        .catch((error) => {
          log.error(`Error adding ${fileURL} to known files and opening it`, error)
          reply(replyChannel, { error: error.mesasge })
        })
    }
  })

  listen('create-new-file', ({ reply }, replyChannel, template, name) => {
    fileModule
      .createNew(template, name)
      .then(() => {
        reply(replyChannel, name)
      })
      .catch((error) => {
        log.error('Error creating new file', error)
        reply('error', {
          message: error.message,
          source: 'create-new-file',
        })
        replyWithError(replyChannel, error)
      })
  })

  listen('create-from-snowflake', ({ reply }, replyChannel, importedPath, isLoggedIntoPro) => {
    fileModule
      .createFromSnowflake(importedPath, reply, isLoggedIntoPro)
      .then(() => {
        reply(replyChannel, importedPath)
      })
      .catch((error) => {
        log.error(`Error creating from snowflake (${importedPath})`, error)
        reply('error', {
          message: error.message,
          source: 'create-new-file',
        })
        replyWithError(replyChannel, error)
      })
  })

  listen(
    'create-from-scrivener',
    ({ reply }, replyChannel, importedPath, isLoggedIntoPro, destinationFile) => {
      fileModule
        .createFromScrivener(importedPath, reply, isLoggedIntoPro, destinationFile)
        .then(() => {
          reply(replyChannel, importedPath)
        })
        .catch((error) => {
          log.error(`Error creating from scrivener (${importedPath}, ${destinationFile})`, error)
          reply('error', {
            message: error.message,
            source: 'create-new-file',
          })
          replyWithError(replyChannel, error)
        })
    }
  )

  listen(
    'create-from-word',
    ({ reply }, replyChannel, importedPath, isLoggedIntoPro, destinationFile) => {
      fileModule
        .createFromWord(importedPath, reply, isLoggedIntoPro, destinationFile)
        .then(() => {
          reply(replyChannel, importedPath)
        })
        .catch((error) => {
          log.error(`Error creating from scrivener (${importedPath}, ${destinationFile})`, error)
          reply('error', {
            message: error.message,
            source: 'create-new-file',
          })
          reply(replyChannel, { error: error.message })
        })
    }
  )

  listen('open-known-file', ({ reply }, replyChannel, fileURL, unknown) => {
    log.info('Opening known file', fileURL, unknown)
    fileModule
      .openFile(fileURL, unknown)
      .then(() => {
        log.info('Opened file', fileURL)
        reply(replyChannel, fileURL)
      })
      .catch((error) => {
        log.error('Error opening known file', fileURL, error)
        replyWithError(replyChannel, error)
      })
  })

  listen('remove-from-known-files', ({ reply }, replyChannel, fileURL) => {
    fileModule
      .removeFromKnownFiles(fileURL)
      .then(() => {
        reply(replyChannel, fileURL)
      })
      .catch((error) => {
        log.error(`Error removing file at ${fileURL} from known files`, error)
        replyWithError(replyChannel, error)
      })
    broadcastToAllWindows('reload-recents')
  })

  listen('delete-known-file', ({ reply }, replyChannel, fileURL) => {
    fileModule
      .deleteKnownFile(fileURL)
      .then(() => {
        broadcastToAllWindows('reload-recents')
        reply(replyChannel, fileURL)
      })
      .catch((error) => {
        log.error(`Failed to delete known file at: ${fileURL}`, error)
        replyWithError(replyChannel, error)
      })
  })

  listen('edit-known-file-path', ({ reply }, replyChannel, oldFileURL, newFileURL) => {
    fileModule
      .editKnownFilePath(oldFileURL, newFileURL)
      .then(() => {
        editWindowPath(oldFileURL, newFileURL)
        broadcastToAllWindows('reload-recents')
        reply(replyChannel, newFileURL)
      })
      .catch((error) => {
        log.error(`Failed to edit known file path of ${oldFileURL} to ${newFileURL}`, error)
        replyWithError(replyChannel, error)
      })
  })

  listen('pls-quit', ({ reply }, replyChannel) => {
    try {
      safelyExitModule.quitWhenDone()
      reply(replyChannel, 'will-exit-when-ready')
    } catch (error) {
      log.error('Error while attempting to quit Plottr', error)
      replyWithError(replyChannel, error)
    }
  })

  listen('tell-me-what-os-i-am-on', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, is.windows ? 'WINDOWS' : is.macos ? 'MACOS' : is.linux ? 'LINUX' : null)
    } catch (error) {
      log.error('Error while figuring out what OS we are running', error)
      replyWithError(replyChannel, error)
    }
  })

  listen('download-file-and-show', ({ reply }, replyChannel, url, fileName) => {
    const downloadDirectory = app.getPath('downloads')
    const fullPath = path.join(downloadDirectory, fileName || 'backup-download.pltr')
    const outputStream = fs.createWriteStream(fullPath)
    log.info(`Downloading ${url} to ${downloadDirectory}`)
    https
      .get(url, (response) => {
        // @ts-ignore
        if (Math.floor(response.statusCode / 200) !== 1) {
          log.error(`Error downloading file from ${url}`)
          return
        }
        response.on('data', (data) => {
          outputStream.write(data)
        })
        response.on('close', () => {
          outputStream.close((error) => {
            if (error) {
              log.error(`Error closing write stream for file download: of ${url}`, error)
            } else {
              shell.showItemInFolder(fullPath)
              reply(replyChannel, url)
            }
          })
        })
      })
      .on('error', (error) => {
        log.error(`Error downloading file from ${url}`, error)
        replyWithError(replyChannel, error)
      })
  })

  listen('download-pro-backup-file-into-memory', ({ reply }, replyChannel, url, fileName) => {
    const downloadDirectory = app.getPath('temp')
    const fullPath = path.join(downloadDirectory, fileName || 'backup-download.pltr')
    const outputStream = fs.createWriteStream(fullPath)
    log.info(`Downloading ${url} to ${downloadDirectory}`)
    https
      .get(url, (response) => {
        // @ts-ignore
        if (Math.floor(response.statusCode / 200) !== 1) {
          log.error(`Error downloading file from ${url}`)
          return
        }
        response.on('data', (data) => {
          outputStream.write(data)
        })
        response.on('close', () => {
          outputStream.close((error) => {
            if (error) {
              log.error(`Error closing write stream for file download: of ${url}`, error)
            } else {
              readFile(fullPath).then((fileBytes) => {
                try {
                  const file = JSON.parse(fileBytes.toString('utf8'))
                  reply(replyChannel, JSON.stringify(file))
                } catch (error) {
                  log.error(`Error deserialising file from ${url}`, error)
                  replyWithError(replyChannel, error)
                }
              })
            }
          })
        })
      })
      .on('error', (error) => {
        log.error(`Error downloading file from ${url}`, error)
        replyWithError(replyChannel, error)
      })
  })

  listen('show-item-in-folder', ({ reply }, replyChannel, fileURL) => {
    try {
      shell.showItemInFolder(helpers.file.withoutProtocol(fileURL))
      reply(replyChannel, 'done')
    } catch (error) {
      log.error(`Failed to show file at ${fileURL}`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('pls-set-my-file-path', ({ reply, getOwnerBrowserWindow }, replyChannel, fileURL) => {
    try {
      const windowId = getOwnerBrowserWindow()?.id
      if (windowId) {
        setFilePathForWindowWithId(windowId, fileURL)
        reply(replyChannel, fileURL)
      } else {
        const error = new Error(`Failed to set my file path to: ${fileURL}`)
        log.error(error)
        replyWithError(replyChannel, error)
      }
    } catch (error) {
      log.error(`Failed to set my file path to: ${fileURL}`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('pls-open-login-popup', ({ reply }, replyChannel) => {
    try {
      openLoginPopupWindow()
      reply(replyChannel, 'done')
    } catch (error) {
      log.error('Error while trying to start the login popup', error)
      replyWithError(replyChannel, error)
    }
  })

  listen('notify', ({ reply }, replyChannel, title, body) => {
    try {
      showNotification(title, body)
      reply(replyChannel, title, body)
    } catch (error) {
      // ignore
      // on windows you need something called an Application User Model ID which may not work
      log.error(`Failed to notify ${title}, ${body}`, error)
      replyWithError(replyChannel, error)
    }
  })
  listen('update-last-opened-file', ({ reply }, replyChannel, newFileURL) => {
    lastOpenedModule
      .setLastOpenedFilePath(newFileURL)
      .then(() => {
        reply(replyChannel, newFileURL)
      })
      .catch((error) => {
        log.error(`Failed to update last opened file to: ${newFileURL}`, error)
        replyWithError(replyChannel, error)
      })
  })

  listen('log-info', (_event, ...args) => {
    log.info(...args)
  })

  listen('log-warn', (_event, ...args) => {
    log.warn(...args)
  })

  listen('log-error', (_event, ...args) => {
    log.localError(...args)
  })

  listen('please-tell-me-my-version', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, app.getVersion())
    } catch (error) {
      log.error(`Failed to get the app version`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('please-tell-me-what-platform-i-am-on', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, process.platform)
    } catch (error) {
      log.error(`Failed to determine what platform we're on`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('machine-id', ({ reply }, replyChannel) => {
    machineId()
      .then((id) => {
        reply(replyChannel, id)
      })
      .catch((error) => {
        log.error('Failed to determine the machine id', error)
        replyWithError(replyChannel, error)
      })
  })

  listen('get-locale', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, app.getLocale())
    } catch (error) {
      log.error('Failed to get machine locale', error)
      replyWithError(replyChannel, error)
    }
  })

  listen('get-env-object', ({ reply }, replyChannel) => {
    readFile(path.resolve(__dirname, '..', '.env'))
      .then((rawEnvFile) => {
        reply(replyChannel, parse(rawEnvFile))
      })
      .catch((error) => {
        log.error('Failed to get the env object', error)
        replyWithError(replyChannel, error)
      })
  })

  listen('show-error-box', ({ reply }, replyChannel, title, message) => {
    try {
      dialog.showErrorBox(title, message)
      reply(replyChannel, 'done')
    } catch (error) {
      log.error(`Error showing error box for ${title}, ${message}`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('set-window-title', ({ reply, getOwnerBrowserWindow }, replyChannel, newTitle) => {
    try {
      getOwnerBrowserWindow()?.setTitle?.(newTitle)
      reply(replyChannel, newTitle)
    } catch (error) {
      log.error(`Error trying to set my window title to ${newTitle}`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen(
    'set-represented-file-name',
    ({ reply, getOwnerBrowserWindow }, replyChannel, newFileName) => {
      try {
        getOwnerBrowserWindow()?.setRepresentedFilename?.(newFileName)
        reply(replyChannel, newFileName)
      } catch (error) {
        log.error(`Error setting the represented file name to ${newFileName}`, error)
        replyWithError(replyChannel, error)
      }
    }
  )

  listen(
    'show-save-dialog',
    ({ reply, getOwnerBrowserWindow }, replyChannel, filters, title, defaultPath) => {
      saveDialog(getOwnerBrowserWindow(), filters, title, defaultPath)
        .then((files) => {
          reply(replyChannel, files.filePath)
        })
        .catch((error) => {
          log.error(`Error showing save dialog for ${title}`, error)
          replyWithError(replyChannel, error)
        })
    }
  )

  listen(
    'show-message-box',
    ({ reply, getOwnerBrowserWindow }, replyChannel, title, message, type, detail) => {
      dialog
        .showMessageBox(getOwnerBrowserWindow(), {
          title,
          message,
          type,
          detail,
        })
        .then(() => {
          reply(replyChannel, 'done')
        })
        .catch((error) => {
          log.error(`Error showing message box for ${title}, ${message}`, error)
          replyWithError(replyChannel, error)
        })
    }
  )

  listen('set-file-url', ({ reply, getOwnerBrowserWindow }, replyChannel, fileURL) => {
    try {
      const windowId = getOwnerBrowserWindow()?.id
      if (windowId) {
        setFilePathForWindowWithId(windowId, fileURL)
        reply(replyChannel, fileURL)
      } else {
        const error = new Error(`Error setting my fileURL to ${fileURL}`)
        log.error(`Error setting my fileURL to ${fileURL}`, error)
        replyWithError(replyChannel, error)
      }
    } catch (error) {
      log.error(`Error setting my fileURL to ${fileURL}`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('user-data-path', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, app.getPath('userData'))
    } catch (error) {
      log.error(`Error getting the user data path`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('user-desktop-path', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, app.getPath('desktop'))
    } catch (error) {
      log.error(`Error getting the user desktop path`, error)
      replyWithError(replyChannel, error)
    }
  })

  listen('user-documents-path', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, app.getPath('documents'))
    } catch (error) {
      log.error('Error getting the user documents path', error)
      replyWithError(replyChannel, error)
    }
  })

  listen('user-logs-path', ({ reply }, replyChannel) => {
    try {
      reply(replyChannel, app.getPath('logs'))
    } catch (error) {
      log.error('Error getting the user logs path', error)
      replyWithError(replyChannel, error)
    }
  })

  listen(
    'show-open-dialog',
    ({ reply, getOwnerBrowserWindow }, replyChannel, title, filters, properties, defaultPath) => {
      dialog
        .showOpenDialog(getOwnerBrowserWindow(), {
          title,
          filters,
          properties,
          defaultPath,
        })
        .then((files) => {
          reply(replyChannel, files.filePaths)
        })
        .catch((error) => {
          log.error(`Error showing the open dialog for ${title}`, error)
          replyWithError(replyChannel, error)
        })
    }
  )

  listen('open-external', ({ reply }, replyChannel, url) => {
    // If there's no protocal, assume that 'https://' was meant.
    const urlToOpen = url.match(/^[a-zA-Z]+:\/\//) ? url : `https://${url}`
    shell
      .openExternal(urlToOpen)
      .then(() => {
        reply(replyChannel, 'done')
      })
      .catch((error) => {
        log.error(`Error opening external ${url}`, error)
        replyWithError(replyChannel, error)
      })
  })

  listen('open-path', ({ reply }, replyChannel, path) => {
    shell
      .openPath(path)
      .then(() => {
        reply(replyChannel, path)
      })
      .catch((error) => {
        log.error(`Error opening path: ${path}`, error)
        replyWithError(replyChannel, error)
      })
  })

  listen(
    'export',
    (
      { reply, getOwnerBrowserWindow },
      replyChannel,
      defaultPath,
      fullState,
      type,
      options,
      userId
    ) => {
      return askToExport(
        defaultPath,
        fullState,
        type,
        options,
        is.windows,
        notifyUser,
        log,
        makeSaveDialog(getOwnerBrowserWindow),
        makeMPQ(reply),
        localClient.rmRf,
        userId,
        makeDownloadStorageImage(reply),
        fs.promises.writeFile,
        localClient.join,
        localClient.stat,
        localClient.mkdir,
        localClient.basename,
        selectors,
        (error, _success) => {
          if (error) {
            replyWithError(replyChannel, error)
            return
          }
          reply(replyChannel, defaultPath)
        }
      )
    }
  )

  const restartingServerStateRef = {
    restarting: false,
    restartTask: null,
  }
  listen('restart-server', ({ reply }, replyChannel) => {
    log.warn('Restart request received', JSON.stringify(restartingServerStateRef))
    if (
      restartingServerStateRef.restarting &&
      // @ts-ignore
      typeof restartingServerStateRef?.restartTask?.then === 'function'
    ) {
      log.warn("A client requested that the server restart, but it's already doing so.")
      // @ts-ignore
      restartingServerStateRef.restartTask.then(() => {
        reply(replyChannel, 'done')
      })
      return
    }
    restartingServerStateRef.restarting = true
    log.warn('Restarting the local server after request by client to do so')
    restartingServerStateRef.restartTask = restartServerRef
      .restartServer()
      .then(() => {
        log.info('Restarted the local server as per client request')
        reply(replyChannel, 'done')
      })
      .catch((error) => {
        log.error('Error restarting the local server', error)
        replyWithError(replyChannel, error)
      })
      .finally(() => {
        restartingServerStateRef.restarting = false
        restartingServerStateRef.restartTask = null
      })
  })

  listen('are-we-restarting-socket-server', ({ reply }, replyChannel) => {
    log.info(
      "Main process queried whether it's restarting.  Restart state:",
      JSON.stringify(restartingServerStateRef)
    )
    reply(replyChannel, restartingServerStateRef.restarting)
  })

  listen(
    'create-desktop-shortcut',
    ({ reply }, replyChannel, sourceFileURL, destinationFolderPath) => {
      function createShortcut(counter = 0) {
        try {
          const shortcutDestination = helpers.file.withoutProtocol(destinationFolderPath)
          const sourceFilePath = helpers.file.withoutProtocol(sourceFileURL)
          const shortcutSuffix = ' - Shortcut'
          const shortCutExt = '.lnk'

          let newShortcutPath = path.join(
            shortcutDestination,
            shortcutSuffix +
              path.basename(sourceFilePath, path.extname(sourceFilePath)) +
              shortCutExt
          )
          newShortcutPath = path.join(
            shortcutDestination,
            path.basename(sourceFilePath, path.extname(sourceFilePath)) +
              shortcutSuffix +
              (counter ? ' ' + counter : '') +
              shortCutExt
          )
          const result = shell.writeShortcutLink(newShortcutPath, { target: sourceFilePath })
          if (result) {
            reply(replyChannel, true)
            shell.showItemInFolder(newShortcutPath)
          } else {
            const errorMessage = `Error creating a desktop shortcut to ${sourceFilePath} at ${destinationFolderPath}`
            log.error(errorMessage)
            reply(replyChannel, { error: errorMessage })
          }
        } catch (error) {
          log.error(
            `Error creating a desktop shortcut to ${sourceFileURL} at ${destinationFolderPath}`,
            error
          )
          replyWithError(replyChannel, error)
        }
      }
      createShortcut()
    }
  )

  listen('what-is-the-download-directory-path', ({ reply }, replyChannel) => {
    reply(replyChannel, app.getPath('downloads'))
  })

  listen('please-mark-my-window-as-unsaved', ({ getOwnerBrowserWindow }, replyChannel) => {
    try {
      const window = getOwnerBrowserWindow()
      if (window && !window.title?.endsWith('*')) {
        const windowTitle = window.title.endsWith('  ')
          ? window.title.substring(0, window.title.length - 2)
          : window.title
        window?.setTitle?.(`${windowTitle ?? ''}*`)
      }
    } catch (error) {
      log.error(`Error trying to indicate that the file is unsaved`)
      replyWithError(replyChannel, error)
    }
  })

  listen('please-mark-my-window-as-saved', ({ getOwnerBrowserWindow }, replyChannel) => {
    try {
      const window = getOwnerBrowserWindow()
      if (window && window.title?.endsWith('*')) {
        window?.setTitle?.(window.title.substring(0, window.title.length - 1) + '  ')
      }
    } catch (error) {
      log.error(`Error trying to indicate that the file is saved`)
      replyWithError(replyChannel, error)
    }
  })

  listen('please-may-i-have-the-machine-name', ({ reply }, replyChannel) => {
    reply(replyChannel, computerName())
  })

  listen('please-may-i-have-the-local-username', ({ reply }, replyChannel) => {
    reply(replyChannel, userInfo().username)
  })
}
