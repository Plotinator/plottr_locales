import electron, { dialog } from 'electron'
import { setupI18n } from 'plottr_locales'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { v4 as uuid } from 'uuid'

import path from 'path'
import log from 'electron-log'
import { is } from 'electron-util'
import contextMenu from 'electron-context-menu'

import { helpers } from 'pltr'

import createErrorReporter from '../shared/error-reporter'
import { loadMenu } from './modules/menus'
import { focusFirstWindow, hasWindows } from './modules/windows'
import { gracefullyQuit } from './modules/utils'
import { startServer } from './server'
import { listenOnIPCMain } from './listeners'
import { createClient } from '../shared/local-client'
import ProcessSwitches from './modules/processSwitches'
import { encryptStringToBase64, decryptStringFromBase64 } from './modules/encrypt'
import makeSafelyExitModule from './modules/safelyExit'
import replyWithError from './lib/replyWithError'
import { currentSettings } from './lib/current_settings'
import { currentLicense } from './lib/current_license'
import { makeKnownFilesModule } from './modules/known_files'
import { makeFileModule } from './modules/files'
import { makeLastOpenedModule } from './modules/lastOpened'
import { makeProjectModule } from './modules/windows/projects'
import { makeSettingsModule } from './modules/settings'
import { makeFeatureFlagsModule } from './modules/feature_flags'
import { makeThemeModule } from './modules/theme'
import { initialiseUpdater } from './modules/updater_events'

const { app, BrowserWindow, globalShortcut, ipcMain } = electron

// There's a limit on the number of connections Electron will launch.
// We need to disable it for long polling to the local server.
app.commandLine.appendSwitch('ignore-connections-limit', '127.0.0.1')

log.transports.file.level = 'info'

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
const TEN_MEGABYTES = 10485760
log.transports.file.maxSize = TEN_MEGABYTES
log.info(`--------Init (${app.getVersion()})--------`)
const ENV_FILE_PATH = path.resolve('.env')
import { config } from 'dotenv'
import { broadcastToAllWindows } from './modules/broadcast'
config({ path: ENV_FILE_PATH })

const readUserId = () => {
  return currentSettings().then((settings) => {
    return settings?.user?.frbId ?? 'no-user-id'
  })
}

const readUserEmail = () => {
  return currentLicense().then((license) => {
    return license?.customer_email ?? 'no-email'
  })
}

const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production'
const errorReporterAccessToken = process.env.ROLLBAR_ACCESS_TOKEN
const errorReporter = () => {
  return Promise.all([readUserId(), readUserEmail()]).then(([userId, email]) => {
    return createErrorReporter(
      errorReporterAccessToken,
      app.getVersion(),
      environment,
      log,
      'MainProcess',
      process.platform,
      userId,
      email
    )
  })
}
const errorReportingLogger = {
  info: log.info,
  warn: log.warn,
  error: (...args) => {
    log.error(...args)
    errorReporter()
      .then((reporter) => {
        reporter.error(...args)
      })
      .catch((error) => {
        log.error('Error getting the error reporter', error)
      })
  },
  localError: log.error,
}

// https://github.com/sindresorhus/electron-context-menu
contextMenu({
  prepend: (_defaultActions, _params, _browserWindow) => [],
})

const safelyExitModule = makeSafelyExitModule(log)

process.on('uncaughtException', function (error) {
  console.error('Uncaught exception.', error)
  log.error('Uncaught exception.', error)
  errorReporter()
    .then((reporter) => {
      reporter.error('Uncaught exception', error)
    })
    .catch((error) => {
      log.error('Error getting the error reporter', error)
    })
  setTimeout(() => {
    gracefullyQuit(safelyExitModule)
  }, 3000)
})
process.on('unhandledRejection', function (error) {
  console.error('Unhandled rejection.', error)
  log.error('Unhandled rejection.', error)
  errorReporter()
    .then((reporter) => {
      reporter.error('Unhandled rejection', error)
    })
    .catch((error) => {
      log.error('Error getting the error reporter', error)
    })
})

if (!is.development) {
  // ensure only 1 instance is running
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    safelyExitModule.quitWhenDone()
  }
}

app.userAgentFallback =
  'Firefox Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) plottr/2021.7.29 Chrome/85.0.4183.121 Electron/10.4.7 Safari/537.36'

// On MacOS, opening a file from finder is signalled to the app as an
// event (rather than by args).  So we want to make sure that when the
// app boots, it only opens a window corresponding to that event.
let openedFile = false

const broadcastPortChange = (setPort) => (port) => {
  setPort(port)
  broadcastToAllWindows('update-local-port', port)
}

const loadMenuFailureHandler = (error) => {
  errorReportingLogger.error('Failed to load menu.', error)
  return Promise.reject(error)
}

