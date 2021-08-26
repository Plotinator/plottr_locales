import axios from 'axios'
import fileDownload from 'js-file-download'

export const exportFile = (_filePath, file, type, config, cb) => {
  axios
    .post('/api/export', { file, config: config })
    .then((result) => {
      fileDownload(result.data, 'file.docx')
      cb(null, 'success')
    })
    .catch((error) => cb(error))
}
