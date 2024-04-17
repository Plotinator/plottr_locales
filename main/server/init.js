import { fork } from 'child_process'
import { join } from 'path'

const START_PORT = 8000
const MAX_ATTEMPTS = 10

// Use when we don't want to clog up the log files.
const logQuietly = (...args) => {
  console.log(...args)
}

export const startServer = (
  log,
  broadcastPortChange,
  userDataPath,
  onFatalError,
  appVersion,
  encryptStringToBase64,
  decryptStringFromBase64
) => {
  let attempts = 0

  function attemptAStart(resolve, reject) {
    if (attempts >= MAX_ATTEMPTS) {
      log.error(`Failed to bind socket server after ${MAX_ATTEMPTS} attempts.`)
      reject(new Error(`Failed to bind socket server after ${MAX_ATTEMPTS} attempts.`))
      onFatalError(`Failed to bind socket server after ${MAX_ATTEMPTS} attempts.`)
      return
    }

    const randomPort = START_PORT + Math.floor(1000 * Math.random())
    log.info(`Starting socket server on port: ${randomPort}`)

    const isBetaOrAlphaArgument = appVersion.match(/\d{4}\.\d\d?.\d\d?-(alpha|beta)\.\d+/)
      ? 'isBetaOrAlpha'
      : ''
    const serverScriptPath =
      process.env.NODE_ENV === 'test'
        ? join(__dirname, '..', '..', 'bin', 'socketServer.bundle.js')
        : join(__dirname, 'socketServer.bundle.js')
    const server = fork(serverScriptPath, [randomPort, userDataPath, isBetaOrAlphaArgument])
    let weInstructedServerToDie = false
    server.on('close', (code) => {
      if (weInstructedServerToDie) {
        return
      }
      log.warn(`[${server.pid}] Socket server died with code: ${code}`)
      if (code === 1 || code === 7) {
        log.warn(`[${server.pid}] Restarting the server on a new port.`)
        attempts++
        attemptAStart(resolve, reject)
        return
      } else {
        log.error(`[${server.pid}] Failed with an unhandled error.  Killing the server.`)
        reject(new Error(`[${server.pid}] Socket worker died with unhandled error code: ${code}`))
        onFatalError(`[${server.pid}] Socket worker died with unhandled error code: ${code}`)
        return
      }
    })
    server.on('message', (message) => {
      if (message?.startsWith?.('encrypt:')) {
        try {
          const { id, s } = JSON.parse(message.substring(message.indexOf(':') + 1))
          encryptStringToBase64(s)
            .then((encrypted) => {
              server.send(`encrypt:${JSON.stringify({ id, s: encrypted })}`)
            })
            .catch((error) => {
              log.error('Error encrypting', error)
              server.send(`encrypt-error:${JSON.stringify({ id })}`)
            })
        } catch (error) {
          log.error('Error parsing encryption request', error)
        }
      } else if (message?.startsWith?.('decrypt:')) {
        try {
          const { id, s } = JSON.parse(message.substring(message.indexOf(':') + 1))
          decryptStringFromBase64(s)
            .then((encrypted) => {
              server.send(`decrypt:${JSON.stringify({ id, s: encrypted })}`)
            })
            .catch((error) => {
              log.error('Error decrypting', error)
              server.send(`decrypt-error:${JSON.stringify({ id })}`)
            })
        } catch (error) {
          log.error('Error parsing decryption request', error)
        }
      } else if (message === 'ready') {
        log.info(`[${server.pid}] Received "${message}" from socket worker.`)
        log.info(`[${server.pid}] Started socket server!`)
        const killServer = () => {
          weInstructedServerToDie = true
          if (server.kill()) {
            return Promise.resolve()
          } else {
            log.warn(
              `[${server.pid}] Failed to kill the socket server.  Treating it as though it's dead already.`
            )
            return Promise.resolve()
          }
        }
        resolve({ port: randomPort, killServer })
        broadcastPortChange(randomPort)
      } else if (message === 'shutdown') {
        log.info(`[${server.pid}] Received "${message}" from socket worker.`)
        log.info(`[${server.pid}] SHUTTING DOWN SOCKET SERVER!`)
        weInstructedServerToDie = true
        server.kill()
      } else if (message === 'heartbeat') {
        logQuietly(`[${server.pid}] Received heartbeat from socket worker.`)
        server.send('ack')
      } else {
        log.info(message)
      }
    })
    server.on('error', (error) => {
      log.error(`A socket server identified as ${server.pid}.  Reported an error.`, error)
    })
  }

  return new Promise((resolve, reject) => {
    attemptAStart(resolve, reject)
  })
}
