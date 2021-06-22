export const localeSettings = {
  get: (key) => {
    switch (key) {
      case 'locale':
        return 'en'
      default:
        return undefined
    }
  },
}
