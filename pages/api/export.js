import fs from 'fs'
import askToExport from '../../lib/exporter/start_export'

export default (req, res) => {
  const file = req.body.file
  const config = req.body.config
  const extension = config.type === 'scrivener' ? 'scrivener' : 'docx'
  askToExport(
    `/tmp/fileToExport.${extension}`,
    file,
    config.type,
    config,
    (error, filePath) => {
      if (error) {
        res.status(503)
        return res.json({ error })
      } else {
        res.status(200)
        res.setHeader('Content-Disposition', `attachment;filename=${file.file.fileName}.docx`)
        res.setHeader('Content-Type', 'application/octet-stream')
        return fs.createReadStream(filePath).pipe(res)
      }
    },
    false
  )
}
