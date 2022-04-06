import {
  setValueForStorageNamed,
  subscribeToStorageNamed,
  storageForName,
  ensureStorageForNameExists,
} from './subscribableLocalStorage'
import DEFAULT_SETTINGS from './defaultExportSettings'

const STORAGE_NAME = 'EXPORT_SETTINGS'

const setValueForKey = setValueForStorageNamed(STORAGE_NAME)

export const saveExportConfigSettings = (key, value) => {
  ensureStorageForNameExists(STORAGE_NAME, DEFAULT_SETTINGS)
  setValueForKey(key, value)
}

export const listenToExportConfigSettings = (callback) => {
  ensureStorageForNameExists(STORAGE_NAME, DEFAULT_SETTINGS)
  return subscribeToStorageNamed(STORAGE_NAME, callback)
}

export const currentExportConfig = () => {
  ensureStorageForNameExists(STORAGE_NAME, DEFAULT_SETTINGS)
  return storageForName(STORAGE_NAME)
}
