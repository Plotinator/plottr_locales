import path from 'path'
import { t } from 'plottr_locales'
import log from 'electron-log'
import { app, shell } from 'electron'
import { is } from 'electron-util'

import { helpers } from 'pltr'

import { getWindowById, numberOfWindows } from '../windows'
import { NODE_ENV } from '../constants'
import { buildRecents } from './recents'

const TEMP_FILES_PATH = path.join(app.getPath('userData'), 'tmp')
let showInMessage = t('Show in File Explorer')
if (is.macos) {
  showInMessage = t('Show in Finder')
}

function buildFileMenu(
  fileURL,
  getTrialInfo,
  projectModule,
  featureFlagsModule,
  settingsModule,
  knownFilesModule
) {
  const isTemp = fileURL && fileURL.includes(TEMP_FILES_PATH)
  return Promise.all([
    getTrialInfo(),
    buildRecents(projectModule, knownFilesModule),
    settingsModule.currentSettings(),
  ]).then(([trialInfo, recents, settings]) => {
    const isPro = settings.user.choseProMode
    let submenu = [
      {
        label: t('Create Blank Project'),
        accelerator: 'CmdOrCtrl+N',
        click: function (event, focusedWindow) {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            focusedWindow && focusedWindow.webContents.send('new-project')
          }
        },
      },
      {
        label: t('Create From Template'),
        click: function (event, focusedWindow) {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            focusedWindow.webContents.send('from-template')
          }
        },
      },
      {
        label: t('Open Existing File'),
        accelerator: 'CmdOrCtrl+O',
        click: function (event, focusedWindow) {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            focusedWindow.webContents.send('open-existing')
          }
        },
      },
      {
        label: t('Recent Projects'),
        visible: !isPro && recents.length > 0,
        submenu: recents,
      },
      {
        type: 'separator',
      },
      {
        label: t('Save'),
        accelerator: 'CmdOrCtrl+S',
        visible: !!fileURL,
        click: function (event, focusedWindow) {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            if (isTemp) {
              focusedWindow.webContents.send('move-from-temp')
            } else {
              focusedWindow.webContents.send('save')
            }
          }
        },
      },
      {
        label: t('Save as') + '...',
        accelerator: 'CmdOrCtrl+Shift+S',
        visible: !!fileURL,
        click: function (event, focusedWindow) {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            if (isPro) {
              focusedWindow.webContents.send('save-as--pro', fileURL)
            } else {
              focusedWindow.webContents.send('save-as', fileURL)
            }
          }
        },
      },
      {
        label: t('Duplicate File') + '...',
        accelerator: 'CmdOrCtrl+Shift+S',
        visible: !!fileURL,
        click: function (event, focusedWindow) {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            if (isPro) {
              focusedWindow.webContents.send('save-as--pro', fileURL)
            } else {
              focusedWindow.webContents.send('save-as', fileURL)
            }
          }
        },
      },
      {
        label: showInMessage,
        visible: !isPro && !isTemp,
        click: function () {
          shell.showItemInFolder(helpers.file.withoutProtocol(fileURL))
        },
      },
      {
        label: t('Create Desktop Shortcut'),
        visible: !!fileURL && !isTemp && !isPro,
        click: function (event, focusedWindow) {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            focusedWindow.webContents.send('create-file-shortcut', fileURL, 'desktop')
          }
        },
      },
      {
        label: t('Close'),
        accelerator: 'CmdOrCtrl+W',
        visible: !!fileURL,
        click: function (event, focusedWindow) {
          log.info('sending wants-to-close')
          focusedWindow.close()
        },
      },
      {
        type: 'separator',
      },
      {
        label: t('Open Image Gallery'),
        visible: !!fileURL,
        click: (event, focusedWindow) => {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            focusedWindow.webContents.send('image-picker-file-from-menu')
          }
        },
      },
      {
        label: t('Export'),
        visible: !!fileURL,
        enabled: trialInfo && !trialInfo.expired && trialInfo.startsAt,
        submenu: [
          {
            label: t('MS Word'),
            click: (event, focusedWindow) => {
              const options = { type: 'word' }
              if (typeof focusedWindow?.webContents?.send === 'function') {
                focusedWindow.webContents.send('export-file-from-menu', options)
              }
            },
          },
          {
            label: t('Scrivener'),
            click: (event, focusedWindow) => {
              const options = { type: 'scrivener' }
              if (typeof focusedWindow?.webContents?.send === 'function') {
                focusedWindow.webContents.send('export-file-from-menu', options)
              }
            },
          },
          {
            label: t('Advanced...'),
            click: (event, focusedWindow) => {
              if (typeof focusedWindow?.webContents?.send === 'function') {
                focusedWindow.webContents.send('advanced-export-file-from-menu')
              }
            },
          },
        ],
      },
      {
        label: t('Reload from File'),
        visible: NODE_ENV === 'development' && !!fileURL,
        click: (event, focusedWindow) => {
          if (typeof focusedWindow?.webContents?.send === 'function') {
            const winObj = getWindowById(focusedWindow.id)
            if (winObj) {
              featureFlagsModule.featureFlags().then((flags) => {
                focusedWindow.webContents.send(
                  'reload-from-file',
                  winObj.fileURL,
                  flags,
                  numberOfWindows()
                )
              })
            }
          }
        },
      },
    ]
    return {
      label: t('File'),
      submenu: submenu,
    }
  })
}

export { buildFileMenu }
