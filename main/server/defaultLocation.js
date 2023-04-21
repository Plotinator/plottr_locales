import fs from 'fs'
import path from 'path'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

const { lstat, mkdir } = fs.promises

const makeDefaultLocationModule = (settings, fileModule, logger) => {
  const { readSettings } = settings
  const { saveFile, findUniqueNameInPath } = fileModule

  function uniqueFilePath(fileName) {
    return readSettings().then((settings) => {
      const defaultFolderLocation = settings.user.defaultFolderLocation
      return findUniqueNameInPath(path.join(defaultFolderLocation, `${fileName}.pltr`), 0)
    })
  }

  function ensureDefaultFolderExists() {
    // Does the default folder exist?
    return readSettings().then((settings) => {
      const defaultFolderLocation = settings.user.defaultFolderLocation
      return lstat(defaultFolderLocation).catch((error) => {
        logger.info(
          `Default folder directory ${defaultFolderLocation} doesn't exist.  Creating it.`
        )
        if (error.code === 'ENOENT') {
          return mkdir(defaultFolderLocation, { recursive: true })
        }

        logger.error('Could not create default folder path', error)
        return Promise.reject(error)
      })
    })
  }

  function saveToDefaultLocation(json, name) {
    return readSettings().then((settings) => {
      if (settings.user.defaultFolder && settings.user.defaultFolderLocation) {
        return ensureDefaultFolderExists()
          .then(() => {
            return name || t('Untitled')
          })
          .then((fileName) => {
            return uniqueFilePath(fileName).then((filePath) => {
              const fileURL = helpers.file.filePathToFileURL(filePath)
              if (!fileURL) {
                const message = `Couldn't compute a file URL for temp file that we're trying to save to ${filePath}`
                logger.error(message)
                return Promise.reject(Error(message))
              }
              return saveFile(fileURL, json).then(() => fileURL) // Need to make sure these are added to known files
            })
          })
      } else {
        // name is the full file path
        const fileURL = helpers.file.filePathToFileURL(name)
        if (!fileURL) {
          const message = `Couldn't compute a file URL for temp file that we're trying to save to ${name}`
          logger.error(message)
          return Promise.reject(Error(message))
        }
        return saveFile(fileURL, json).then(() => fileURL) // Need to make sure these are added to known files
      }
    })
  }

  return { saveToDefaultLocation }
}

export default makeDefaultLocationModule
