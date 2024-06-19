import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { dialog, app, screen, BrowserWindow, nativeTheme } from 'electron'
import windowStateKeeper from 'electron-window-state'
import { t } from 'plottr_locales'
import log from 'electron-log'

import { hasWindows } from './windows'
import { is } from 'electron-util'

function gracefullyNotSave() {
  // @ts-ignore
  dialog.showErrorBox(t('Saving failed'), t("Saving your file didn't work. Try again."))
}

function gracefullyQuit(safelyExit) {
  if (!app.isReady() || !hasWindows()) {
    dialog.showMessageBoxSync({
      type: 'info',
      buttons: [t('ok')],
      message: t('Plottr ran into a problem. Try opening Plottr again.'),
      detail: t('If you keep seeing this problem, email us at support@plottr.com'),
    })
    safelyExit.quitWhenDone()
  }
}

function makeBrowserWindow(settingsModule, fileURL) {
  // Load the previous state with fallback to defaults
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  // replacing makes it so it doesn't create the folder structure
  let stateKeeprFile = (fileURL || uuidv4()).replace(/[/\\]/g, '~')
  const numFileLetters = 100

  let multiplier = 0.9

  let stateKeeper = windowStateKeeper({
    defaultWidth: width * multiplier,
    defaultHeight: height * multiplier,
    path: path.join(app.getPath('userData'), 'stateKeeper'),
    file: stateKeeprFile.slice(-numFileLetters),
  })

  return settingsModule
    .currentSettings()
    .then((settings) => {
      const backgroundColor =
        (settings.user?.dark === 'system' && nativeTheme.shouldUseDarkColors) ||
        settings.user?.dark === 'dark'
          ? '#2a2b32'
          : '#f7f7f7'
      let config = {
        x: stateKeeper.x,
        y: stateKeeper.y,
        width: stateKeeper.width,
        height: stateKeeper.height,
        fullscreen: stateKeeper.isFullScreen || null,
        show: false,
        fullscreenable: true,
        backgroundColor,
        webPreferences: {
          nodeIntegration: false,
          spellcheck:
            settings.user?.useSpellcheck === undefined ? true : settings.user?.useSpellcheck,
          webviewTag: true,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.bundle.js'),
        },
      }

      // Create the browser window
      // @ts-ignore
      let newWindow = new BrowserWindow(config)
      newWindow.setBackgroundColor(backgroundColor)

      // register listeners on the window
      stateKeeper.manage(newWindow)

      newWindow.once('ready-to-show', () => {
        newWindow.show()
      })

      if (typeof newWindow?.webContents?.on === 'function') {
        newWindow.webContents.on('did-finish-load', () => {
          if (!newWindow.isVisible()) newWindow.show()
        })

        newWindow.webContents.on('unresponsive', () => {
          log.warn('webContents became unresponsive')
          newWindow.webContents.reload()
        })

        newWindow.webContents.on('responsive', () => {
          log.info('webContents responsive again')
        })

        newWindow.on('unresponsive', () => {
          log.warn('window became unresponsive')
          newWindow.webContents.reload()
        })

        newWindow.on('responsive', () => {
          log.info('window responsive again')
        })

        newWindow.webContents.on(
          // @ts-ignore
          'new-window',
          (event, url, frameName, disposition, options, additionalFeatures) => {
            event.preventDefault()
          }
        )
      }

      if (is.development || settings.forceDevTools) {
        // @ts-ignore
        newWindow.openDevTools()
      }

      return newWindow
    })
    .catch((error) => {
      log.error('Error creating a new window', error)
      return Promise.reject(error)
    })
}

export { gracefullyNotSave, gracefullyQuit, makeBrowserWindow }
