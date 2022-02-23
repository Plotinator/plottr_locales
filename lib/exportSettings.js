import {
  setValueForStorageNamed,
  subscribeToStorageNamed,
  storageForName,
} from './subscribableLocalStorage'

const STORAGE_NAME = 'EXPORT_SETTINGS'

const setValueForKey = setValueForStorageNamed(STORAGE_NAME)

export const saveExportConfigSettings = (key, value) => {
  setValueForKey(key, value)
}

export const listenToExportConfigSettings = (callback) => {
  return subscribeToStorageNamed(STORAGE_NAME)
}

export const currentExportConfig = () => {
  return storageForName(STORAGE_NAME)
}
