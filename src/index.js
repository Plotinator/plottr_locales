const i18n = require('format-message')

/**
 * @typedef {keyof typeof localeNames} Locale
 */

const locales = {
  // @ts-ignore
  en: require('./en.json'),
  // @ts-ignore
  zh: require('./zh.json'),
  // @ts-ignore
  de: require('./de.json'),
  // @ts-ignore
  el: require('./el.json'),
  // @ts-ignore
  es: require('./es.json'),
  // @ts-ignore
  fa: require('./fa.json'),
  // @ts-ignore
  fr: require('./fr.json'),
  // @ts-ignore
  hi: require('./hi.json'),
  // @ts-ignore
  it: require('./it.json'),
  // @ts-ignore
  pt: require('./pt.json'),
  // @ts-ignore
  ar: require('./ar.json'),
  // @ts-ignore
  ru: require('./ru.json'),
  // @ts-ignore
  se: require('./se.json'),
  // @ts-ignore
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
  se: 'Svenska',
}

// The purpose of the flipped locale is to easily see if there are any strings
// in the ui that have not been wrapped in `i18n()`
if (process.env.NODE_ENV === 'dev') {
  localeNames.flipped = 'Flipped'
}

/**
 * @typedef HasLocale
 * @property {Locale} locale
 */

/**
 * @typedef MightHaveLocale
 * @property {Locale | Null} locale
 */

/**
 * @param {MightHaveLocale} settings
 * @param {HasLocale} platform
 */
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

/**
 * @param {MightHaveLocale} settings
 * @param {HasLocale} platform
 * @return {String}
 */
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
