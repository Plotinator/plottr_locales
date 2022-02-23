import { listenToAppSettings, currentAppSettings, saveAppSetting } from '../appSettings'
import { listenToUserSettings, currentUserSettings } from '../userSettings'
import { allTemplates, manifest } from '../templates'
import { listenToExportConfigSettings, currentExportConfig } from '../exportSettings'

export const listenToTemplatesChanges = (cb) => {
  cb(allTemplates())
  const listener = () => {
    cb(allTemplates())
  }
  document.addEventListener('templates-changed', listener)
  return () => {
    document.removeEventListener('templates-changed', listener)
  }
}
export const currentTemplates = allTemplates

export const listenToTemplateManifestChanges = (cb) => {
  cb(manifest())
  const listener = () => cb(manifest())
  document.addEventListener('manifest-changed', listener)
  return () => {
    document.removeEventListener('manifest-changed', listener)
  }
}
export const currentTemplateManifest = manifest

export const listenToExportConfigSettingsChanges = (cb) => {
  cb(currentExportConfig())
  return listenToExportConfigSettings(cb)
}
export const currentExportConfigSettings = currentExportConfig
export const saveExportConfigSettings = saveExportConfigSettings

export const listenToAppSettingsChanges = (cb) => {
  cb(currentAppSettings())
  return listenToAppSettings(cb)
}
export { currentAppSettings, saveAppSetting }

export const listenToUserSettingsChanges = (cb) => {
  cb(currentUserSettings())
  return listenToUserSettings(cb)
}
export { currentUserSettings }
