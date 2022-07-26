import axios from 'axios'

import { logger } from './logger'
import { mintCookieToken } from 'wired-up-firebase'

export const exportFile = (
  _filePath,
  file,
  type,
  config,
  isWindows,
  _notifyUser,
  _logger,
  _saveDialog,
  _mpq,
  userId,
  downloadStorageImage,
  cb
) => {
  console.log('Exporting...', { file, config, type })
  axios
    .post(`/api/export?userId=${userId}`, { file, config, type })
    .then((result) => {
      logger.info(`Successfully exported a file to ${type}`, config)
      if (result.headers.location) {
        window.open(result.headers.location, '_blank')
      }
      cb(null, 'success')
    })
    .catch((error) => {
      const status = error?.response?.status
      logger.error('Error exporting file', error.message, status, error.response)
      if (status === 401) {
        return mintCookieToken().then(() => cb(error))
      }
      return cb(error)
    })
}
