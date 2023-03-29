const i18n = require('format-message')

const locales = {
  en: require('./en.json'),
  zh: require('./zh.json'),
  de: require('./de.json'),
  el: require('./el.json'),
  es: require('./es.json'),
  fa: require('./fa.json'),
  fr: require('./fr.json'),
  hi: require('./hi.json'),
  it: require('./it.json'),
  pt: require('./pt.json'),
  ar: require('./ar.json'),
  ru: require('./ru.json'),
  flipped: require('./flipped.json'),
}

const localeNames = {
  en: 'English',
  zh: '中文',
  de: 'Deutsch',
  es: 'Español',
  el: 'Ελληνικά',
  fr: 'Français',
  hi: 'हिंदी',
  it: 'Italiana',
  pt: 'português',
  fa: 'فارسی',
  ru: 'русский язык',
  ar: 'العربية',
}

// The purpose of the flipped locale is to easily see if there are any strings
// in the ui that have not been wrapped in `i18n()`
if (process.env.NODE_ENV === 'dev') {
  localeNames.flipped = 'Flipped'
}

function setupI18n(settings, platform) {
  i18n.setup({
    translations: locales,
    locale: getCurrentLocale(settings, platform),
    missingTranslation: 'ignore',
    formats: {
      date: {
        monthDay: { month: 'short', day: 'numeric' },
      },
    },
  })
}

function getCurrentLocale(settings, platform) {
  const userSetLocale = settings ? settings.locale : null

  return userSetLocale || platform?.locale || 'en'
}

module.exports = {
  locales,
  localeNames,
  setupI18n,
  getCurrentLocale,
  t: i18n,
}
