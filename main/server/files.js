import fs from 'fs'
import path from 'path'
import { isEqual } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { emptyFile, selectors, SYSTEM_REDUCER_KEYS } from 'pltr/v2'

import {
  AUTO_SAVE_BACKUP_ERROR,
  AUTO_SAVE_ERROR,
  AUTO_SAVE_WORKED_THIS_TIME,
} from '../../shared/socket-server-message-types'

const { readFile, lstat, writeFile, open, unlink, readdir, mkdir } = fs.promises

const basename = path.basename

function escapeFileName(fileName) {
  return escape(fileName.replace(/[/\\]/g, '-'))
}

function removeSystemKeys(jsonData) {
  const withoutSystemKeys = {}
  Object.keys(jsonData).map((key) => {
    if (SYSTEM_REDUCER_KEYS.indexOf(key) >= 0) return
    withoutSystemKeys[key] = jsonData[key]
  })
  return withoutSystemKeys
}

const fileModule = (userDataPath) => {
  const offlineFileFilesPath = path.join(userDataPath, 'offline')
  const TEMP_FILES_PATH = path.join(userDataPath, 'tmp')

  function offlineFilePath(filePath) {
    const fileName = escapeFileName(filePath)
    return path.join(offlineFileFilesPath, fileName)
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

  return (backupModule, settingsModule, logger) => {
    const { saveBackup, backupBasePath } = backupModule
    const { readSettings } = settingsModule

    const checkFileJustWritten = (filePath, data, originalStats, counter) => (fileContents) => {
      // Parsing the file could still fail...
      try {
        const newFileContents = JSON.parse(fileContents)
        const intendedFileContents = JSON.parse(data)
        if (isEqual(newFileContents, intendedFileContents)) {
          // It worked!
          return true
        } else {
          // Somehow, the files are different :/
          //
          // Let's try again...
          logger.warn(`File written to disk at ${filePath} doesn't match the intended file.`)
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              checkSave(filePath, data, originalStats, counter + 1).then(resolve, reject)
            }, 500)
          })
        }
      } catch (error) {
        logger.error(
          `Failed to parse contents of file: ${filePath}.  Attempting to write it again.`,
          error
        )
        return checkSave(filePath, data, null, counter)
      }
    }

    const checkSaveHandleTimestampChange = (filePath, data, originalStats, counter) => {
      try {
        // Check that the file we just wrote is filled with the
        // content that we intended.
        return readFile(filePath).then(checkFileJustWritten(filePath, data, originalStats, counter))
      } catch (error) {
        // If we couldn't read the file, then bail out.  Something went
        // horribly wrong.
        logger.error(`Failed to save to ${filePath}.  Old file is un-touched.`, error)
        return Promise.reject(error)
      }
    }

    const writeAndWaitForFlush = (filePath, data) => {
      return open(filePath, 'w+').then((fileHandle) => {
        return writeFile(fileHandle, data).then(() => {
          return fileHandle.sync().then(() => {
            return fileHandle.close()
          })
        })
      })
    }

    const checkSaveHandleNoOriginalStats = (filePath, data, stats, counter) => {
      // Overwrite the file and then leave it to the main function to
      // check that the file actually changed to what we want it to.
      return writeAndWaitForFlush(filePath, data).then(() => {
        // When we recur, lstat should produce different stats.
        return checkSave(filePath, data, stats, counter)
      })
    }

    const MAX_ATTEMPTS = 10

    const handleFileStats = (filePath, data, originalStats, counter) => (stats) => {
      // If we don't have original stats, then this is the first
      // time that we try to save.  Go ahead and save.
      if (stats && !originalStats) {
        return checkSaveHandleNoOriginalStats(filePath, data, stats, counter)
      }

      // Check that the modified time of the stats before saving is
      // different to that which is after.  Or we tried to find a change
      // in time stamps MAX_ATTEMPTS times.
      const triedEnoughTimes = counter === MAX_ATTEMPTS - 1
      if ((stats && stats.mtimeMs !== originalStats.mtimeMs) || triedEnoughTimes) {
        if (triedEnoughTimes) {
          logger.warn(
            `Timestamp for ${filePath} didn't change, but we're assuming that it did anyway.`
          )
        }
        return checkSaveHandleTimestampChange(filePath, data, originalStats, counter)
      }

      // The timestamp hasn't yet changed.  Wait a little bit before
      // trying again.
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          checkSave(filePath, data, originalStats, counter + 1).then(resolve, reject)
        }, 500)
      })
    }

    function checkSave(filePath, data, originalStats = null, counter = 0) {
      if (counter < MAX_ATTEMPTS) {
        // To kick things off, assume that we're overwriting an existing
        // file and (as per Node docs) catch the ENOENT if the file
        // doesn't exist.
        return lstat(filePath)
          .then(handleFileStats(filePath, data, originalStats, counter))
          .catch((error) => {
            if (error.maxAttemptsHit) {
              return Promise.reject(error)
            }
            // If the Error code flags that the file didn't exist, then
            // write the file and check that it's what we wanted it to be.
            if (error.code === 'ENOENT') {
              return writeAndWaitForFlush(filePath, data).then(
                checkFileJustWritten(filePath, data, originalStats, counter)
              )
            } else {
              // Otherwise, we had an error that we don't yet account for.
              // Log it for later diagnosis and try again after waiting a
              // small bit.
              logger.error(`Unhandled error when saving ${filePath}.`, error)
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  checkSave(filePath, data, originalStats, counter + 1).then(resolve, reject)
                }, 500)
              })
            }
          })
      } else {
        // We ran out of attempts to save the file.
        const error = Error(`Failed to save to ${filePath}.  Old file is un-touched.`)
        error.maxAttemptsHit = true
        logger.error(error)
        return Promise.reject(error)
      }
    }

    const checkForMinimalSetOfKeys = (file, filePath) => {
      const BLANK_FILE = emptyFile()

      const hasMinimalSetOfKeys = Object.keys(BLANK_FILE).every((key) => key in file)
      if (!hasMinimalSetOfKeys) {
        const missingKeys = Object.keys(BLANK_FILE).reduce((acc, key) => {
          if (key in file) return acc
          else return [key, ...acc]
        }, [])
        const errorMessage = `Tried to save file at ${filePath} but after removing system keys it lacks the following expected keys: ${missingKeys}`
        logger.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      }

      return Promise.resolve(file)
    }

    const fileSaver = () => {
      const saveJobs = new Map()

      const currentSaveJob = (filePath) => {
        return saveJobs.get(filePath) || Promise.resolve()
      }

      const updateOrCreateSaveJob = (filePath, withoutSystemKeys) => () => {
        const existingJob = currentSaveJob(filePath)
        const chainingTheJob = saveJobs.get(filePath)
        const newJob = existingJob
          .then((result) => {
            if (chainingTheJob) {
              saveJobs.set(filePath, newJob)
            }
            return result
          })
          .then(() => {
            const payload =
              process.env.NODE_ENV == 'development'
                ? JSON.stringify(withoutSystemKeys, null, 2)
                : JSON.stringify(withoutSystemKeys)
            return checkSave(filePath, payload)
          })
          .then(() => {
            saveJobs.delete(filePath)
          })
          .catch((error) => {
            saveJobs.delete(filePath)
            return Promise.reject(error)
          })
        saveJobs.set(filePath, newJob)
        return newJob
      }

      return function saveFile(filePath, jsonData) {
        return backupBasePath().then((backupPath) => {
          if (path.normalize(filePath).startsWith(path.normalize(backupPath))) {
            const message = `Attempting to save a file that's in the backup folder (${filePath})!  Backups are in ${backupPath}`
            logger.error(message)
            return Promise.reject(message)
          }
          const withoutSystemKeys = removeSystemKeys(jsonData)
          return checkForMinimalSetOfKeys(withoutSystemKeys, filePath).then(
            updateOrCreateSaveJob(filePath, withoutSystemKeys)
          )
        })
      }
    }
    const saveFile = fileSaver()

    const autoSaver = () => {
      let itWorkedLastTime = true

      let backupTimeout = null
      let resetCount = 0
      const MAX_ATTEMPTS = 200

      return async function autoSave(send, inputFilePath, file, userId, previousFile) {
        // Don't auto save while resolving resuming the connection
        if (selectors.isResumingSelector(file)) return

        const onCloud = selectors.isCloudFileSelector(file)
        const isOffline = selectors.isOfflineSelector(file)
        const offlineModeEnabled = selectors.offlineModeEnabledSelector(file)
        const filePath =
          onCloud && isOffline && offlineModeEnabled
            ? offlineFilePath(inputFilePath)
            : inputFilePath
        if (!onCloud || isOffline) {
          try {
            await saveFile(filePath, file)
            // didn't work last time, but it did this time
            if (!itWorkedLastTime) {
              itWorkedLastTime = true
              send(AUTO_SAVE_WORKED_THIS_TIME)
            }
          } catch (saveError) {
            itWorkedLastTime = false
            send(AUTO_SAVE_ERROR, filePath, saveError.message)
          }
        }
        // either way, save a backup
        function forceBackup() {
          logger.info('Saving a backup from auto save for file at', inputFilePath)
          // save local backup if: 1) not cloud file OR 2) localBackups is on
          readSettings().then((settings) => {
            if (!onCloud || (onCloud && settings.user.localBackups)) {
              const backupFilePath = onCloud ? `${file.file.fileName}.pltr` : filePath
              saveBackup(backupFilePath, previousFile || file, (backupError) => {
                if (backupError) {
                  send(AUTO_SAVE_BACKUP_ERROR, backupFilePath, backupError.message)
                }
              }).catch((error) => {
                // Sending the error to the renderer is handled above.
                // This catches other errors so they don't hit the
                // rootand kill the node process.
                logger.error('Error saving backup', error)
              })
            }
            backupTimeout = null
            resetCount = 0
          })
        }
        if (backupTimeout) {
          clearTimeout(backupTimeout)
          resetCount++
        }
        if (resetCount >= MAX_ATTEMPTS) {
          forceBackup()
          return
        }
        // NOTE: We want to backup every 60 seconds, but saves only happen
        // every 10 seconds.
        logger.info('59 seconds later, a backup will be taken for file with path', filePath)
        backupTimeout = setTimeout(forceBackup, 59000)
      }
    }
    const autoSave = autoSaver()

    const isResumeBackup = (fileName) => {
      return fileName.includes('_resume-backup_')
    }

    function listOfflineFiles() {
      return readdir(offlineFileFilesPath)
        .then((entries) => {
          return Promise.all(
            entries.map((entry) => {
              return lstat(path.join(offlineFileFilesPath, entry)).then((folder) => ({
                keep: folder.isFile() && !isResumeBackup(entry),
                payload: path.join(offlineFileFilesPath, entry),
              }))
            })
          ).then((results) => results.filter(({ keep }) => keep).map(({ payload }) => payload))
        })
        .catch((error) => {
          logger.error(`Couldn't list the offline files directory: ${offlineFileFilesPath}`, error)
          return Promise.reject(error)
        })
    }

    function readOfflineFiles() {
      return listOfflineFiles().then((files) => {
        return Promise.all(
          files.map((file) => {
            return readFile(file).then((jsonString) => {
              try {
                const fileData = JSON.parse(jsonString).file
                return [
                  {
                    ...fileData,
                    path: file,
                  },
                ]
              } catch (error) {
                logger.error(`Error reading offline file: ${file}`, error)
                return []
              }
            })
          })
        ).then((results) => results.flatMap((x) => x))
      })
    }

    function cleanOfflineBackups(knownFiles) {
      const expectedOfflineFiles = knownFiles
        .filter(({ isCloudFile, fileName }) => isCloudFile && fileName)
        .map(({ fileName }) => offlineFilePath(fileName))
      return listOfflineFiles().then((files) => {
        const filesToClean = files.filter((filePath) => {
          if (isResumeBackup(filePath)) {
            logger.info(`Not cleaning file at ${filePath} because it's a resume backup.`)
            return false
          }
          return expectedOfflineFiles.indexOf(filePath) === -1
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
    }

    function ensureOfflineBackupPathExists() {
      return lstat(offlineFileFilesPath).catch((error) => {
        if (error.code === 'ENOENT') {
          return mkdir(offlineFileFilesPath, { recursive: true })
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

    function saveOfflineFile(file) {
      return ensureOfflineBackupPathExists().then(() => {
        return checkForFileRecord(file).then(() => {
          const filePath = offlineFilePath(file.file.fileName)
          return cleanOfflineBackups(file.knownFiles).then(() => {
            return saveFile(filePath, file)
          })
        })
      })
    }

    function backupOfflineBackupForResume(file) {
      return ensureOfflineBackupPathExists().then(() => {
        return checkForFileRecord(file).then(() => {
          const date = new Date()
          const filePath = `${offlineFilePath(
            `_resume-backup_${
              date.getMonth() + 1
            }-${date.getDate()}-${date.getFullYear()}-${date.getHours()}h${date.getMinutes()}m${date.getSeconds()}_${
              file.file.fileName
            }`
          )}`
          return saveFile(filePath, file)
        })
      })
    }

    function isTempFile(file) {
      logger.info(`Does ${file.file.fileName} include ${TEMP_FILES_PATH}?`)
      return file.file.fileName.includes(TEMP_FILES_PATH)
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
          const fileBasename = basename(file.file.fileName)
          const newFilepath = `${TEMP_FILES_PATH}/${fileBasename}`
          logger.info(`Saving ${file.file.fileName} to ${TEMP_FILES_PATH}`)
          // We don't want to overwrite an existing file.
          return lstat(newFilepath)
            .then(() => {
              // We'll assume that one file, generated with a UUID in the name, is good enough.
              const baseNameWithoutExtension = basename(file.file.fileName, '.pltr')
              return `${TEMP_FILES_PATH}/${baseNameWithoutExtension}-${uuidv4()}.pltr`
            })
            .catch((error) => {
              if (error.code === 'ENOENT') {
                return Promise.resolve(newFilepath)
              }
              return Promise.reject(error)
            })
            .then((filePath) => {
              return saveFile(filePath, file).then(() => {
                return filePath
              })
            })
        })
    }

    return {
      saveFile,
      saveOfflineFile,
      basename,
      readFile,
      autoSave,
      fileExists,
      backupOfflineBackupForResume,
      readOfflineFiles,
      isTempFile,
      offlineFileFilesPath,
      saveTempFile,
    }
  }
}

export default fileModule
