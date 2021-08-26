export const localeSettings = {
  get: (key) => {
    switch (key) {
      case 'locale': {
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
