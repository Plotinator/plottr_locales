import { v4 as uuidv4 } from 'uuid'
import { trialStore, licenseInfoStore } from './store_hooks'
import { settings } from './settings'
import { appVersion } from './version'

const machineID = uuidv4()

export const createErrorReport = () => {
  const body = prepareErrorReport()
  // TODO: we have a body, what now?  Use an API to email it?
}

function prepareErrorReport() {
  // TODO: where are the logs?  I could use the clientId (from Redux)
  // as an id in the logs for sessions.
  const logs = ''
  const report = `
----------------------------------
INFO
----------------------------------
DATE: ${new Date().toString()}
VERSION: ${appVersion()}
PLATFORM: Web
MACHINE ID: ${machineID}

USER INFO:
${JSON.stringify(licenseInfoStore())}

TRIAL INFO:
${JSON.stringify(trialStore())}

CONFIG:
${JSON.stringify(settings.store)}

----------------------------------
ERROR LOG
----------------------------------
${logs}

  `
  return report
}
