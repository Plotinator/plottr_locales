import askToExport from '../../lib/exporter/start_export'

export default (req, res) => {
  const file = req.body.file
  const config = req.body.config
  const extension = config.type === 'scrivener' ? 'scrivener' : 'docx'
  askToExport(`/tmp/fileToExport.${extension}`, file, config.type, (error, success) => {
    if (error) {
      res.status(503)
      res.json({ error })
    } else {
      res.status(200)
      res.json({ success })
    }
  })
}
