export const makeSettingsModule = (localClient) => {
  const currentSettings = () => {
    return localClient.currentAppSettings()
  }

  const saveAppSetting = (key, value) => {
    return localClient.saveAppSetting(key, value)
  }

  return { currentSettings, saveAppSetting }
}
