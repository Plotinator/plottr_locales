import { Buffer } from 'buffer/'
import axios from 'axios'
import { isObject, isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

const LONG_POLL_TIMEOUT_MS = 240000
const BASE_BACKOFF_DURATION = 1000
// Roughly a minute...
const MAX_BACKOFF_DURATION = BASE_BACKOFF_DURATION * 2 * 2 * 2 * 2 * 2 * 2

function createAbortSignal(timeoutMS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMS)
  return { signal: controller.signal, timeoutId, abort: () => controller.abort() }
}

const INVALID_OR_UNSET_PORT = 'INVALID_OR_UNSET_PORT'

function routeFunctions(suppliedPort, secret, logger) {
  const createClient = (suppliedPort) => {
    const client = axios.create({
      baseURL: `http://127.0.0.1:${suppliedPort}`,
      headers: { 'X-Secret': secret },
    })
    return {
      get: getCheckingPort(client),
      post: postCheckingPort(client),
      put: putCheckingPort(client),
      delete: deleteCheckingPort(client),
    }
  }

  /**
   * @typedef {import('axios').Axios} Axios
   * @param {Axios} client
   */
  const getCheckingPort = (client) => {
    /**
     * A proxied get that first checks whether we have a valid port.
     *
     * @typedef {import('axios').AxiosResponse} AxiosResponse
     * @param {string} path
     * @param {any} queryParams
     * @returns {Promise<AxiosResponse>}
     */
    const get = (path, queryParams) => {
      if (typeof _clientRef.port !== 'number') {
        return Promise.reject(new Error(INVALID_OR_UNSET_PORT))
      } else {
        return client.get(path, queryParams)
      }
    }
    return get
  }

  /**
   * @param {Axios} client
   */
  const postCheckingPort = (client) => {
    /**
     * A proxied post that first checks whether we have a valid port.
     *
     * @typedef {import('axios').AxiosResponse} AxiosResponse
     * @typedef {import('axios').AxiosRequestConfig} AxiosRequestConfig
     * @param {string} path
     * @param {any} body
     * @param {AxiosRequestConfig} [config]
     * @returns {Promise<AxiosResponse>}
     */
    const post = (path, body, config = {}) => {
      if (typeof _clientRef.port !== 'number') {
        return Promise.reject(new Error(INVALID_OR_UNSET_PORT))
      } else {
        return client.post(path, body, config)
      }
    }
    return post
  }

  /**
   * @param {Axios} client
   */
  const putCheckingPort = (client) => {
    /**
     * A proxied put that first checks whether we have a valid port.
     *
     * @typedef {import('axios').AxiosResponse} AxiosResponse
     * @typedef {import('axios').AxiosRequestConfig} AxiosRequestConfig
     * @param {string} path
     * @param {any} body
     * @param {AxiosRequestConfig} [config]
     * @returns {Promise<AxiosResponse>}
     */
    const put = (path, body, config = {}) => {
      if (typeof _clientRef.port !== 'number') {
        return Promise.reject(new Error(INVALID_OR_UNSET_PORT))
      } else {
        return client.put(path, body, config)
      }
    }
    return put
  }

  /**
   * @param {Axios} client
   */
  const deleteCheckingPort = (client) => {
    /**
     * A proxied put that first checks whether we have a valid port.
     *
     * @typedef {import('axios').AxiosResponse} AxiosResponse
     * @param {string} path
     * @param {any} queryParams
     * @returns {Promise<AxiosResponse>}
     */
    const put = (path, queryParams) => {
      if (typeof _clientRef.port !== 'number') {
        return Promise.reject(new Error(INVALID_OR_UNSET_PORT))
      } else {
        return client.put(path, queryParams)
      }
    }
    return put
  }

  const _clientRef = { current: createClient(suppliedPort), port: suppliedPort, destroyed: false }
  const handleResponse = (requestPromise) => {
    return requestPromise
      .then((response) => {
        if (Math.floor(response.status / 100) === 2) {
          return Promise.resolve(response.data)
        } else {
          return Promise.reject(new Error(`${response.statusText} ${response.status}`))
        }
      })
      .catch((error) => {
        logger.error('Error communicating with local client', error)
        // Derived from Axios's config: https://axios-http.com/docs/handling_errors
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const responseError = new Error('server-error')
          // @ts-ignore
          responseError.code = error.response.status
          // @ts-ignore
          responseError.data = error.response.data
          return Promise.reject(responseError)
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          return Promise.reject(new Error('no-response'))
        } else {
          // Something happened in setting up the request that triggered an Error
          const responseError = new Error('client-side-error')
          // @ts-ignore
          responseError.data = error.message
          return Promise.reject(responseError)
        }
      })
  }
  const pollers = new Map()
  const client = {
    pollers,
    get: (path, queryParams) => {
      return handleResponse(
        _clientRef.current.get(
          path,
          isObject(queryParams) && !isEmpty(queryParams) ? { params: queryParams } : {}
        )
      )
    },
    post: (path, body, logArgs = {}) => {
      if (!isObject(body) || isEmpty(body)) {
        return Promise.reject(new Error('Cannot post a non-object'))
      } else {
        return handleResponse(
          _clientRef.current.post(
            path,
            {
              data: {
                ...body,
                logArgs,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        )
      }
    },
    put: (path, body, logArgs = {}) => {
      if (!isObject(body) || isEmpty(body)) {
        return Promise.reject(new Error('Cannot put a non-object'))
      } else {
        return handleResponse(
          _clientRef.current.put(
            path,
            {
              data: {
                ...body,
                logArgs,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
        )
      }
    },
    delete: (path, queryParams) => {
      return handleResponse(
        _clientRef.current.delete(path, {
          ...(isObject(queryParams) && !isEmpty(queryParams) ? { params: queryParams } : {}),
        })
      )
    },
    longPoll: (path, callback) => {
      /**
       * @type Subscription
       * @typedef Subscription
       * @property {String} pollId
       * @property {number | null} generation
       * @property {(function(): void) | null} abort
       * @property {number | null} timeoutId
       * @property {boolean} canceled
       * @property {number} backoffDuration
       * @property {function(): void} close
       */
      const subscription = {
        pollId: uuidv4(),
        generation: null,
        abort: null,
        timeoutId: null,
        canceled: false,
        backoffDuration: BASE_BACKOFF_DURATION,
        close: () => {},
      }
      function poll() {
        if (_clientRef.destroyed) {
          return
        } else if (subscription.canceled) {
          return
        } else {
          const { timeoutId, signal, abort } = createAbortSignal(LONG_POLL_TIMEOUT_MS)
          subscription.abort = abort
          // @ts-ignore
          subscription.timeoutId = timeoutId
          _clientRef.current
            .get(path, {
              params: { generation: subscription.generation },
              signal,
            })
            .then((response) => {
              if (Math.floor(response.status / 100) === 2) {
                clearTimeout(timeoutId)
                subscription.generation = response.data.generation
                subscription.backoffDuration = BASE_BACKOFF_DURATION
                callback(null, response.data.data)
                return Promise.resolve(response.data.data)
              } else {
                return Promise.reject(new Error(`${response.statusText} ${response.status}`))
              }
            })
            .catch((error) => {
              clearTimeout(timeoutId)
              if (error.code !== 'ERR_CANCELED') {
                callback(error, null)
              }
              return new Promise((resolve) => {
                setTimeout(() => {
                  if (subscription.backoffDuration < MAX_BACKOFF_DURATION) {
                    subscription.backoffDuration *= 2
                  }
                  resolve(null)
                }, subscription.backoffDuration)
              })
            })
            .finally(() => {
              poll()
            })
        }
      }
      pollers.set(subscription.pollId, subscription)
      poll()
      const close = () => {
        pollers.delete(subscription.pollId)
        subscription.canceled = true
        if (typeof subscription.abort === 'function') {
          subscription.abort()
        }
        if (subscription.timeoutId) {
          clearTimeout(subscription.timeoutId)
        }
      }
      subscription.close = close
      return close
    },
  }

  const ping = () => {
    return client.get('/system/ping')
  }

  const rmRf = (path) => {
    return client.delete('/fileSystem/file', { path })
  }

  const saveFile = (fileURL, file) => {
    return client.post('/file/plottr', { fileURL, file }, { fileURL, file: file.file })
  }

  const saveRawFile = (filePath, data) => {
    return client.post('/file/raw', { filePath, data }, { filePath })
  }

  const saveOfflineFile = (file, knownFiles, onlineFileURL, isOffline) => {
    return client.post(
      `/file/offline?isOffline=${isOffline}`,
      { file, knownFiles, onlineFileURL },
      { file: file.file, isOffline }
    )
  }

  const basename = (filePath, ext) => {
    return client.get('/file/basename', { filePath, ext })
  }

  const readFile = (filePath) => {
    return client.get('/file', { filePath })
  }

  const isInBackupFolder = (fileURL) => {
    return client.get('/backups/isInBackupFolder', { fileURL })
  }

  const saveBackup = (filePath, file) => {
    return client.post('/backups', { filePath, file }, { filePath, file: file.file })
  }

  const ensureBackupFullPath = () => {
    return client.get('/backups/today')
  }
  const ensureBackupTodayPath = ensureBackupFullPath

  const fileExists = (filePath) => {
    return client.get('/file/exists', { filePath })
  }

  const backupOfflineBackupForResume = (file) => {
    return client.post('/file/backupFileForResume', { file }, { file: file.file })
  }

  const readOfflineFiles = () => {
    return client.get('/file/offlineFiles')
  }

  const isTempFile = (file) => {
    return client.get('/file/isTemp', { file })
  }

  const setTemplate = (id, template) => {
    return client.put(`/fileSystem/templates/${id}`, { template }, { template })
  }

  const setCustomTemplate = (id, template) => {
    return client.put(`/fileSystem/customTemplates/${id}`, { template }, { template })
  }

  const deleteCustomTemplate = (id) => {
    return client.delete(`/fileSystem/customTemplates/${id}`)
  }

  const defaultBackupLocation = () => {
    return client.get('/backups/defaultBackupPath')
  }

  const offlineFileURL = (fileURL) => {
    return client.get('/file/offlineFileURL', { fileURL })
  }

  const offlineFileBasePath = () => {
    return client.get('/file/offlineFilesPath')
  }

  const attemptToFetchTemplates = () => {
    return client.get('/templates/hydrate')
  }

  const saveAsTempFile = (file) => {
    return client.post('/file/temp', { file }, { file: file.file })
  }

  const deleteKnownFile = (fileURL) => {
    return client.delete('/knownFiles/data', { fileURL })
  }

  const updateKnownFileName = (fileURL, newName) => {
    return client.post('/knownFiles/name', { fileURL, newName }, { fileURL, newName })
  }

  const saveToDefaultLocation = (json, name) => {
    return client.put(`/defaultLocation/${name}`, { json }, { file: json.file })
  }

  const removeFromKnownFiles = (fileURL) => {
    return client.delete('/knownFiles', { fileURL })
  }

  const addKnownFile = (fileURL) => {
    return client.put('/knownFiles', { fileURL }, { fileURL })
  }

  const editKnownFilePath = (oldFileURL, newFileURL) => {
    return client.post('/knownFiles/path', { oldFileURL, newFileURL }, { oldFileURL, newFileURL })
  }

  const updateLastOpenedDate = (fileURL) => {
    return client.post('/knownFiles/lastOpenedDate', { fileURL }, { fileURL })
  }

  const lastOpenedFile = () => {
    return client.get('/fileSystem/lastOpenedFilePath')
  }

  const setLastOpenedFilePath = (filePath) => {
    return client.put('/fileSystem/lastOpenedFilePath', { filePath }, { filePath })
  }

  const nukeLastOpenedFileURL = () => {
    return client.delete('/fileSystem/lastOpenedFilePath')
  }

  const shutdown = () => {
    return client.get('/system/shutdown')
  }

  const writeFile = (path, file) => {
    if (Buffer.isBuffer(file)) {
      const base64 = file.toString('base64')
      return client.post('/file', { path, base64 }, { path })
    } else {
      return client.post('/file', { path, file }, { path })
    }
  }

  const join = (...pathArgs) => {
    return client.get('/file/join', { pathArgs: Object.assign({}, pathArgs) })
  }

  const pathSep = () => {
    return client.get('/file/separator')
  }

  const trash = (fileURL) => {
    return client.put('/trash', { fileURL }, { fileURL })
  }

  const extname = (filePath) => {
    return client.get('/file/extname', { filePath })
  }

  const resolvePath = (...args) => {
    return client.get('/file/resolvedPath', { args: Object.assign({}, args) })
  }

  const readdir = (path) => {
    return client.get('/file/dir', { path })
  }

  const stat = (path) => {
    return client.get('/file/stat', { path }).catch((error) => {
      error.code = error.data.code
      return Promise.reject(error)
    })
  }

  const mkdir = (path) => {
    return client.post('/file/newDirectory', { path }, { path })
  }

  const findUniqueNameInPath = (path) => {
    return client.get('/file/uniqNameInDirectory', { path })
  }

  const filePathAsArray = (path) => {
    return client.get('/file/pathAsArray', { path })
  }

  const directoryIsWritable = (path) => {
    return client.get('/file/pathIsWritable', { path })
  }

  const convertDocxToHtml = (path) => {
    return client.get('/file/convertDocxToHTML', { path })
  }

  // ===File System APIs===

  const backupBasePath = () => {
    return client.get('/fileSystem/backupBasePath')
  }

  const currentTrial = () => {
    return client.get('/fileSystem/trial')
  }

  const startTrial = (numDays = null) => {
    return client.put('/fileSystem/trial', { numDays }, { numDays })
  }

  const extendTrialWithReset = (_days) => {
    return client.put('/fileSystem/extendedTrial')
  }

  const currentLicense = () => {
    return client.get('/fileSystem/license')
  }

  const deleteLicense = () => {
    return client.delete('/fileSystem/license')
  }

  const deletePlottrLicense = () => {
    return client.delete('/fileSystem/plottrLicense')
  }

  const deleteProLicense = () => {
    return client.delete('/fileSystem/proLicense')
  }

  const saveLicenseInfo = (newLicense) => {
    return client.put('/fileSystem/license', { newLicense }, { newLicense })
  }

  const currentKnownFiles = () => {
    return client.get('/fileSystem/knownFiles')
  }

  const currentTemplates = () => {
    return client.get('/fileSystem/templates')
  }

  const currentCustomTemplates = () => {
    return client.get('/fileSystem/customTemplates')
  }

  const currentTemplateManifest = () => {
    return client.get('/fileSystem/templateManifest')
  }

  const currentExportConfigSettings = () => {
    return client.get('/fileSystem/currentExportConfigSettings')
  }

  const saveExportConfigSettings = (key, value) => {
    return client.put(`/fileSystem/exportConfigSettings/${key}`, { value }, { value })
  }

  const currentAppSettings = () => {
    return client.get('/fileSystem/appSettings')
  }

  const saveAppSetting = (key, value) => {
    return client.put(`/fileSystem/appSetting/${key}`, { value }, { value })
  }

  const currentBackups = () => {
    return client.get('/fileSystem/backups')
  }

  const customTemplatesPath = () => {
    return client.get('/fileSystem/customTemplatePath')
  }

  const copyFile = (sourceFileURL, newFileURL) => {
    return client.put(
      '/fileSystem/fileCopy',
      { sourceFileURL, newFileURL },
      { sourceFileURL, newFileURL }
    )
  }

  const createFileShortcut = (sourceFileURL, newFileURL) => {
    return client.put(
      '/fileSystem/fileShortcut',
      { sourceFileURL, newFileURL },
      { sourceFileURL, newFileURL }
    )
  }

  /**
   * secret: String
   * A secret token to pass back to an
   * unauthenticated API on the server to verify whether the user
   * identified with a specific email address has an active license
   * without logging in.
   *
   * machineInfo: {
   *   id: String,
   *   name: String,
   *   os: String,
   *   localUsername: String,
   * }
   *
   * A payload of identifying features against which the secret was
   * generated.
   */
  const savePlottrLicense = (secret, machineInfo, expiresAt, dateChecked) => {
    return client.put('/fileSystem/plottrLicense', { secret, machineInfo, expiresAt, dateChecked })
  }

  /**
   * secret: String
   * A secret token to pass back to an
   * unauthenticated API on the server to verify whether the user
   * identified with a specific email address has an active license
   * without logging in.
   *
   * machineInfo: {
   *   id: String,
   *   name: String,
   *   os: String,
   *   localUsername: String,
   * }
   *
   * A payload of identifying features against which the secret was
   * generated.
   */
  const saveProLicense = (secret, machineInfo, expiresAt, dateChecked) => {
    return client.put('/fileSystem/proLicense', { secret, machineInfo, expiresAt, dateChecked })
  }

  const currentPlottrLicense = () => {
    return client.get('/fileSystem/plottrLicense')
  }

  const currentProLicense = () => {
    return client.get('/fileSystem/proLicense')
  }

  // Subscriptions
  const listenToTrialChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToTrialChanges', cb)
  }

  const listenToLicenseChanges = (cb) => {
    return client.longPoll('/fileSystem/licenseChanges', cb)
  }

  const listenToknownFilesChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToKnownFiles', cb)
  }

  const listenToTemplatesChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToTemplates', cb)
  }

  const listenToCustomTemplatesChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToCustomTemplates', cb)
  }

  const listenToTemplateManifestChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToTemplateManifest', cb)
  }

  const listenToExportConfigSettingsChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToExportConfigSettings', cb)
  }

  const listenToAppSettingsChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToAppSettings', cb)
  }

  const listenToBackupsChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToBackups', cb)
  }

  const listenToPlottrLicenseChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToPlottrLicense', cb)
  }

  const listenToProLicenseChanges = (cb) => {
    return client.longPoll('/fileSystem/listenToProLicenseChanges', cb)
  }

  const close = () => {
    return Array.from(client.pollers.values()).forEach((poller) => {
      poller.close()
    })
  }

  const inBadState = () => {
    return false
  }

  const listenToStatus = (cb) => {
    return client.longPoll('/system/busy', cb)
  }

  const setPort = (port) => {
    _clientRef.port = port
    _clientRef.current = createClient(port)
  }

  const getPort = () => {
    return _clientRef.port
  }

  const destroy = () => {
    _clientRef.destroyed = true
  }

  return {
    ping,
    rmRf,
    saveFile,
    saveRawFile,
    saveOfflineFile,
    basename,
    readFile,
    isInBackupFolder,
    saveBackup,
    ensureBackupFullPath,
    ensureBackupTodayPath,
    fileExists,
    backupOfflineBackupForResume,
    readOfflineFiles,
    isTempFile,
    setTemplate,
    setCustomTemplate,
    deleteCustomTemplate,
    defaultBackupLocation,
    offlineFileURL,
    offlineFileBasePath,
    customTemplatesPath,
    copyFile,
    createFileShortcut,
    attemptToFetchTemplates,
    saveAsTempFile,
    removeFromKnownFiles,
    deleteKnownFile,
    updateKnownFileName,
    saveToDefaultLocation,
    addKnownFile,
    editKnownFilePath,
    updateLastOpenedDate,
    // File system APIs
    backupBasePath,
    currentTrial,
    startTrial,
    extendTrialWithReset,
    currentLicense,
    deleteLicense,
    deletePlottrLicense,
    deleteProLicense,
    saveLicenseInfo,
    currentKnownFiles,
    currentTemplates,
    currentCustomTemplates,
    currentTemplateManifest,
    currentExportConfigSettings,
    saveExportConfigSettings,
    currentAppSettings,
    saveAppSetting,
    currentBackups,
    listenToTrialChanges,
    listenToLicenseChanges,
    listenToknownFilesChanges,
    listenToTemplatesChanges,
    listenToCustomTemplatesChanges,
    listenToTemplateManifestChanges,
    listenToExportConfigSettingsChanges,
    listenToAppSettingsChanges,
    listenToBackupsChanges,
    listenToPlottrLicenseChanges,
    listenToProLicenseChanges,
    lastOpenedFile,
    setLastOpenedFilePath,
    nukeLastOpenedFileURL,
    shutdown,
    writeFile,
    join,
    pathSep,
    trash,
    extname,
    resolvePath,
    readdir,
    stat,
    mkdir,
    close,
    inBadState,
    findUniqueNameInPath,
    filePathAsArray,
    directoryIsWritable,
    currentPlottrLicense,
    currentProLicense,
    savePlottrLicense,
    saveProLicense,
    convertDocxToHtml,
    listenToStatus,
    setPort,
    getPort,
    destroy,
  }
}

// See the destructured argument of the connect function for the
// structure of `eventHandlers`.
const createClient = (suppliedPort, suppliedLogger, suppliedSecret, { onBusy, onDone }) => {
  const client = routeFunctions(suppliedPort, suppliedSecret, suppliedLogger)
  client.listenToStatus((error, result) => {
    if (error) {
      if (error.message === INVALID_OR_UNSET_PORT) {
        suppliedLogger.info('Client port not yet set, but we tried to listen to busy status.')
      } else {
        suppliedLogger.error('Error listening to busy status', error)
      }
    } else if (result?.busy) {
      onBusy()
    } else {
      onDone()
    }
  })
  return client
}

export { createClient }
