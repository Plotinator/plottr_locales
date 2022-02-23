import axios from 'axios'

import { logger } from '../logger'

export function checkForPro(email, callback) {
  return axios
    .post('/api/edd-proxy', { email })
    .then((response) => {
      logger.info('Successful pro request')
      const { hasPro, info } = response.data
      callback(hasPro, info)
    })
    .catch((error) => {
      logger.error('Failed pro request', error)
      return Promise.reject(error)
    })
}
