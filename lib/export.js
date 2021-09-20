import axios from 'axios'

export const exportFile = (_filePath, file, type, config, isWindows, cb) => {
  axios
    .post('/api/export', { file, config: config })
    .then((result) => {
      console.log('result', result)
      if (result.headers.location) {
        window.open(result.headers.location, '_blank')
      }
      cb(null, 'success')
    })
    .catch((error) => cb(error))
}
