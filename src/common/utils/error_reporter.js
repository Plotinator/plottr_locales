import { ActionTypes } from 'pltr'
import { t as i18n } from 'plottr_locales'

import log from '../../../shared/logger'
import { makeMainProcessClient } from '../../app/mainProcessClient'

let previousAction = null

export function setPreviousAction(action) {
  previousAction = action
}

export function hasPreviousAction() {
  if (!previousAction) return false
  if (previousAction.type == ActionTypes.FILE_LOADED) return false
  return true
}

export function getPreviousAction() {
  return previousAction
}

const { userDocumentsPath, getVersion, showItemInFolder, notify, pleaseTellMeWhatPlatformIAmOn } =
  makeMainProcessClient()

export function createErrorReport(localClient, error, errorInfo) {
  return userDocumentsPath().then((documentsPath) => {
    return prepareErrorReport(localClient, error, errorInfo).then((body) => {
      return localClient
        .join(documentsPath, `plottr_error_report_${Date.now()}.txt`)
        .then((filePath) => {
          return localClient
            .writeFile(filePath, body)
            .then(() => {
              notifyUser(localClient, filePath)
            })
            .catch((error) => {
              log.warn(error)
            })
        })
    })
  })
}

function prepareErrorReport(localClient, error, errorInfo) {
  return Promise.all([getVersion(), pleaseTellMeWhatPlatformIAmOn]).then(([version, platform]) => {
    // TODO
    return Promise.resolve({ payment_id: 'blarg' }).then((user) => {
      const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${version}
PLATFORM: ${platform}
----------------------------------
ERROR
----------------------------------
name: ${error.name}
message: ${error.message}
stack: ${error.stack}
componentStack: ${errorInfo.componentStack}
----------------------------------
PREVIOUS ACTION
----------------------------------
${JSON.stringify(previousAction)}
  `
      return report
    })
  })
}

function notifyUser(localClient, filePath) {
  return localClient.basename(filePath).then((fileName) => {
    notify(
      i18n('Error Report created'),
      i18n('Plottr created a file named {filePath} in your Documents folder', {
        filePath: fileName,
      })
    )
    return showItemInFolder(filePath)
  })
}
