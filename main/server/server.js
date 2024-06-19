import fs from 'fs'
import { v4 as uuid } from 'uuid'
import express from 'express'

import routes from './routes'
import wireupTemplateFetcher from './template_fetcher'
import wireupFileModule from './files'
import wireupBackupModule from './backup'
import wireupFileSystemModule from './file-system'
import makeStores from './stores'
import makeSettingsModule from './settings'
import makeKnownFilesModule from './knownFiles'
import makeTrashModule from './trash'
import makeDefaultLocationModule from './defaultLocation'
import StatusManager from './StatusManager'

const send =
  typeof process.send === 'function' ? (arg) => process.send?.(arg) : (arg) => console.log(arg)

const parseArgs = () => {
  return {
    port: process.argv[2],
    userDataPath: process.argv[3],
    isBetaOrAlpha: process.argv[4] === 'isBetaOrAlpha',
    secret: process.argv[5],
  }
}

const { mkdir, lstat } = fs.promises

const startupTasks = (userDataPath, stores, logInfo) => {
  return wireupTemplateFetcher(userDataPath)(stores, logInfo).then((templateFetcher) => {
    return templateFetcher.fetch().catch((error) => {
      logInfo(
        `ERROR: couldn't fetch templates at startup.  Continueing anyway.  Error message: ${error.message}.\n${error.stack}`
      )
    })
  })
}

// Use when we don't want to clog up the log files.
const logQuietly = (...args) => {
  console.log(...args)
}

const ENCRYPT_TIMEOUT = 10000

const loggingMiddleware = (logger) => (req, res, next) => {
  const method = req.method
  const logArgs = req?.body?.data?.logArgs
  if (logArgs) {
    logger.info(`[${method}] ${req.originalUrl}`, JSON.stringify(logArgs))
  } else {
    logger.info(`[${method}] ${req.originalUrl}`)
  }

  next()
}

const authenticationMiddleware = (secret, logger) => (req, res, next) => {
  const suppliedSecret = req.headers['x-secret']
  if (suppliedSecret !== secret) {
    const method = req.method
    logger.error(`[${method}] ${req.originalUrl} Unauthorised`)
    res.status(401).json('Unauthorised')
  } else {
    next()
  }
}

const registerMiddleware = (app, secret, logger) => {
  app.use(authenticationMiddleware(secret, logger))
  app.use(express.json({ limit: '2gb' }))
  app.use(loggingMiddleware(logger))
  return Promise.resolve()
}

