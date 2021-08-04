import ScrivenerExporter from './scrivener/v2/exporter'
import WordExporter from './word/exporter'

export default function askToExport(defaultPath, fullState, type, options, cb) {
  try {
    switch (type) {
      case 'scrivener':
        ScrivenerExporter(fullState, '', options)
        break
      case 'word':
      default:
        WordExporter(fullState, '', options)
        break
    }
    cb(null, true)
  } catch (error) {
    cb(error, false)
  }
}
