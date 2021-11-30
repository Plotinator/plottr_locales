import axios from 'axios'

import { logger } from './logger'
import { mintCookieToken, currentUser } from 'wired-up-firebase'

export const exportFile = (_filePath, file, type, config, isWindows, cb) => {
  axios
    .post('/api/export', { file, config, type })
    .then((result) => {
      logger.info(`Successfully exported a file to ${type}`, config)
      if (result.headers.location) {
        window.open(result.headers.location, '_blank')
      }
      cb(null, 'success')
    })
    .catch((error) => {
      const status = error.response.status
      logger.error('Error exporting file', status, error.response)
      if (status === 401) {
        return mintCookieToken(currentUser()).then(() => cb(error))
      }
      return cb(error)
    })
}
