import electron, { shell, Notification } from 'electron'
import currentSettings, { saveAppSetting } from './modules/settings'
import { setupI18n } from 'plottr_locales'
import https from 'https'
import fs from 'fs'
const { app, ipcMain } = electron
import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import './modules/updater_events'
import { loadMenu } from './modules/menus'
import { getWindowById, numberOfWindows } from './modules/windows'
import { setDarkMode } from './modules/theme'
import { addToKnownFiles } from './modules/known_files'
import {
  broadcastSetBeatHierarchy,
  broadcastUnsetBeatHierarchy,
  featureFlags,
} from './modules/feature_flags'
import { reloadAllWindows } from './modules/windows'
import { openLoginPopupWindow } from './modules/windows/login'
import { broadcastToAllWindows } from './modules/broadcast'
import {
  openKnownFile,
  createNew,
  createFromSnowflake,
  TEMP_FILES_PATH,
  removeFromTempFiles,
  removeFromKnownFiles,
  deleteKnownFile,
  editKnownFilePath,
  createFromScrivener,
} from './modules/files'
import { lastOpenedFile, setLastOpenedFilePath } from './modules/lastOpened'
import {
  editWindowPath,
  setFilePathForWindowWithFilePath,
  setFilePathForWindowWithId,
} from './modules/windows/index'

