import { plottrWorldAPI } from 'plottr_world'

import { localStorageAPIs, firebaseAPIs } from './api'

const {
  listenToTemplatesChanges,
  currentTemplates,
  listenToTemplateManifestChanges,
  currentTemplateManifest,
  listenToExportConfigSettingsChanges,
  currentExportConfigSettings,
  listenToAppSettingsChanges,
  currentAppSettings,
  listenToUserSettingsChanges,
  currentUserSettings,
} = localStorageAPIs

const {
  listenToKnownFiles,
  currentKnownFiles,
  listenToBackupsChanges,
  currentBackups,
  listenToCustomTemplates,
  currentCustomTemplates,
} = firebaseAPIs

const ignoringStore = (fn) => (store, cb) => fn(cb)

const nopListen = () => {
  return () => {}
}
const nopCurrent = () => ({})

const theWorld = {
  license: {
    // Trial functions are nops because web doesn't have trials.
    listenToTrialChanges: nopListen,
    currentTrial: nopCurrent,
    // License functions are nops because web doesn't have licenses
    listenToLicenseChanges: ignoringStore(nopListen),
    currentLicense: nopCurrent,
  },
  session: {
    listenForSessionChange: ignoringStore(firebaseAPIs.listenForSessionChange),
  },
  files: {
    listenToknownFilesChanges: ignoringStore(listenToKnownFiles),
    currentKnownFiles,
  },
  backups: {
    listenToBackupsChanges: ignoringStore(listenToBackupsChanges),
    currentBackups,
  },
  templates: {
    listenToTemplatesChanges: ignoringStore(listenToTemplatesChanges),
    currentTemplates,
    listenToCustomTemplatesChanges: ignoringStore(listenToCustomTemplates),
    currentCustomTemplates,
    listenToTemplateManifestChanges: ignoringStore(listenToTemplateManifestChanges),
    currentTemplateManifest,
  },
  settings: {
    listenToExportConfigSettingsChanges: ignoringStore(listenToExportConfigSettingsChanges),
    currentExportConfigSettings,
    listenToAppSettingsChanges: ignoringStore(listenToAppSettingsChanges),
    currentAppSettings,
    listenToUserSettingsChanges: ignoringStore(listenToUserSettingsChanges),
    currentUserSettings,
  },
}

const world = plottrWorldAPI(theWorld)

export default world
