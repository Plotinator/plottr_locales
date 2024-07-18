import { t } from 'plottr_locales'
import { helpers } from 'pltr'

import logger from '../../../shared/logger'
import { makeMainProcessClient } from '../../app/mainProcessClient'
import { closeDashboard } from '../../dashboard-events'
import { uploadProject } from './upload_project'
import { getErrorReporterInstance } from '../../../shared/error-reporter-instance'

const { openKnownFile, addToKnownFilesAndOpen } = makeMainProcessClient()

/**
 * @param fileURL {string}
 * @param unknown {boolean}
 * @returns {void}
 */
const openFile = (fileURL, unknown) => {
  openKnownFile(fileURL, unknown)
}

export function openExistingFile(localClient, loggedIn, userId, email, filePath) {
  if (typeof filePath !== 'string') {
    return Promise.resolve('No file selected')
  }

  if (loggedIn) {
    return localClient.extname(filePath).then((ext) => {
      return localClient.basename(filePath, ext).then((fileName) => {
        try {
          return localClient.readFile(filePath).then((fileText) => {
            const file = JSON.parse(fileText)
            return uploadProject(
              localClient,
              {
                ...file,
                file: {
                  ...file.file,
                  fileName,
                },
              },
              email,
              userId
            ).then((response) => {
              const fileId = response.data.fileId
              if (!fileId) {
                const message = `Tried to upload project from ${filePath} but the server replied without a fileId`
                getErrorReporterInstance().then((errorReporter) => {
                  errorReporter.error(message, new Error('Failed to upload file'))
                })
                logger.error(message)
                return Promise.reject(new Error(message))
              } else {
                const fileURL = helpers.file.fileIdToPlottrCloudFileURL(fileId)
                logger.info('Successfully uploaded file')

                if (fileURL === null) {
                  throw new Error(`Invalid file from id: ${fileId}`)
                } else {
                  openFile(fileURL, false)
                  closeDashboard()
                  return 'File opened...'
                }
              }
            })
          })
        } catch (error) {
          getErrorReporterInstance().then((errorReporter) => {
            errorReporter.error('Error uploading file', error)
          })
          logger.error('Error uploading file', error)
          return Promise.reject(error)
        }
      })
    })
  }

  return addToKnownFilesAndOpen(helpers.file.filePathToFileURL(filePath))
}
