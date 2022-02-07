import { settings } from './settings'

const localeSettingsHandler = {
  get: (object, key) => {
    switch (key) {
      case 'locale': {
        const userSetLocale = settings.locale
        if (userSetLocale) return userSetLocale
        if (typeof navigator === 'undefined') return 'en'
        if (navigator.language.match(/^en/)) {
          return 'en'
        } else if (navigator.language.match(/^es/)) {
          return 'es'
        } else if (navigator.language.match(/^fr/)) {
          return 'fr'
        }
        return 'en'
      }
      default:
        return undefined
    }
  },
}

const localeSettings = new Proxy({}, localeSettingsHandler)

export { localeSettings }