export const listenOnIPCMain = (getSocketWorkerPort, processSwitches) => {
  ipcMain.on('pls-fetch-state', function (event, id, proMode) {
    lastOpenedFile()
      .catch((error) => {
        return null
      })
      .then((lastFile) => {
        return currentSettings().then((settings) => {
          // If the user asked for dashboard first, then never reply
          // with the last known file.
          return (settings?.user?.openDashboardFirst && null) || lastFile
        })
      })
      .then((lastFile) => {
        const win = getWindowById(id)
        const filePath = win.filePath || lastFile
        if (win) {
          featureFlags().then((flags) => {
            event.sender.send(
              'state-fetched',
              filePath,
              flags,
              numberOfWindows(),
              win.filePath,
              processSwitches.serialise()
            )
          })
        }
      })
  })

  ipcMain.on('pls-tell-me-the-socket-worker-port', (event) => {
    event.returnValue = getSocketWorkerPort()
  })

  ipcMain.on('pls-set-dark-setting', (event, newValue) => {
    setDarkMode(newValue)
      .then(() => {
        return currentSettings().then((settings) => {
          broadcastToAllWindows('reload-dark-mode', settings.user.dark)
        })
      })
      .catch((error) => {
        log.error('Failed to set dark mode setting from main listener', error)
      })
  })

  ipcMain.on('pls-update-beat-hierarchy-flag', (_event, newValue) => {
    if (newValue) {
      broadcastSetBeatHierarchy()
    } else {
      broadcastUnsetBeatHierarchy()
    }
  })

  ipcMain.on('pls-update-language', (_event, newLanguage) => {
    saveAppSetting('locale', newLanguage)
      .then(() => {
        currentSettings().then((settings) => {
          setupI18n(settings, { electron })
          return loadMenu().then(() => {
            reloadAllWindows()
          })
        })
      })
      .catch((error) => {
        log.error('Error updating language', error)
      })
  })

  ipcMain.on('pls-tell-dashboard-to-reload-recents', () => {
    broadcastToAllWindows('reload-recents')
  })

  ipcMain.on('add-to-known-files-and-open', (_event, file) => {
    if (!file || file === '') return
    addToKnownFiles(file).then((id) => {
      log.info('Adding to known files and opening', file)
      openKnownFile(file, id, false)
        .then(() => {
          log.info('Opened file', file)
        })
        .catch((error) => {
          log.error('Error opening file and adding to known', file, error)
        })
    })
  })

  ipcMain.on('create-new-file', (event, template, name) => {
    createNew(template, name).catch((error) => {
      event.sender.send('error', {
        message: error.message,
        source: 'create-new-file',
      })
    })
  })

  ipcMain.on('create-from-snowflake', (event, importedPath, isLoggedIntoPro) => {
    createFromSnowflake(importedPath, event.sender, isLoggedIntoPro).catch((error) => {
      event.sender.send('error', {
        message: error.message,
        source: 'create-new-file',
      })
    })
  })

  ipcMain.on('create-from-scrivener', (event, importedPath, isLoggedIntoPro, destinationFile) => {
    createFromScrivener(importedPath, event.sender, isLoggedIntoPro, destinationFile).catch(
      (error) => {
        event.sender.send('error', {
          message: error.message,
          source: 'create-new-file',
        })
      }
    )
  })

  ipcMain.on('open-known-file', (_event, filePath, id, unknown, headerBarFileName) => {
    log.info('Opening known file', filePath, id, unknown, headerBarFileName)
    openKnownFile(filePath, id, unknown, headerBarFileName)
      .then(() => {
        log.info('Opened file', filePath)
      })
      .catch((error) => {
        log.error('Error opening known file', filePath, error)
      })
  })

  ipcMain.on('remove-from-temp-files-if-temp', (_event, filePath) => {
    if (filePath.includes(TEMP_FILES_PATH)) {
      removeFromTempFiles(filePath, false)
    }
  })

  ipcMain.on('broadcast-reload-options', () => {
    broadcastToAllWindows('reload-options')
  })

  ipcMain.on('remove-from-known-files', (_event, fileId) => {
    removeFromKnownFiles(fileId)
    broadcastToAllWindows('reload-recents')
  })

  ipcMain.on('delete-known-file', (_event, id, filePath) => {
    deleteKnownFile(id, filePath)
    broadcastToAllWindows('reload-recents')
  })

  ipcMain.on('edit-known-file-path', (_event, oldFilePath, newFilePath) => {
    editKnownFilePath(oldFilePath, newFilePath)
    editWindowPath(oldFilePath, newFilePath)
    broadcastToAllWindows('reload-recents')
  })

  ipcMain.on('set-my-file-path', (_event, oldFilePath, newFilePath) => {
    setFilePathForWindowWithFilePath(oldFilePath, newFilePath)
  })

  ipcMain.on('pls-quit', () => {
    app.quit()
  })

  ipcMain.on('tell-me-what-os-i-am-on', (event) => {
    event.returnValue = is.windows ? 'WINDOWS' : is.macos ? 'MACOS' : is.linux ? 'LINUX' : null
  })

  ipcMain.on('download-file-and-show', (_event, url) => {
    const downloadDirectory = app.getPath('downloads')
    const fullPath = path.join(downloadDirectory, 'backup-download.pltr')
    const outputStream = fs.createWriteStream(fullPath)
    log.info(`Downloading ${url} to ${downloadDirectory}`)
    https
      .get(url, (response) => {
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
            }
          })
        })
      })
      .on('error', (error) => {
        log.error('Error downloading file from ${url}', error)
      })
  })

  ipcMain.on('show-item-in-folder', (_event, fileName) => {
    shell.showItemInFolder(fileName)
  })

  ipcMain.on('pls-set-my-file-path', (event, filePath) => {
    setFilePathForWindowWithId(event.sender.getOwnerBrowserWindow().id, filePath)
  })

  ipcMain.on('pls-open-login-popup', () => {
    openLoginPopupWindow()
  })

  ipcMain.on('notify', (event, title, body) => {
    try {
      const notification = new Notification({
        title,
        body,
        silent: true,
      })
      notification.show()
      setTimeout(() => {
        notification.close()
      }, 5000)
    } catch (error) {
      // ignore
      // on windows you need something called an Application User Model ID which may not work
    }
  })

  ipcMain.on('update-last-opened-file', (_event, newFilePath) => {
    setLastOpenedFilePath(newFilePath)
  })
}
