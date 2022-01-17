import { set } from 'lodash'

import { parseFromLocalStorage } from './parseFromLocalStorage'

export const storageForName = (name) => {
  return parseFromLocalStorage(name)
}

const setStorageForName = (name, newValue) => {
  window.localStorage.setItem(name, JSON.stringify(newValue))
}

const eventNameForStorageNamed = (name) => {
  return `${name}-storage-changed`
}

export const setValueForStorageNamed = (name) => (key, value) => {
  const event = new Event(eventNameForStorageNamed(name))
  event.paylaod = {
    key,
    value,
  }
  const store = storageForName(name)
  setStorageForName(name, set(store, key, value))
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
