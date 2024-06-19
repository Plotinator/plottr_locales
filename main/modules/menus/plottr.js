import electron from 'electron'
import log from 'electron-log'
import { is } from 'electron-util'
import { t, localeNames, setupI18n } from 'plottr_locales'

import { reloadAllWindows } from '../windows'

const reloadMenuForLanguageChangeSuccessHandler = () => {
  log.info('Menu reloaded after language change')
  reloadAllWindows()
}

const reloadMenuForLanguageChangeFailureHandler = (error) => {
  log.error('Failed to reload menu for language change', error)
  return Promise.reject(error)
}

const setLocale = (settingsModule, locale) => {
  return settingsModule
    .saveAppSetting('locale', locale)
    .then(() => {
      return settingsModule.currentSettings().then((settings) => {
        setupI18n(settings, { locale: electron.app.getLocale() })
      })
    })
    .catch((error) => {
      log.error('Failed to change locale settings', error)
      return Promise.reject(error)
    })
}

function buildPlottrMenu(
  loadMenu,
  safelyExit,
  projectModule,
  featureFlagsModule,
  settingsModule,
  knownFilesModule,
  client
) {
  return settingsModule
    .currentSettings()
    .then((settings) => {
      const isPro = settings.user?.isInProMode
      const notEnglish = { ...localeNames }
      // @ts-ignore
      delete notEnglish.en
      const englishFirst = [
        {
          label: 'English',
          click: () => {
            setLocale(settingsModule, 'en').then(() => {
              return loadMenu(
                safelyExit,
                projectModule,
                featureFlagsModule,
                settingsModule,
                knownFilesModule,
                client
              )
                .then(reloadMenuForLanguageChangeSuccessHandler)
                .catch(reloadMenuForLanguageChangeFailureHandler)
            })
          },
        },
        {
          type: 'separator',
        },
        ...Object.entries(notEnglish).map(([locale, name]) => ({
          label: name,
          click: () => {
            setLocale(settingsModule, locale).then(() => {
              return loadMenu(
                safelyExit,
                projectModule,
                featureFlagsModule,
                settingsModule,
                knownFilesModule,
                client
              )
                .then(reloadMenuForLanguageChangeSuccessHandler)
                .catch(reloadMenuForLanguageChangeFailureHandler)
            })
          },
        })),
      ]

      const submenu = [
        {
          label: t('Language'),
          submenu: englishFirst,
        },
      ]

      if (is.macos) {
        submenu.push(
          // @ts-ignore
          {
            label: t('Hide Plottr'),
            accelerator: 'Command+H',
            role: 'hide',
          },
          {
            label: t('Hide Others'),
            accelerator: 'Command+Alt+H',
            role: 'hideothers',
          },
          {
            label: t('Show All'),
            role: 'unhide',
          },
          {
            type: 'separator',
          },
          {
            label: t('Quit'),
            accelerator: 'Cmd+Q',
            click: () => {
              safelyExit.quitWhenDone()
            },
          }
        )
      } else {
        // @ts-ignore
        submenu.push({
          label: t('Close'),
          accelerator: 'Alt+F4',
          click: () => {
            safelyExit.quitWhenDone()
          },
        })
      }
      return {
        label: isPro ? 'Plottr Pro' : 'Plottr',
        submenu: submenu,
      }
    })
    .catch((error) => {
      log.error('Could not read current settings when trying to build plottr menu', error)
      return Promise.reject(error)
    })
}

export { buildPlottrMenu }
