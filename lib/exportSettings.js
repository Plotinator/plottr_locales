import { setValueForStorageNamed } from './subscribableLocalStorage'

const STORAGE_NAME = 'EXPORT_SETTINGS'

const setValueForKey = setValueForStorageNamed(STORAGE_NAME)

export const saveExportConfigSettings = (key, value) => {
  setValueForKey(key, value)
}
