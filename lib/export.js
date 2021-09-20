import axios from 'axios'

export const exportFile = (_filePath, file, type, config, cb) => {
  axios
    .post('/api/export', { file, config: config })
    .then((result) => {
      if (result.headers.location) {
        window.open(result.headers.location, '_blank')
      }
      cb(null, 'success')
    })
    .catch((error) => cb(error))
}
