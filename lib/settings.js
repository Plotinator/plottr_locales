import { safeParse } from './safeParse'

const SETTINGS_KEY = 'SETTINGS'

const _settings = () => {
  return safeParse(window.localStorage.getItem(SETTINGS_KEY))
}

export const settings = {
  get: (key) => {
    return _settings()[key]
  },
  set: (key, value) => {
    const currentSettings = _settings()
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...currentSettings,
        [key]: value,
      })
    )
  },
}
