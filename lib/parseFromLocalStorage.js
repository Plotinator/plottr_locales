import { safeParse } from './safeParse'

export const parseFromLocalStorage = (key, defaultValue = {}) => {
  return safeParse(window.localStorage.getItem(key), defaultValue)
}
