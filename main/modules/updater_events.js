import electron, { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import semverGt from 'semver/functions/gt'
import semverLte from 'semver/functions/lte'

import { broadcastToAllWindows } from './broadcast'
import replyWithError from '../lib/replyWithError'

const { app } = electron

export const initialiseUpdater = (settingsModule, client) => {
  autoUpdater.logger = log
  autoUpdater.allowPrerelease = false
  autoUpdater.autoDownload = false

  settingsModule
    .currentSettings()
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
    settingsModule
      .currentSettings()
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
      // @ts-ignore
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
    if (proLicenseExpiry === null || plottrLicenseExpiry === null) {
      return null
    } else {
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

  const dateToVersion = (date) => {
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
  }

  autoUpdater.on('update-available', (info) => {
    if (typeof info?.version === 'string') {
      const currentVersion = app.getVersion()
      return Promise.all([client.currentPlottrLicense(), client.currentProLicense()]).then(
        ([plottrLicense, proLicense]) => {
          const plottrExpiry = plottrLicense.expiresAt
          const proExpiry = proLicense.expiresAt
          const latestExpiryValue = latestExpiry(plottrExpiry, proExpiry)
          // @ts-ignore
          const latestExpiryDate = dateToVersion(new Date(latestExpiryValue))
          const hasALicenseThatHasStarted = oneOfTheGivenLicensesHasStarted(
            plottrLicense,
            proLicense
          )
          if (hasALicenseThatHasStarted) {
            log.info(
              `Updater current version: ${currentVersion}.  Latest expiry: ${latestExpiryValue}`
            )
            if (semverGt(info.version, currentVersion)) {
              if (latestExpiryValue === null || semverLte(currentVersion, latestExpiryDate)) {
                log.info(`License expires after update.  Informing windows that we can update.`)
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
    } else {
      return Promise.reject(new Error('Invalid version supplied, refusing to update'))
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
}
