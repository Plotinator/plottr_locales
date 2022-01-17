import {
  setValueForStorageNamed,
  subscribeToStorageNamed,
  storageForName,
  ensureStorageForNameExists,
} from './subscribableLocalStorage'

const DEFAULT_SETTINGS = {
  showTheTour: false,
  backup: true,
  allowPrerelease: false,
  forceDevTools: false,
  trialMode: false,
  canGetUpdates: false,
  isInGracePeriod: false,
  gracePeriodEnd: 0,
  canEdit: true,
  canExport: true,
  user: {
    autoDownloadUpdate: false,
    autoSave: false,
    backupDays: 30,
    backupLocation: 'default',
    darkModeAlways: false,
  },
}

const STORAGE_NAME = 'APP_SETTINGS'

const setValueForKey = () => {
  ensureStorageForNameExists(STORAGE_NAME, DEFAULT_SETTINGS)
  setValueForStorageNamed(STORAGE_NAME)
}

export const saveAppSetting = (key, value) => {
  ensureStorageForNameExists(STORAGE_NAME, DEFAULT_SETTINGS)
  setValueForKey(key, value)
}

export const listenToAppSettings = (callback) => {
  ensureStorageForNameExists(STORAGE_NAME, DEFAULT_SETTINGS)
  return subscribeToStorageNamed(STORAGE_NAME, callback)
}

export const currentAppSettings = () => {
  ensureStorageForNameExists(STORAGE_NAME, DEFAULT_SETTINGS)
  return storageForName(STORAGE_NAME)
}
