import { useState, useEffect } from 'react'
import { clone, set } from 'lodash'

import { safeParse } from './safeParse'
import { dispatchAndSet } from './dispatchAndSet'
import { parseFromLocalStorage } from './parseFromLocalStorage'
import {
  CUSTOM_TEMPLATES_KEY,
  KNOWN_FILES_KEY,
  LICENSE_INFO_KEY,
  SETTINGS_KEY,
  STARTER_TEMPLATES_KEY,
  TRIAL_INFO_KEY,
} from './storeKeys'
import { settings } from './settings'

const checkInterval = 1000 * 60 * 1 // every minute

export const useJsonStore = (store, storeName, checksOften) => {
  const [info, setInfo] = useState(store)
  const [size, setSize] = useState(Object.keys(store).length)
  useEffect(() => {
    if (window.localStorage.__proto__.setItem !== dispatchAndSet) {
      window.localStorage.__proto__._setItem = window.localStorage.__proto__.setItem
      window.localStorage.__proto__.setItem = dispatchAndSet
    }
    const onChange = (event) => {
      if (event.key === storeName) {
        const newVal = safeParse(event.value)
        setInfo(newVal)
        setSize(Object.keys(newVal).length)
      }
    }
    document.addEventListener('set-local-storage-item', onChange)

    return () => {
      document.removeEventListener('set-local-storage-item', onChange)
    }
  }, [])

  useEffect(() => {
    if (checksOften) {
      const timeout = setTimeout(() => {
        const newValue = safeParse(window.localStorage.getItem(storeName))
        setInfo(newValue)
        setSize(Object.keys(newValue).value)
      }, checkInterval)
      return () => clearTimeout(timeout)
    }

    return () => {}
  }, [])

  const saveInfoAtKey = (key, data) => {
    const newStore = clone(store)
    set(newStore, key, data)
    setInfo(newStore)
    setSize(Object.keys(newStore).length)
    if (storeName) {
      window.localStorage.setItem(storeName, JSON.stringify(newStore))
    } else {
      store.set(key, data)
    }
  }

  const saveAllInfo = (data) => {
    setInfo(data)
    setSize(Object.keys(data).length)
    if (storeName) {
      window.localStorage.setItem(storeName, JSON.stringify(data))
    } else {
      Object.entries(store).forEach(([key, value]) => {
        store.set(key, value)
      })
    }
  }

  return [info, size, saveInfoAtKey, saveAllInfo]
}

export const licenseInfoStore = () => {
  return parseFromLocalStorage(LICENSE_INFO_KEY)
}

export const useLicenseInfo = () => {
  return useJsonStore(licenseInfoStore(), LICENSE_INFO_KEY)
}

export function trialStore() {
  return parseFromLocalStorage(TRIAL_INFO_KEY)
}

export function useTrialInfo() {
  return useJsonStore(trialStore(), TRIAL_INFO_KEY)
}

export function useKnownFilesInfo() {
  return useJsonStore(parseFromLocalStorage(KNOWN_FILES_KEY), KNOWN_FILES_KEY, true)
}

export function useSettingsInfo() {
  return useJsonStore(settings)
}

export function useCustomTemplatesInfo() {
  return useJsonStore(parseFromLocalStorage(CUSTOM_TEMPLATES_KEY), CUSTOM_TEMPLATES_KEY, true)
}

export function useTemplatesInfo() {
  return useJsonStore(parseFromLocalStorage(STARTER_TEMPLATES_KEY), STARTER_TEMPLATES_KEY, true)
}