app.whenReady().then(async () => {
  const secret = uuid()
  const client = createClient(null, errorReportingLogger, secret, {
    onBusy: () => {
      safelyExitModule.busy()
    },
    onDone: () => {
      safelyExitModule.done()
    },
  })
  const startLocalServer = () => {
    return startServer(
      errorReportingLogger,
      broadcastPortChange((port) => client.setPort(port)),
      app.getPath('userData'),
      (error) => {
        errorReportingLogger.error(
          'FATAL ERROR: Failed to start the server.  Killing the app.',
          error
        )
        dialog.showErrorBox(
          'Error',
          "Plottr ran into a problem and can't start.  Please contact support."
        )
        setTimeout(() => {
          app.quit()
        }, 5000)
      },
      app.getVersion(),
      encryptStringToBase64,
      decryptStringFromBase64,
      secret
    )
      .then(({ port, killServer }) => {
        log.info(`Local server started on ${port}`)
        return { port, killServer }
      })
      .catch((error) => {
        errorReportingLogger.error(
          'FATAL ERROR: Failed to start the server.  Killing the app.',
          error
        )
        dialog.showErrorBox(
          'Error',
          "Plottr ran into a problem and can't start.  Please contact support."
        )
        setTimeout(() => {
          app.quit()
        }, 5000)
      })
  }

  const settingsModule = makeSettingsModule(client)
  const knownFilesModule = makeKnownFilesModule(client)
  const lastOpenedModule = makeLastOpenedModule(client)
  const featureFlagsModule = makeFeatureFlagsModule(client, errorReportingLogger)
  const projectModule = makeProjectModule(
    lastOpenedModule,
    featureFlagsModule,
    settingsModule,
    knownFilesModule,
    client,
    errorReportingLogger
  )
  const fileModule = makeFileModule(
    settingsModule,
    knownFilesModule,
    projectModule,
    client,
    errorReportingLogger
  )
  const themeModule = makeThemeModule(settingsModule, errorReportingLogger)

  startLocalServer()
    // @ts-ignore
    .then(({ port, killServer }) => {
      return loadMenu(
        safelyExitModule,
        projectModule,
        featureFlagsModule,
        settingsModule,
        knownFilesModule,
        client
      )
        .then(() => {
          return { port, killServer }
        })
        .catch(loadMenuFailureHandler)
    })
    .then(({ port, killServer }) => {
      client.setPort(port)
      initialiseUpdater(settingsModule, client)
      const yargv = parseArguments(process.argv)
      log.info('yargv', yargv)
      const processSwitches = ProcessSwitches(yargv)
      const fileLaunchedOn = fileToLoad(process.argv)
      const fileLaunchedOnURL = helpers.file.filePathToFileURL(fileLaunchedOn)
      const restartServerRef = {
        killServer: killServer,
        killingApp: false,
        restartServer: () => {
          if (restartServerRef.killingApp) {
            log.warn('Instructed to restart the server, but we are killing the app.')
            return Promise.resolve()
          } else {
            return restartServerRef
              .killServer()
              .then(() => {
                // @ts-ignore
                return startLocalServer().then(({ port, killServer }) => {
                  client.setPort(port)
                  restartServerRef.killServer = killServer
                })
              })
              .catch((error) => {
                errorReportingLogger.error(
                  'Failed to restart the local server.  Killing the app.',
                  error
                )
                dialog.showErrorBox(
                  'Error',
                  'Plottr ran into a problem and needs to shutdown.  Please contact support.'
                )
                setTimeout(() => {
                  app.quit()
                }, 5000)
              })
          }
        },
      }

      settingsModule.currentSettings().then((settings) => {
        setupI18n(settings, { locale: electron.app.getLocale() })
      })

      listenOnIPCMain(
        fileModule,
        lastOpenedModule,
        projectModule,
        settingsModule,
        featureFlagsModule,
        themeModule,
        knownFilesModule,
        client,
        () => client.getPort(),
        processSwitches,
        safelyExitModule,
        restartServerRef,
        errorReportingLogger,
        () => secret
      )

      // macOS only.  Open file from finder.
      app.on('open-file', (event, filePath) => {
        // Convert to a Plottr URL.
        const fileURL = helpers.file.filePathToFileURL(filePath)
        // Prevent the app from opening a default window as well as the file.
        openedFile = true
        log.info(`Opening <${fileURL}> from open file`)
        event.preventDefault()
        // mac/linux open-file event handler
        app.whenReady().then(() => {
          projectModule
            .openProjectWindow(fileURL)
            .then(() => {
              log.info('Project window opened for ', fileURL)
              knownFilesModule.addToKnown(fileURL)
            })
            .catch((error) => {
              errorReportingLogger.error(
                'Failed to open a project window the second instance',
                fileURL,
                error
              )
            })
        })
      })

      const importFromScrivener = processSwitches.importFromScrivener()
      if (importFromScrivener) {
        const { sourceFile, destinationFile } = importFromScrivener
        log.info(`Importing ${sourceFile} to ${destinationFile}`)
        projectModule
          .openProjectWindow(null)
          .then((newWindow) => {
            if (!newWindow) {
              throw new Error('Could not create window to export with.')
            }
            newWindow.on('ready-to-show', () => {
              ipcMain.once('listeners-registered', (event, replyChannel) => {
                try {
                  newWindow.webContents.send('import-scrivener-file', sourceFile, destinationFile)
                  event.sender.send(replyChannel, 'done')
                } catch (error) {
                  errorReportingLogger.error(
                    `Error exporting ${sourceFile} to scrivener file at ${destinationFile}`,
                    error
                  )
                  replyWithError(replyChannel, error)
                }
              })
            })
          })
          .catch((error) => {
            errorReportingLogger.error('Failed to create window to export with', error)
            return Promise.reject(error)
          })
      } else {
        // Wait a little bit in case the app was launched by double clicking
        // on a file.
        setTimeout(() => {
          if (!openedFile && !(fileLaunchedOnURL && is.macos)) {
            openedFile = true
            log.info(`Opening <${fileLaunchedOnURL}> from primary whenReady`)
            try {
              projectModule
                .openProjectWindow(fileLaunchedOnURL)
                .then((_newWindow) => {
                  log.info(`Created the project window for ${fileLaunchedOnURL}`)
                  if (fileLaunchedOnURL) {
                    knownFilesModule.addToKnown(fileLaunchedOnURL)
                  }
                })
                .catch((error) => {
                  errorReportingLogger.error(
                    `Error creating the project window to boot a file (${fileLaunchedOnURL}) from`,
                    error
                  )
                })
            } catch (error) {
              errorReportingLogger.error(`Error booting file: ${fileLaunchedOnURL}`, error)
            }
          }
        })

        // Register the toggleDevTools shortcut listener.
        globalShortcut.register('CommandOrControl+Alt+R', () => {
          try {
            let win = BrowserWindow.getFocusedWindow()
            // @ts-ignore
            if (win) win.toggleDevTools()
          } catch (error) {
            log.warn("Couldn't activate dev tools", error)
          }
        })

        // When given no argument, it'll look up the current one.
        themeModule.setDarkMode().catch((error) => {
          errorReportingLogger.error('Error setting initial theme', error)
        })

        if (process.env.NODE_ENV != 'dev') {
          app.setAsDefaultProtocolClient('plottr')
        }

        app.on('activate', async () => {
          if (hasWindows()) {
            focusFirstWindow()
          } else {
            log.info('Opening project window for', fileLaunchedOnURL)
            projectModule
              .openProjectWindow(fileLaunchedOnURL)
              .then(() => {
                log.info('Opened a project window for', fileLaunchedOnURL)
              })
              .catch((error) => {
                errorReportingLogger.error(
                  `Failed to open project window for ${fileLaunchedOnURL}`,
                  error
                )
              })
          }
        })

        app.on('second-instance', (_event, argv) => {
          log.info('second-instance')
          loadMenu(
            safelyExitModule,
            projectModule,
            featureFlagsModule,
            settingsModule,
            knownFilesModule,
            client
          )
            .then(() => {
              const newFileToLoad = fileToLoad(argv)
              const newFileToLoadURL = helpers.file.filePathToFileURL(newFileToLoad)
              if (newFileToLoadURL) {
                knownFilesModule.addToKnown(newFileToLoadURL)
              }
              projectModule
                .openProjectWindow(newFileToLoadURL)
                .then(() => {
                  log.info('Opened a second instance for a file', newFileToLoadURL)
                })
                .catch((error) => {
                  errorReportingLogger.error(
                    'Eror opening the second instance project window',
                    error
                  )
                })
            })
            .catch(loadMenuFailureHandler)
        })

        app.on('window-all-closed', () => {
          if (!is.macos) {
            safelyExitModule.quitWhenDone()
          }
        })

        app.on('will-quit', () => {
          app.releaseSingleInstanceLock()
        })
      }
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
      errorReportingLogger.error(`Could not open file with path ${param}`)
    }
  }
  log.info(`Opening Plottr without booting a file and arguments: ${argv}`)
  return null
}

app.on('open-url', function (event, url) {
  event.preventDefault()
  // mac custom protocol link handler
  // make sure to check that the app is ready
  log.info('open-url event: ' + url)
  // const link = param.replace('plottr://')
})
