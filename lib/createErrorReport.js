import { settings } from './settings'
import { appVersion } from './version'

// NOTE: this is for specific error occurences
// A full error report (all errors by the user) doesn't make sense on the web
// we should have a logging solution that let's us query those
export const createErrorReport = (error, errorInfo, proInfo, trialInfo) => {
  const body = prepareErrorReport(error, errorInfo, proInfo, trialInfo)
  // Start file download
  download('error_report.txt', body)
}

function prepareErrorReport(error, errorInfo, proInfo, trialInfo) {
  const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${appVersion()}
PLATFORM: Web

USER INFO:
${JSON.stringify(proInfo)}

TRIAL INFO:
${JSON.stringify(trialInfo)}

CONFIG:
${JSON.stringify(settings.store)}

----------------------------------
ERROR
----------------------------------
name: ${error.name}
message: ${error.message}
stack: ${error.stack}
componentStack: ${errorInfo.componentStack}
  `
  return report
}

function download(filename, text) {
  var element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}
