import { v4 as uuidv4 } from 'uuid'
import USER from './user_info'
import { trialStore } from './store_hooks'
import SETTINGS from './settings'
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
${JSON.stringify(USER.store)}

TRIAL INFO:
${JSON.stringify(trialStore.store)}

CONFIG:
${JSON.stringify(SETTINGS.store)}

----------------------------------
ERROR LOG
----------------------------------
${logs}

  `
  return report
}
