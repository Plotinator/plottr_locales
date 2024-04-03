import electron, { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import semverGt from 'semver/functions/gt'
import semverLte from 'semver/functions/lte'
import { isDate } from 'lodash'

import { broadcastToAllWindows } from './broadcast'
import currentSettings from './settings'
import replyWithError from '../lib/replyWithError'
import { whenClientIsReady } from '../../shared/socket-client/index'

const { app } = electron

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
ipcMain.on('pls-download-update', (event, replyChannel) => {
  autoUpdater
    .downloadUpdate()
    .then(() => {
      event.sender.send(replyChannel, 'heard')
    })
    .catch((error) => {
      log.error('Failed to start downloading update', error)
      replyWithError(replyChannel, error)
    })
})

ipcMain.on('pls-quit-and-install', (event, replyChannel) => {
  try {
    // Reply first so that the renderer can deregister its listener.
    event.sender.send(replyChannel, 'done')
    autoUpdater.quitAndInstall(true, true)
  } catch (error) {
    log.error('Failed to quit and install an update', error)
    replyWithError(replyChannel, error)
  }
})

ipcMain.on('pls-check-for-updates', (event, replyChannel) => {
  currentSettings()
    .then((settings) => {
      autoUpdater.allowPrerelease = settings.allowPrerelease
      autoUpdater.autoDownload = settings.user?.autoDownloadUpdate
      autoUpdater.checkForUpdates()
      event.sender.send(replyChannel, 'done')
    })
    .catch((error) => {
      log.error('Error checking for updates', error)
      replyWithError(replyChannel, error)
    })
})

/////////////////
// SEND EVENTS //
/////////////////
autoUpdater.on('error', (error) => {
  broadcastToAllWindows('updater-error', error)
})

const isoStringToDateOrNull = (isoDateString) => {
  if (typeof isoDateString === 'string') {
    const date = new Date(isoDateString)
    if (isNaN(date)) {
      return null
    } else {
      return date
    }
  } else {
    return null
  }
}

const latestExpiry = (plottrLicenseExpiryISOString, proLicenseExpiryISOString) => {
  const plottrLicenseExpiry = isoStringToDateOrNull(plottrLicenseExpiryISOString)
  const proLicenseExpiry = isoStringToDateOrNull(proLicenseExpiryISOString)
  if (proLicenseExpiry && plottrLicenseExpiry) {
    if (proLicenseExpiry > plottrLicenseExpiry) {
      return proLicenseExpiry
    } else {
      return plottrLicenseExpiry
    }
  } else if (proLicenseExpiry) {
    return proLicenseExpiry
  } else {
    return plottrLicenseExpiry
  }
}

const THIRTY_DAYS_IN_MILISECONDS = 30 * 24 * 60 * 60 * 1000

const oneOfTheGivenLicensesHasStarted = (plottrLicense, proLicense) => {
  const date = new Date()
  const latestDateCouldBeChecked = new Date(date.getTime() + THIRTY_DAYS_IN_MILISECONDS)
  const plottrDateChecked = isoStringToDateOrNull(plottrLicense.dateChecked)
  const hasActivePlottrLicense = plottrDateChecked && plottrDateChecked < latestDateCouldBeChecked
  const proDateChecked = isoStringToDateOrNull(proLicense.dateChecked)
  const hasActiveProLicense = proDateChecked && proDateChecked < latestDateCouldBeChecked
  return hasActivePlottrLicense || hasActiveProLicense
}

autoUpdater.on('update-available', (info) => {
  if (typeof info?.version === 'string') {
    const currentVersion = app.getVersion()
    whenClientIsReady(({ currentPlottrLicense, currentProLicense }) => {
      return Promise.all([currentPlottrLicense(), currentProLicense()]).then(
        ([plottrLicense, proLicense]) => {
          const plottrExpiry = plottrLicense.expiresAt
          const proExpiry = proLicense.expiresAt
          const latestExpiryDate = latestExpiry(plottrExpiry, proExpiry)
          const hasALicenseThatHasStarted = oneOfTheGivenLicensesHasStarted(
            plottrLicense,
            proLicense
          )
          if (hasALicenseThatHasStarted) {
            if (semverGt(info.version, currentVersion)) {
              if (semverLte(currentVersion, latestExpiryDate)) {
                log.info('License expires after update.  Informing windows that we can update.')
                broadcastToAllWindows('updater-update-available', info)
              } else {
                log.warn(
                  'License expires before update.  Staying on current version (by not informing that update is available.)'
                )
              }
            } else {
              log.warn(
                "Somehow we're on a newer version than is available on our servers.  Not updating"
              )
            }
          } else {
            log.warn('No active license.  Not going ahead with update check.')
          }
        }
      )
    })
  }
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
