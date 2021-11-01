import { logger } from '../logger'

export function notifyUser(exportPath, type) {
  logger.info('Exported to ', exportPath, ' of type: ', type)
}
