import { setValueForStorageNamed } from './subscribableLocalStorage'

const STORAGE_NAME = 'APP_SETTINGS'

const setValueForKey = setValueForStorageNamed(STORAGE_NAME)

export const saveAppSetting = (key, value) => {
  setValueForKey(key, value)
}
