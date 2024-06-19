import { nativeTheme } from 'electron'

import { broadcastToAllWindows } from './broadcast'

export const makeThemeModule = (settingsModule, log) => {
  function setDarkMode(newValue) {
    return settingsModule
      .currentSettings()
      .then((settings) => {
        const newValueOrDefault = newValue ?? settings?.user?.dark ?? 'system'
        const source = (newValue !== 'system' && 'manual') || settings.user.themeSource || newValue
        switch (source) {
          case 'manual': {
            settingsModule
              .saveAppSetting('user.dark', newValueOrDefault)
              .then(() => {
                removeThemeListener()
                return settingsModule.saveAppSetting('user.themeSource', 'manual')
              })
              .catch((error) => {
                log.error('Error updating the themeSource to manual', error)
                return Promise.reject(error)
              })
            break
          }
          case 'system':
          default: {
            settingsModule
              .saveAppSetting('user.themeSource', 'system')
              .then(() => {
                if (nativeTheme.shouldUseDarkColors) {
                  settingsModule
                    .saveAppSetting('user.dark', 'dark')
                    .then(() => {
                      broadcastToAllWindows('reload-dark-mode', 'dark')
                    })
                    .catch((error) => {
                      log.error('Error saving the dark setting to light', error)
                      return Promise.reject(error)
                    })
                } else {
                  settingsModule
                    .saveAppSetting('user.dark', 'light')
                    .then(() => {
                      broadcastToAllWindows('reload-dark-mode', 'light')
                    })
                    .catch((error) => {
                      log.error('Error saving the dark setting to light', error)
                      return Promise.reject(error)
                    })
                }
                setThemeListener()
              })
              .catch((error) => {
                log.error('Error setting the theme source to system', error)
                return Promise.reject(error)
              })
            break
          }
        }
      })
      .catch((error) => {
        log.error('Error while getting settings to change darkMode', error)
        return Promise.reject(error)
      })
  }

  function setThemeListener() {
    nativeTheme.on('updated', () => {
      if (nativeTheme.shouldUseDarkColors) {
        settingsModule
          .saveAppSetting('user.dark', 'dark')
          .then(() => {
            broadcastToAllWindows('reload-dark-mode', 'dark')
          })
          .catch((error) => {
            log.error('Error changing the app settings to dark on native theme changed', error)
          })
      } else {
        settingsModule
          .saveAppSetting('user.dark', 'light')
          .then(() => {
            broadcastToAllWindows('reload-dark-mode', 'light')
          })
          .catch((error) => {
            log.error('Error changing the app settings to light on native theme changed', error)
          })
      }
    })
  }

  function removeThemeListener() {
    nativeTheme.removeAllListeners('updated')
  }

  return { setDarkMode, setThemeListener, removeThemeListener }
}
