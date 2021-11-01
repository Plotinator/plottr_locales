import { logger } from '../logger'
import ScrivenerExporter from './scrivener/v2/exporter'
import WordExporter from './word/exporter'

export default function askToExport(defaultPath, fullState, type, options, cb, isWindows) {
  try {
    switch (type) {
      case 'scrivener':
        ScrivenerExporter(fullState, defaultPath, options, isWindows)
        break
      case 'word':
      default:
        WordExporter(fullState, defaultPath, options)
          .then((filePath) => {
            cb(null, filePath)
          })
          .catch((error) => {
            logger.error('error', error)
          })
        return
    }
    cb(null, true)
  } catch (error) {
    cb(error, false)
  }
}
