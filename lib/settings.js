import { set } from 'lodash'

import defaultSettings from './defaultSettings'
import { safeParse } from './safeParse'
import { SETTINGS_KEY } from './storeKeys'

const _settings = () => {
  if (typeof window === 'undefined') return defaultSettings
  return safeParse(window.localStorage.getItem(SETTINGS_KEY), defaultSettings)
}

const settingsHandler = {
  get: (object, key) => {
    return _settings()[key]
  },
  set: (object, key, value) => {
    const currentSettings = _settings()
    set(currentSettings, key, value)
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings))
  },
}

const settings = new Proxy({}, settingsHandler)

export { settings }
