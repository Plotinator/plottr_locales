import axios from 'axios'

import { logger } from './logger'

export const exportFile = (_filePath, file, type, config, isWindows, cb) => {
  axios
    .post('/api/export', { file, config, type })
    .then((result) => {
      logger.info('result', result)
      if (result.headers.location) {
        window.open(result.headers.location, '_blank')
      }
      cb(null, 'success')
    })
    .catch((error) => cb(error))
}
