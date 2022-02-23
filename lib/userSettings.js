import {
  setValueForStorageNamed,
  subscribeToStorageNamed,
  storageForName,
} from './subscribableLocalStorage'

const STORAGE_NAME = 'USER_SETTINGS'

const setValueForKey = setValueForStorageNamed(STORAGE_NAME)

export const saveUserSetting = (key, value) => {
  setValueForKey(key, value)
}

export const listenToUserSettings = (callback) => {
  return subscribeToStorageNamed(STORAGE_NAME, callback)
}

export const currentUserSettings = () => {
  return storageForName(STORAGE_NAME)
}
