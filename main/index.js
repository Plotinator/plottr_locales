import electron from 'electron'
import SETTINGS from './modules/settings'
import { setupI18n } from 'plottr_locales'
import { initialize } from '@electron/remote/main'
import Store from 'electron-store'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

Store.initRenderer()

initialize()
setupI18n(SETTINGS, { electron })

const { app, BrowserWindow, globalShortcut } = electron
import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import './modules/updater_events'
import contextMenu from 'electron-context-menu'
import { setupRollbar } from './modules/rollbar'
import { loadMenu } from './modules/menus'
import { focusFirstWindow, hasWindows } from './modules/windows'
import { openProjectWindow } from './modules/windows/projects'
import { gracefullyQuit } from './modules/utils'
import { addToKnown } from './modules/known_files'
import { TEMP_FILES_PATH } from './modules/files'
import { startServer } from './server'
import { listenOnIPCMain } from './listeners'
import { createClient, isInitialised, setPort, getPort } from '../shared/socket-client'
import ProcessSwitches from './modules/processSwitches'

const { ipcMain } = electron

////////////////////////////////
////       Arguments      //////
////////////////////////////////
/**
 * You can launch Plottr with command line arguments.  Using these
 * arguments, you can:
 *
 *  - Open a particular file: On Windows and Linux, the first
 *    user-supplied argument is the file to launch.  (MacOS uses a
 *    different means to open a file).
 *  - On any platform, you may supply the argument
 *    "--enable-test-utilities".  This will make various facilities to
 *    test and stress-test Plottr available at runtime for both the
 *    production and development builds.
 */

////////////////////////////////
////     Startup Tasks    //////
////////////////////////////////
log.info(`--------Init (${app.getVersion()})--------`)
const ENV_FILE_PATH = path.resolve('.env')
import { config } from 'dotenv'
import { broadcastToAllWindows } from './modules/broadcast'
import { setDarkMode } from './modules/theme'
config({ path: ENV_FILE_PATH })
const rollbar = setupRollbar('main', {})

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (defaultActions, params, browserWindow) => [],
})

if (!is.development) {
  process.on('uncaughtException', function (error) {
    log.error(error)
    rollbar.error(error, function (sendErr, data) {
      gracefullyQuit()
    })
  })
  // ensure only 1 instance is running
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  }
}

app.userAgentFallback =
  'Firefox Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) plottr/2021.7.29 Chrome/85.0.4183.121 Electron/10.4.7 Safari/537.36'

// On MacOS, opening a file from finder is signalled to the app as an
// event (rather than by args).  So we want to make sure that when the
// app boots, it only opens a window corresponding to that event.
let openedFile = false

const broadcastPortChange = (port) => {
  if (!isInitialised()) {
    createClient(
      port,
      log,
      (error) => {
        log.error(`Failed to connect to socket server on port: <${port}>.  Killing the app.`, error)
        app.quit()
      },
      {
        onSaveBackupError: (filePath, errorMessage) => {
          log.error(`Failed to save a backup at ${filePath} because ${errorMessage}`)
        },
        onSaveBackupSuccess: (filePath) => {
          log.info(`Succeeeded to save a backup at ${filePath} this time`)
        },
        onAutoSaveError: (filePath, errorMessage) => {
          log.error(`Failed to auto save a file at ${filePath} because ${errorMessage}`)
        },
        onAutoSaveWorkedThisTime: () => {
          log.info('Auto save worked this time')
        },
        onAutoSaveBackupError: (backupFilePath, backupErrorMessage) => {
          log.error(
            `Couldn't save a backup at ${backupFilePath} during auto-save because ${backupErrorMessage}`
          )
        },
      }
    )
  }
  setPort(port)
  broadcastToAllWindows('update-worker-port', port)
}

app.whenReady().then(() => {
  startServer(log, broadcastPortChange, app.getPath('userData'))
    .then((port) => {
      log.info(`Socket worker started on ${port}`)
      return port
    })
    .catch((error) => {
      log.error('FATAL ERROR: Failed to start the socket server.  Killing the app.', error)
      app.quit()
    })
    .then((port) => {
      loadMenu()
      const yargv = parseArguments(process.argv)
      log.info('yargv', yargv)
      const processSwitches = ProcessSwitches(yargv)
      const fileLaunchedOn = fileToLoad(process.argv)

      listenOnIPCMain(() => getPort(), processSwitches)

      const importFromScrivener = processSwitches.importFromScrivener()
      if (importFromScrivener) {
        const { sourceFile, destinationFile } = importFromScrivener
        log.info(`Importing ${sourceFile} to ${destinationFile}`)
        const newWindow = openProjectWindow(null)
        if (!newWindow) {
          throw new Error('Could not create window to export with.')
        }
        newWindow.on('ready-to-show', () => {
          ipcMain.once('listeners-registered', () => {
            newWindow.webContents.send('import-scrivener-file', sourceFile, destinationFile)
          })
        })
      } else {
        // Wait a little bit in case the app was launched by double clicking
        // on a file.
        setTimeout(() => {
          if (!openedFile && !(fileLaunchedOn && is.macos)) {
            openedFile = true
            log.info(`Opening <${fileLaunchedOn}> from primary whenReady`)
            openProjectWindow(fileLaunchedOn)
          }
        }, 1000)
      }

      // Register the toggleDevTools shortcut listener.
      globalShortcut.register('CommandOrControl+Alt+R', () => {
        let win = BrowserWindow.getFocusedWindow()
        if (win) win.toggleDevTools()
      })

      setDarkMode(SETTINGS.store.user.dark)

      if (process.env.NODE_ENV != 'dev') {
        app.setAsDefaultProtocolClient('plottr')
      }

      app.on('activate', async () => {
        if (hasWindows()) {
          focusFirstWindow()
        } else {
          openProjectWindow(fileLaunchedOn)
        }
      })

      app.on('second-instance', (_event, argv) => {
        log.info('second-instance')
        loadMenu()
        const newFileToLoad = fileToLoad(argv)
        openProjectWindow(newFileToLoad)
      })

      app.on('window-all-closed', () => {
        if (is.windows) app.quit()
      })

      app.on('will-quit', () => {
        app.releaseSingleInstanceLock()
      })
    })
})

function parseArguments(processArgv) {
  return yargs(hideBin(processArgv)).argv
}

function fileToLoad(argv) {
  if (is.windows && process.env.NODE_ENV != 'dev') {
    log.info('windows open-file event handler')
    log.info('args', argv.length, argv)
    const param = argv[argv.length - 1]

    if (param.includes('.pltr')) {
      log.info(`Opening file with path ${param}`)
      return param
    } else {
      log.error(`Could not open file with path ${param}`)
    }
  }
  log.info(`Opening Plottr without booting a file and arguments: ${argv}`)
  return null
}

app.on('open-file', (event, filePath) => {
  // Prevent the app from opening a default window as well as the file.
  openedFile = true
  log.info(`Opening <${filePath}> from open file`)
  event.preventDefault()
  // mac/linux open-file event handler
  app.whenReady().then(() => {
    openProjectWindow(filePath)
    addToKnown(filePath)
  })
})

app.on('open-url', function (event, url) {
  event.preventDefault()
  // mac custom protocol link handler
  // make sure to check that the app is ready
  log.info('open-url event: ' + url)
  // const link = param.replace('plottr://')
})
