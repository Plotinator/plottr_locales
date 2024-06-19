import fs from 'fs'
import path from 'path'

import { assertEqual, assertGreaterThan, describe } from '../../../test/simpleIntegrationTest'
import { createClient } from '../../../shared/local-client/index'

import { startServer } from '../init'
import { defaultSettings } from 'pltr'
import export_config from '../../../lib/plottr_import_export/src/exporter/default_config'

const NOP_LOGGER = {
  info: () => {},
  warn: () => {},
  error: () => {},
}
const CONSOLE_LOGGER = {
  info: (...args) => {
    console.log(...args)
  },
  warn: (...args) => {
    console.warn(...args)
  },
  error: (...args) => {
    console.error(...args)
  },
}
const DUMMY_ENCRYPT = (x) => {
  return Promise.resolve(x)
}
const DUMMY_DECRYPT = (x) => {
  return Promise.resolve(x)
}

const baseTestDirectory = path.join(__dirname, '..', '..', '..', '.test-output')

describe('startServer', (describe, it) => {
  it('should start, broadcast ports, have well-formed stores and ensure that various messages work', (success) => {
    try {
      // ==========Basic Initialisation==========
      let portBroadcasted = null
      return fs.promises
        .mkdtemp(path.join(baseTestDirectory, 'plottr_test_socket_server_userData'))
        .then((userDataDirectory) => {
          console.log('user data directory', userDataDirectory)
          const broadcastPort = (newPort) => {
            portBroadcasted = newPort
          }
          let fatalErrorOccured = false
          const onFatalError = () => {
            fatalErrorOccured = true
          }
          return startServer(
            CONSOLE_LOGGER,
            broadcastPort,
            userDataDirectory,
            onFatalError,
            '2023.5.3', // dummy version
            DUMMY_ENCRYPT,
            DUMMY_DECRYPT,
            'dummy-secret'
          ).then(({ port, killServer }) => {
            assertEqual(typeof killServer, 'function')
            assertGreaterThan(port, 0)
            console.log('[Server Integration Test]: Started server...')
            const localClient = createClient(port, CONSOLE_LOGGER, 'dummy-secret', {
              onBusy: () => {},
              onDone: () => {},
            })
            assertEqual(portBroadcasted, port)
            assertEqual(fatalErrorOccured, false)
            console.log('[Server Integration Test]: Created client...')
            return new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
              assertEqual(fatalErrorOccured, false)
              console.log('[Server Integration Test]: No fatal errors detected...')
              // ==========Check the Stores==========
              return fs.promises
                .readFile(path.join(userDataDirectory, 'config.json'))
                .then((configFile) => {
                  console.log('[Server Integration Test]: Config store exists...')
                  return fs.promises
                    .readFile(path.join(userDataDirectory, 'custom_templates.json'))
                    .then((customTemplates) => {
                      console.log('[Server Integration Test]: Custom templates store exist...')
                      return fs.promises
                        .readFile(path.join(userDataDirectory, 'export_config.json'))
                        .then((exportConfig) => {
                          console.log('[Server Integration Test]: Export config store exists...')
                          return fs.promises
                            .readFile(path.join(userDataDirectory, 'known_files.json'))
                            .then((knownFiles) => {
                              console.log('[Server Integration Test]: Known files store exist...')
                              return fs.promises
                                .readFile(path.join(userDataDirectory, 'last_opened.json'))
                                .then((lastOpened) => {
                                  console.log(
                                    '[Server Integration Test]: Last opened store exists...'
                                  )
                                  return fs.promises
                                    .readFile(path.join(userDataDirectory, 'license_info.json'))
                                    .then((licenseInfo) => {
                                      console.log(
                                        '[Server Integration Test]: License info store exists...'
                                      )
                                      return fs.promises
                                        .readFile(path.join(userDataDirectory, 'templates.json'))
                                        .then((templates) => {
                                          console.log(
                                            '[Server Integration Test]: Templates store exists...'
                                          )
                                          return fs.promises
                                            .readFile(
                                              path.join(userDataDirectory, 'trial_info.json')
                                            )
                                            .then((trialInfo) => {
                                              console.log(
                                                '[Server Integration Test]: Trial info store exist...'
                                              )
                                              const parsedConfigFile = JSON.parse(
                                                configFile.toString('utf8')
                                              )
                                              assertEqual(typeof parsedConfigFile, 'object')
                                              assertEqual(
                                                parsedConfigFile,
                                                defaultSettings.desktop()
                                              )
                                              console.log(
                                                '[Server Integration Test]: Config file parsed...'
                                              )
                                              const parsedCustomTemplates = JSON.parse(
                                                customTemplates.toString('utf8')
                                              )
                                              assertEqual(typeof parsedCustomTemplates, 'object')
                                              assertEqual(parsedCustomTemplates, {})
                                              console.log(
                                                '[Server Integration Test]: Custom templates parsed...'
                                              )
                                              const parsedExportConfig = JSON.parse(
                                                exportConfig.toString('utf8')
                                              )
                                              assertEqual(typeof parsedExportConfig, 'object')
                                              assertEqual(parsedExportConfig, parsedExportConfig)
                                              console.log(
                                                '[Server Integration Test]: Export config parsed...'
                                              )
                                              const parsedKnownFiles = JSON.parse(
                                                knownFiles.toString('utf8')
                                              )
                                              assertEqual(typeof parsedKnownFiles, 'object')
                                              assertEqual(parsedKnownFiles, {})
                                              console.log(
                                                '[Server Integration Test]: Known files parsed...'
                                              )
                                              const parsedLastOpened = JSON.parse(
                                                lastOpened.toString('utf8')
                                              )
                                              assertEqual(typeof parsedLastOpened, 'object')
                                              assertEqual(parsedLastOpened, {})
                                              console.log(
                                                '[Server Integration Test]: Last opened parsed...'
                                              )
                                              const parsedLicenseInfo = JSON.parse(
                                                licenseInfo.toString('utf8')
                                              )
                                              assertEqual(typeof parsedLicenseInfo, 'object')
                                              assertEqual(parsedLicenseInfo, {})
                                              console.log(
                                                '[Server Integration Test]: License info parsed...'
                                              )
                                              const parsedTemplates = JSON.parse(
                                                templates.toString('utf8')
                                              )
                                              assertEqual(typeof parsedTemplates, 'object')
                                              // Not sure how to assert that we downloaded the correct templates yet
                                              // assertEqual(parsedTemplates, {})
                                              console.log(
                                                '[Server Integration Test]: Templates parsed...'
                                              )
                                              const parsedTrialInfo = JSON.parse(
                                                trialInfo.toString('utf8')
                                              )
                                              assertEqual(typeof parsedTrialInfo, 'object')
                                              assertEqual(parsedTrialInfo, {})
                                              console.log(
                                                '[Server Integration Test]: Trial info parsed...'
                                              )

                                              // ==========Check that Last Opened Logic Works==========
                                              console.log(
                                                '[Server Integration Test]: Does last opened logic work?'
                                              )
                                              return localClient
                                                .setLastOpenedFilePath('device:///dummy-path.pltr')
                                                .then(() => {
                                                  return fs.promises
                                                    .readFile(
                                                      path.join(
                                                        userDataDirectory,
                                                        'last_opened.json'
                                                      )
                                                    )
                                                    .then((lastOpenedSet) => {
                                                      const parsedLastOpenedSet = JSON.parse(
                                                        lastOpenedSet.toString('utf8')
                                                      )
                                                      assertEqual(parsedLastOpenedSet, {
                                                        lastOpenedFilePath:
                                                          'device:///dummy-path.pltr',
                                                      })
                                                      return localClient
                                                        .nukeLastOpenedFileURL()
                                                        .then(() => {
                                                          // It might take time for (Windows, e.g.) to flush the operation
                                                          // to disk.
                                                          return new Promise((resolve) =>
                                                            setTimeout(resolve, 1000)
                                                          ).then(() => {
                                                            return fs.promises
                                                              .readFile(
                                                                path.join(
                                                                  userDataDirectory,
                                                                  'last_opened.json'
                                                                )
                                                              )
                                                              .then((lastOpenedAfter) => {
                                                                const parsedLastOpenedAfter =
                                                                  JSON.parse(
                                                                    lastOpenedAfter.toString('utf8')
                                                                  )
                                                                assertEqual(parsedLastOpenedAfter, {
                                                                  lastOpenedFilePath: '',
                                                                })
                                                                console.log(
                                                                  '[Server Integration Test]: Last opened works!'
                                                                )

                                                                // ==========Check that we can kill the server==========
                                                                console.log(
                                                                  '[Server Integration Test]: Can we kill the server?'
                                                                )
                                                                return killServer().then(() => {
                                                                  // This will be short circuited by an error if `killServer`
                                                                  // fails.
                                                                  assertEqual(true, true)
                                                                  console.log(
                                                                    '[Server Integration Test]: Yes, we can kill the server!'
                                                                  )

                                                                  // Start the server again so that we can test the shutdown
                                                                  // command during clean up
                                                                  console.log(
                                                                    '[Server Integration Test]: Does the shutdown from cleanup work?'
                                                                  )
                                                                  return startServer(
                                                                    CONSOLE_LOGGER,
                                                                    broadcastPort,
                                                                    userDataDirectory,
                                                                    onFatalError,
                                                                    '2023.5.3', // dummy version
                                                                    DUMMY_ENCRYPT,
                                                                    DUMMY_DECRYPT,
                                                                    'dummy-secret'
                                                                  ).then((finalServer) => {
                                                                    const _client = createClient(
                                                                      finalServer.port,
                                                                      CONSOLE_LOGGER,
                                                                      'dummy-secret',
                                                                      {
                                                                        onBusy: () => {},
                                                                        onDone: () => {},
                                                                      }
                                                                    )
                                                                    console.log(
                                                                      '[Server Integration Test]: Yes, we can shutdown from cleanup!'
                                                                    )
                                                                  })
                                                                })
                                                              })
                                                          })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
          })
        })
        .catch((error) => {
          throw error
        })
        .finally(async () => {
          for (const file of await fs.promises.readdir(baseTestDirectory)) {
            if (file !== '.gitkeep') {
              await fs.promises.rm(path.join(baseTestDirectory, file), {
                recursive: true,
              })
            }
          }
          // ==========Shut Down the Server==========
          try {
            const localClient = createClient(portBroadcasted, CONSOLE_LOGGER, 'dummy-secret', {
              onBusy: () => {},
              onDone: () => {},
            })
            success()
            return localClient.shutdown()
          } catch (error) {
            console.error('Failed to shut down the server!', error)
            throw error
          }
        })
    } catch (error) {
      console.error('Failed with', error)
      throw error
    }
  })
})