const setupListeners = (port, userDataPath, isBetaOrAlpha, secret) => {
  const app = express()
  const messagesAwaitingResponse = new Map()

  const encryptString = (s) => {
    const id = uuid()
    return new Promise((resolve, reject) => {
      messagesAwaitingResponse.set(id, { resolve, reject })
      send(`encrypt:${JSON.stringify({ id, s })}`)
      setTimeout(() => {
        if (messagesAwaitingResponse.has(id)) {
          console.error(new Error('Timed out waiting for encryption service'))
          messagesAwaitingResponse.delete(id)
        }
      }, ENCRYPT_TIMEOUT)
    })
  }

  const decryptString = (s) => {
    const id = uuid()
    return new Promise((resolve, reject) => {
      messagesAwaitingResponse.set(id, { resolve, reject })
      send(`decrypt:${JSON.stringify({ id, s })}`)
      setTimeout(() => {
        if (messagesAwaitingResponse.has(id)) {
          console.error(new Error('Timed out waiting for decryption service'))
          messagesAwaitingResponse.delete(id)
        }
      }, ENCRYPT_TIMEOUT)
    })
  }

  send(`Starting server on port: ${port}`)
  const argsToLogString = (args) => {
    return args
      .map((arg) => {
        try {
          return '' + arg
        } catch (_error) {
          return '<Unserialisable-Argument>'
        }
      })
      .join(', ')
      .slice(0, 1000)
  }
  const logInfo = (...args) => {
    const logString = argsToLogString(args)
    try {
      send(`LOG-INFO: ${logString}`)
    } catch (error) {
      console.error('Could not log to main process', error, logString)
    }
  }
  const logWarning = (...args) => {
    const logString = argsToLogString(args)
    try {
      send(`LOG-WARNING: ${logString}`)
    } catch (error) {
      console.error('Could not log to main process', error, logString)
    }
  }
  const logError = (...args) => {
    const logString = argsToLogString(args)
    try {
      send(`LOG-ERROR: ${logString}`)
    } catch (error) {
      console.error('Could not log to main process', error, logString)
    }
  }

  const basicLogger = {
    info: logInfo,
    warn: logWarning,
    error: logError,
  }

  const makeTemplateFetcher = wireupTemplateFetcher(userDataPath)
  const stores = makeStores(userDataPath, basicLogger, isBetaOrAlpha, encryptString, decryptString)
  const settings = makeSettingsModule(stores)

  const makeFileModule = wireupFileModule(userDataPath)
  const makeBackupModule = wireupBackupModule(userDataPath)
  const makeFileSystemModule = wireupFileSystemModule(userDataPath)

  const ensureUserDataFolderExists = () => {
    return lstat(userDataPath).catch((error) => {
      if (error.code === 'ENOENT') {
        return mkdir(userDataPath, { recursive: true }).then(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 1000)
          })
        })
      }
      return Promise.resolve()
    })
  }

  const testModules = () => {
    const backupModule = makeBackupModule(settings, basicLogger)
    makeFileSystemModule(stores, basicLogger)
    makeFileModule(backupModule, settings, basicLogger)
    return makeTemplateFetcher(stores, logInfo)
  }

  const statusManager = new StatusManager(basicLogger)

  let heartbeatInterval = null
  let awaitingResponse = null
  const HEARTBEAT_INTERVAL_MS = 60000
  const startHeartBeat = () => {
    heartbeatInterval = setInterval(() => {
      if (awaitingResponse) {
        // We didn't hear back from the server in a minute.  Assume
        // that we're headless and die.
        clearInterval(heartbeatInterval)
        process.exit(1)
        return
      }
      send('heartbeat')
      awaitingResponse = new Date()
    }, HEARTBEAT_INTERVAL_MS)
  }

  process.on('message', (rawMessage) => {
    // @ts-ignore
    const message = rawMessage.toString()
    if (message?.startsWith?.('encrypt:')) {
      try {
        const { id, s } = JSON.parse(message.substring(message.indexOf(':') + 1))
        const { resolve } = messagesAwaitingResponse.get(id)
        messagesAwaitingResponse.delete(id)
        resolve(s)
      } catch (error) {
        console.error('Error servicing encryption request', error)
      }
    } else if (message?.startsWith?.('decrypt:')) {
      try {
        const { id, s } = JSON.parse(message.substring(message.indexOf(':') + 1))
        const { resolve } = messagesAwaitingResponse.get(id)
        messagesAwaitingResponse.delete(id)
        resolve(s)
      } catch (error) {
        console.error('Error servicing decryption request', error)
      }
    } else if (message?.startsWith?.('encrypt-error:')) {
      try {
        const { id } = JSON.parse(message.substring(message.indexOf(':') + 1))
        const { reject } = messagesAwaitingResponse.get(id)
        messagesAwaitingResponse.delete(id)
        reject(new Error('encrypt-error'))
      } catch (error) {
        console.error('Error servicing encryption request', error)
      }
    } else if (message?.startsWith?.('decrypt-error:')) {
      try {
        const { id } = JSON.parse(message.substring(message.indexOf(':') + 1))
        const { reject } = messagesAwaitingResponse.get(id)
        messagesAwaitingResponse.delete(id)
        reject(new Error('decrypt-error'))
      } catch (error) {
        console.error('Error servicing decryption request', error)
      }
    } else if (message === 'ack') {
      const elapsed = awaitingResponse
        ? new Date().getTime() - awaitingResponse.getTime()
        : Infinity
      logQuietly(`Heart beat acknowledged in ${elapsed} (ms)`)
      awaitingResponse = null
    }
  })

  return ensureUserDataFolderExists()
    .then(testModules)
    .then(() => {
      const backupModule = makeBackupModule(settings, basicLogger)
      const fileModule = makeFileModule(backupModule, settings, basicLogger)
      const trashModule = makeTrashModule(userDataPath, basicLogger)
      const fileSystemModule = makeFileSystemModule(stores, basicLogger)
      const defaultLocationModule = makeDefaultLocationModule(settings, fileModule, basicLogger)
      const knownFilesModule = makeKnownFilesModule(
        stores,
        fileModule,
        trashModule,
        backupModule,
        basicLogger
      )
      return registerMiddleware(app, secret, basicLogger)
        .then(() => {
          return makeTemplateFetcher(stores, logInfo)
        })
        .then((templateFetcher) => {
          return routes(
            app,
            statusManager,
            secret,
            userDataPath,
            isBetaOrAlpha,
            basicLogger,
            encryptString,
            decryptString,
            stores,
            settings,
            backupModule,
            fileModule,
            fileSystemModule,
            trashModule,
            defaultLocationModule,
            knownFilesModule,
            templateFetcher
          )
        })
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        app.listen(port, (error) => {
          if (error) {
            basicLogger.error('Error starting local server', error)
            reject(error)
          } else {
            resolve(error)
          }
        })
      })
    })
    .then(() => {
      startupTasks(userDataPath, stores, logInfo).then(() => {
        send('ready')
      })
    })
    .then(() => {
      startHeartBeat()
    })
    .then(() => {
      app.on('error', (error) => {
        basicLogger.error('Error in local server', error)
      })
      return app
    })
}

const startServer = () => {
  const { port, secret, userDataPath, isBetaOrAlpha } = parseArgs()
  send(`args: ${process.argv.slice(0, 4)}`)
  setupListeners(port, userDataPath, isBetaOrAlpha, secret)
}

process.on('uncaughtException', (error, origin) => {
  send(
    `Uncaught exception killed local server.  Error: ${error.message}.  Origin: ${origin}.  Stacktrace: ${error.stack}`
  )
  throw error
})

startServer()
