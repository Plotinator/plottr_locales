import axios from 'axios'

export const exportFile = (_filePath, file, type, config, cb) => {
  axios
    .post('/api/export', { file, config: config })
    .then((result) => cb(null, 'success'))
    .catch((error) => cb(error))
}
