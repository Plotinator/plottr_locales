import { ActionTypes } from 'pltr'
import { t as i18n } from 'plottr_locales'

import log from '../../../shared/logger'
import { whenClientIsReady } from '../../../shared/socket-client/index'
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

export function createErrorReport(error, errorInfo) {
  return userDocumentsPath().then((documentsPath) => {
    return prepareErrorReport(error, errorInfo).then((body) => {
      return whenClientIsReady(({ join, writeFile }) => {
        return join(documentsPath, `plottr_error_report_${Date.now()}.txt`).then((filePath) => {
          return writeFile(filePath, body)
            .then(() => {
              notifyUser(filePath)
            })
            .catch((error) => {
              log.warn(error)
            })
        })
      })
    })
  })
}

function prepareErrorReport(error, errorInfo) {
  return Promise.all([getVersion(), pleaseTellMeWhatPlatformIAmOn]).then(([version, platform]) => {
    // TODO
    return Promise.resolve({ payment_id: 'blarg' }).then((user) => {
      const hasLicense = !!user.licenseKey
      const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${version}
USER HAS LICENSE: ${hasLicense}
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

function notifyUser(filePath) {
  return whenClientIsReady(({ basename }) => {
    return basename(filePath).then((fileName) => {
      notify(
        i18n('Error Report created'),
        i18n('Plottr created a file named {filePath} in your Documents folder', {
          filePath: fileName,
        })
      )
      return showItemInFolder(filePath)
    })
  })
}
