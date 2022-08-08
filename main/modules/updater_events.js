import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { broadcastToAllWindows } from './broadcast'
import currentSettings from './settings'

log.transports.file.level = 'info'
autoUpdater.logger = log
autoUpdater.allowPrerelease = false
autoUpdater.autoDownload = false

currentSettings()
  .then((settings) => {
    autoUpdater.allowPrerelease = settings.allowPrerelease
    autoUpdater.autoDownload = settings.user?.autoDownloadUpdate
  })
  .catch((error) => {
    log.error('Error setting initial update settings', error)
  })

////////////////////
// RECEIVE EVENTS //
////////////////////
ipcMain.on('pls-download-update', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('pls-quit-and-install', () => {
  autoUpdater.quitAndInstall(true, true)
})

ipcMain.on('pls-check-for-updates', () => {
  currentSettings()
    .then((settings) => {
      autoUpdater.allowPrerelease = settings.allowPrerelease
      autoUpdater.autoDownload = settings.user?.autoDownloadUpdate
      autoUpdater.checkForUpdates()
    })
    .catch((error) => {
      log.error('Error checking for updates', error)
    })
})

/////////////////
// SEND EVENTS //
/////////////////
autoUpdater.on('error', (error) => {
  broadcastToAllWindows('updater-error', error)
})

autoUpdater.on('update-available', (info) => {
  broadcastToAllWindows('updater-update-available', info)
})

autoUpdater.on('update-not-available', () => {
  broadcastToAllWindows('updater-update-not-available', null)
})

autoUpdater.on('download-progress', (progress) => {
  broadcastToAllWindows('updater-download-progress', progress)
})

autoUpdater.on('update-downloaded', (info) => {
  broadcastToAllWindows('updater-update-downloaded', info)
})
