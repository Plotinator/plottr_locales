import PropTypes from 'prop-types'
// @ts-ignore
import { assertPropTypes } from 'plottr_check-prop-types'

import publishFilesChanges from './files'
import puiblishLicenseChanges from './license'
import publishSessionChanges from './session'
import puiblishSettingsChanges from './settings'
import publishTemplatesChanges from './templates'
import publishBackupsChanges from './backups'

export const storeAccordingToPlottr = {
  dispatch: PropTypes.func.isRequired,
}

const connectListenersToStore = (theWorld, logger) => (store) => {
  assertPropTypes(storeAccordingToPlottr, store, 'plottr-world', 'theWorld', () => {
    const error = new Error()
    return error.stack
  })

  const unsubscribeFromFilesChanges = publishFilesChanges(theWorld)(store)
  const unsubscribeFromLicenseChanges = puiblishLicenseChanges(theWorld)(store)
  const unsubscribeFromSessionChanges = publishSessionChanges(theWorld, logger)(store)
  const unsubscribeFromSettingsChanges = puiblishSettingsChanges(theWorld)(store)
  const unsubscribeFromTemplatesChanges = publishTemplatesChanges(theWorld)(store)
  const unsubscribeFromBackupsChanges = publishBackupsChanges(theWorld)(store)

  return () => {
    unsubscribeFromFilesChanges()
    unsubscribeFromLicenseChanges()
    unsubscribeFromSessionChanges()
    unsubscribeFromSettingsChanges()
    unsubscribeFromTemplatesChanges()
    unsubscribeFromBackupsChanges()
  }
}

export default connectListenersToStore
