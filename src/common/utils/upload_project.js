import { migrateIfNeeded } from 'pltr'

import { uploadExisting } from '../../files'
import extractImages from '../extract_images'
import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../../app/mainProcessClient'
import { getErrorReporterInstance } from '../../../shared/error-reporter-instance'

const { getVersion } = makeMainProcessClient()

export const uploadProject = (file, email, userId) => {
  return getVersion().then((appVersion) => {
    return new Promise((resolve, reject) => {
      migrateIfNeeded(
        appVersion,
        file,
        file.file.fileName,
        null,
        (error, migrated, data) => {
          if (error) {
            getErrorReporterInstance().then((errorReporter) => {
              errorReporter.error('Error migrating file', error)
            })
            logger.error('Error migrating file', error)
            reject(error)
            return
          }
          if (migrated) {
            logger.info(
              `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
            )
          }
          extractImages(data, userId)
            .then((patchedData) => {
              return uploadExisting(email, userId, patchedData)
            })
            .then((result) => {
              logger.info('successful upload', file.file.fileName)
              resolve(result)
            })
            .catch((err) => {
              getErrorReporterInstance().then((errorReporter) => {
                errorReporter.error('Failed to upload project', file.file.fileName, err)
              })
              logger.error('Failed to upload project', file.file.fileName, err)
              reject(err)
            })
        },
        logger
      )
    })
  })
}
