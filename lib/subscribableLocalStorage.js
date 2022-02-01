import { set } from 'lodash'

import { parseFromLocalStorage } from './parseFromLocalStorage'

export const storageForName = (name) => {
  return parseFromLocalStorage(name)
}

const setStorageForName = (name, newValue) => {
  window.localStorage.setItem(name, JSON.stringify(newValue))
}

export const ensureStorageForNameExists = (name, defaultValue = {}) => {
  const currentStorage = storageForName(name)
  let updated = false
  Object.keys(defaultValue).forEach((key) => {
    if (currentStorage[key] === undefined) {
      currentStorage[key] = defaultValue[key]
      updated = true
    }
  })
  if (updated) {
    setStorageForName(name, currentStorage)
  }
}

const eventNameForStorageNamed = (name) => {
  return `${name}-storage-changed`
}

export const setValueForStorageNamed = (name) => (key, value) => {
  const event = new Event(eventNameForStorageNamed(name))
  const store = storageForName(name)
  const newStore = set(store, key, value)
  event.payload = newStore

  setStorageForName(name, newStore)
  document.dispatchEvent(event)
}

export const getValueForStorageNamed = (name) => (key) => {
  return storageForName(name)[key]
}

export const subscribeToStorageNamed = (name, callback) => {
  const listener = (event) => {
    callback(event.payload)
  }
  document.addEventListener(eventNameForStorageNamed(name), listener)
  return () => {
    document.removeEventListener(eventNameForStorageNamed(name), listener)
  }
}
