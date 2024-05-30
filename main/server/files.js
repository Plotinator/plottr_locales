import fs, { constants } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { lock } from 'proper-lockfile'
import mammoth from 'mammoth'

import { checkFileIntegrity, SYSTEM_REDUCER_KEYS, helpers } from 'pltr'

const { readFile, lstat, writeFile, open, unlink, readdir, mkdir, access } = fs.promises

const basename = path.basename

const extname = path.extname

const resolvePath = path.resolve

const MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME = 50

function removeSystemKeys(jsonData) {
  const withoutSystemKeys = {}
  Object.keys(jsonData).map((key) => {
    if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
    withoutSystemKeys[key] = jsonData[key]
  })
  return withoutSystemKeys
}

const fileModule = (userDataPath) => {
  const OFFLINE_FILE_FILES_PATH = path.join(userDataPath, 'offline')
  const TEMP_FILES_PATH = path.join(userDataPath, 'tmp')
  const LOCK_FILES_PATH = path.join(userDataPath, 'locks')

  function offlineFileURL(fileURL) {
    if (!helpers.file.urlPointsToPlottrCloud(fileURL)) {
      return null
    }

    const fileId = helpers.file.fileIdFromPlottrProFile(fileURL)
    return helpers.file.filePathToFileURL(path.join(OFFLINE_FILE_FILES_PATH, fileId))
  }

  function offlineFileBackupForResumeURL(fileName) {
    if (!fileName) {
      return null
    }

    return helpers.file.filePathToFileURL(path.join(OFFLINE_FILE_FILES_PATH, fileName))
  }

  const fileExists = (filePath) => {
    return lstat(filePath)
      .then(() => true)
      .catch((error) => {
        if (error.code === 'ENOENT') {
          return Promise.resolve(false)
        } else {
          return Promise.reject(error)
        }
      })
  }

  return (backupModule, settingsModule, stores, logger) => {
    const { backupBasePath } = backupModule

    const withLockedFile = (filePath, f) => {
      return lstat(filePath)
        .catch((error) => {
          if (error.code === 'ENOENT') {
            return f()
          } else {
            return Promise.reject(error)
          }
        })
        .then(ensureLockFilePathExists)
        .then(() => {
          return lock(filePath, {
            lockfilePath: `${LOCK_FILES_PATH}/${basename(filePath)}.lock`,
          })
            .catch((error) => {
              logger.error('Failed to lock the file for', filePath, error.message, error.stack)
              return Promise.reject(new Error('Failed to lock'))
            })
            .then((release) => {
              function attemptRelease(secondAttempt) {
                return release().catch((error) => {
                  if (secondAttempt) {
                    logger.error(
                      'Failed to release the lock file for',
                      filePath,
                      error.message,
                      error.stack
                    )
                    return Promise.reject(new Error('Failed to release lock'))
                  } else {
                    return new Promise((resolve, reject) => {
                      return attemptRelease(true).then(resolve, reject)
                    })
                  }
                })
              }
              const result = f()
              if (typeof result.then === 'function') {
                return result.then(() => {
                  return attemptRelease()
                })
              } else {
                return attemptRelease()
              }
            })
        })
    }

    const unlockedWriteAndWaitForFlush = (filePath, data) => {
      return open(filePath, 'w+').then((fileHandle) => {
        return writeFile(fileHandle, data).then(() => {
          return fileHandle.sync().then(() => {
            return fileHandle.close()
          })
        })
      })
    }

    const writeAndWaitForFlush = (filePath, data) => {
      return withLockedFile(filePath, () => {
        return unlockedWriteAndWaitForFlush(filePath, data)
      })
    }

    function saveFile(fileURL, jsonData) {
      const isDeviceFile = helpers.file.isDeviceFileURL(fileURL)
      if (!isDeviceFile) {
        const message = `Attempted to save non-device file to device: ${fileURL}`
        logger.error(message)
        return Promise.reject(new Error(message))
      }
      return backupBasePath().then((backupPath) => {
        const filePath = helpers.file.withoutProtocol(fileURL)
        if (path.normalize(filePath).startsWith(path.normalize(backupPath))) {
          const message = `Attempting to save a file that's in the backup folder (${filePath})!  Backups are in ${backupPath}`
          logger.error(message)
          return Promise.reject(message)
        }
        const withoutSystemKeys = removeSystemKeys(jsonData)
        return checkFileIntegrity(withoutSystemKeys, filePath).then(() => {
          const payload =
            process.env.NODE_ENV == 'development'
              ? JSON.stringify(withoutSystemKeys, null, 2)
              : JSON.stringify(withoutSystemKeys)
          return writeAndWaitForFlush(filePath, payload)
        })
      })
    }

    function saveRawFile(filePath, rawData) {
      return unlockedWriteAndWaitForFlush(filePath, rawData)
    }

    const isResumeBackup = (fileName) => {
      return fileName.includes('_resume-backup_')
    }

    function listOfflineFiles() {
      return readdir(OFFLINE_FILE_FILES_PATH)
        .then((entries) => {
          return Promise.all(
            entries.map((entry) => {
              return lstat(path.join(OFFLINE_FILE_FILES_PATH, entry)).then((folder) => ({
                keep: folder.isFile() && !isResumeBackup(entry),
                payload: path.join(OFFLINE_FILE_FILES_PATH, entry),
              }))
            })
          ).then((results) => results.filter(({ keep }) => keep).map(({ payload }) => payload))
        })
        .catch((error) => {
          logger.error(
            `Couldn't list the offline files directory: ${OFFLINE_FILE_FILES_PATH}`,
            error
          )
          return Promise.reject(error)
        })
    }

    function readOfflineFiles() {
      return listOfflineFiles().then((files) => {
        return Promise.all(
          files.map((filePath) => {
            return readFile(filePath).then((jsonString) => {
              try {
                const fileId = basename(filePath, '.pltr')
                const fileData = JSON.parse(jsonString).file
                return [
                  {
                    fileURL: `plottr://${fileId}`,
                    lastOpened: fileData.timeStamp,
                    fileName: fileData.fileName,
                    isOfflineBackup: true,
                  },
                ]
              } catch (error) {
                logger.error(`Error reading offline file: ${filePath}`, error)
                return []
              }
            })
          })
        ).then((results) => results.flatMap((x) => x))
      })
    }

    // Not sure this makes valid assumptions anymore.
    function _cleanOfflineBackups() {
      return stores.knownFiles.currentValue().then((knownFilesIndex) => {
        const expectedOfflineFiles = Object.values(knownFilesIndex)
          .filter(({ isCloudFile, fileURL }) => isCloudFile && fileURL)
          .map(({ fileURL }) => fileURL)
          .filter((x) => x)
        return listOfflineFiles().then((files) => {
          const filesToClean = files.filter((filePath) => {
            if (isResumeBackup(filePath)) {
              logger.info(`Not cleaning file at ${filePath} because it's a resume backup.`)
              return false
            }
            const fileURL = helpers.file.fileIdToPlottrCloudFileURL(basename(filePath))
            return expectedOfflineFiles.indexOf(fileURL) === -1
          })
          return Promise.all(
            filesToClean.map((filePath) => {
              logger.info(
                'Removing offline backup: "',
                filePath,
                '" because the online counterpart no longer exists'
              )
              return unlink(filePath)
            })
          )
        })
      })
    }

    function ensureLockFilePathExists() {
      return lstat(LOCK_FILES_PATH).catch((error) => {
        if (error.code === 'ENOENT') {
          return mkdir(LOCK_FILES_PATH, { recursive: true }).then(() => {
            // Wait a little for the OS when we first make the lock
            // file folder.
            return new Promise((resolve) => {
              setTimeout(resolve, 1000)
            })
          })
        } else {
          return Promise.reject(error)
        }
      })
    }

    function ensureOfflineBackupPathExists() {
      return lstat(OFFLINE_FILE_FILES_PATH).catch((error) => {
        if (error.code === 'ENOENT') {
          return mkdir(OFFLINE_FILE_FILES_PATH, { recursive: true })
        }
        return Promise.reject(error)
      })
    }

    function checkForFileRecord(file) {
      if (!file || !file.file || !file.file.fileName) {
        logger.error('Trying to save a file but there is no file record on it.', file)
        return Promise.reject(
          new Error(`Trying to save a file (${file.file}) but there is no file record on it.`)
        )
      }
      return Promise.resolve(file)
    }

    function saveOfflineFile(originalFileURL, file) {
      return ensureOfflineBackupPathExists().then(() => {
        return checkForFileRecord(file).then(() => {
          const fileURL = offlineFileURL(originalFileURL)
          if (!fileURL) {
            const message = `Attempting to save offline file but we couldn't compute the offline url: ${fileURL}`
            logger.error(message)
            return Promise.reject(new Error(message))
          }
          return saveFile(fileURL, file)
          // Not sure this is based on valid assumptions anymore.
          //
          // return cleanOfflineBackups().then(() => {
          // })
        })
      })
    }

    function backupOfflineBackupForResume(file) {
      return ensureOfflineBackupPathExists().then(() => {
        return checkForFileRecord(file).then(() => {
          const date = new Date()
          const fileURL = offlineFileBackupForResumeURL(
            `_resume-backup_${
              date.getMonth() + 1
            }-${date.getDate()}-${date.getFullYear()}-${date.getHours()}h${date.getMinutes()}m${date.getSeconds()}_${
              file.file.fileName
            }`
          )
          if (!fileURL) {
            const message = `Failed to create fileURL for resume backup for ${file.file.fileName}`
            logger.error(message)
            return Promise.reject(new Error(message))
          }
          return saveFile(fileURL, file)
        })
      })
    }

    function isTempFile(fileURL) {
      logger.info(`Does ${fileURL} include ${TEMP_FILES_PATH} when we strip the URL from it?`)
      return helpers.file.withoutProtocol(fileURL).includes(TEMP_FILES_PATH)
    }

    function saveTempFile(file) {
      // Does the tmp file directory exist?
      return lstat(TEMP_FILES_PATH)
        .catch((error) => {
          logger.info(`Temp file directory ${TEMP_FILES_PATH} doesn't exist.  Creating it.`)
          if (error.code === 'ENOENT') {
            return mkdir(TEMP_FILES_PATH, { recursive: true })
          }
          return Promise.reject(error)
        })
        .then(() => {
          // It's fine to use the fileName to derive a path/URL here
          // because we're *creating* the temp file.
          const fileBasename = basename(file.file.fileName)
          const newFilepath = `${TEMP_FILES_PATH}/${fileBasename}`
          logger.info(`Saving ${file.file.fileName} to ${TEMP_FILES_PATH}`)
          // We don't want to overwrite an existing file.
          return lstat(newFilepath)
            .then(() => {
              // We'll assume that one file, generated with a UUID in the name, is good enough.
              const baseNameWithoutExtension = basename(file.file.fileName, '.pltr')
              return path.join(TEMP_FILES_PATH, `${baseNameWithoutExtension}-${uuidv4()}.pltr`)
            })
            .catch((error) => {
              if (error.code === 'ENOENT') {
                return Promise.resolve(newFilepath)
              }
              return Promise.reject(error)
            })
            .then((filePath) => {
              const fileURL = helpers.file.filePathToFileURL(filePath)
              return saveFile(fileURL, file).then(() => {
                return fileURL
              })
            })
        })
    }

    const readFileToString = (filePath) => {
      return readFile(filePath).then((data) => {
        return data.toString()
      })
    }

    const _writeFile = (filePath, data) => {
      return writeFile(filePath, data)
    }

    const _join = (...pathArgs) => {
      return Promise.resolve(path.join(...pathArgs))
    }

    const separator = path.sep

    const stat = (path) => {
      return lstat(path).then((stats) => {
        return {
          ...stats,
          isDirectory: stats.isDirectory(),
        }
      })
    }

    const makeDirectory = (path) => {
      return mkdir(path, { recursive: true })
    }

    const findUniqueNameInPath = (originalPath, counter = 0) => {
      return fileExists(originalPath).then((exists) => {
        if (exists) {
          if (counter > MAX_ATTEMPTS_TO_FIND_TEMP_FILE_NAME) {
            const errorMessage = `We couldn't save your file to ${originalPath}`
            logger.error(errorMessage, 'reached max attempts to find unique file name')
            return Promise.reject(new Error('Could not find a unique name for the file'))
          }
          // add one and try again
          const newCounter = counter + 1
          const newPath = counter
            ? originalPath.replace(` - ${counter}.pltr`, ` - ${newCounter}.pltr`)
            : originalPath.replace(`.pltr`, ` - ${newCounter}.pltr`)
          return findUniqueNameInPath(newPath, newCounter)
        } else {
          return originalPath
        }
      })
    }

    const filePathAsArray = (filePath) => {
      return Promise.resolve(filePath.split(separator))
    }

    const directoryIsWritable = (filePath) => {
      return access(filePath, constants.R_OK | constants.W_OK)
        .then(() => {
          return true
        })
        .catch((error) => {
          logger.warn(`Directory not writable ${error.message}`)
          return false
        })
    }

    const convertDocxToHTML = (filePath) => {
      return mammoth.convertToHtml({ path: filePath }).then(({ value }) => {
        return value
      })
    }

    return {
      saveRawFile,
      saveFile,
      saveOfflineFile,
      basename,
      extname,
      resolvePath,
      readFile: readFileToString,
      fileExists,
      backupOfflineBackupForResume,
      readOfflineFiles,
      isTempFile,
      offlineFilesFilesPath: OFFLINE_FILE_FILES_PATH,
      OFFLINE_FILE_FILES_PATH,
      saveTempFile,
      writeFile: _writeFile,
      join: _join,
      separator,
      offlineFileURL,
      stat,
      readdir,
      mkdir: makeDirectory,
      findUniqueNameInPath,
      filePathAsArray,
      directoryIsWritable,
      convertDocxToHTML,
    }
  }
}

export default fileModule
