import {
  setValueForStorageNamed,
  subscribeToStorageNamed,
  storageForName,
  ensureStorageForNameExists,
} from './subscribableLocalStorage'
import DEFAULT_SETTINGS from './defaultSettings'

const STORAGE_NAME = 'APP_SETTINGS'

const setValueForKey = setValueForStorageNamed(STORAGE_NAME)

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
