import { useState, useEffect } from 'react'
import { safeParse } from './safeParse'
import { dispatchAndSet } from './dispatchAndSet'
import { parseFromLocalStorage } from './parseFromLocalStorage'
import { TRIAL_INFO_KEY } from './storeKeys'

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
    const newStore = {
      ...store,
      [key]: data,
    }
    setInfo(newStore)
    setSize(Object.keys(newStore).length)
    window.localStorage.setItem(storeName, JSON.stringify(newStore))
  }

  const saveAllInfo = (data) => {
    setInfo(data)
    setSize(Object.keys(data).length)
    window.localStorage.setItem(storeName, JSON.stringify(data))
  }

  return [info, size, saveInfoAtKey, saveAllInfo]
}

export const useLicenseInfo = () => {
  // TODO
  return [null, 0]
}

export function useTrialInfo() {
  return useJsonStore(parseFromLocalStorage(TRIAL_INFO_KEY), TRIAL_INFO_KEY)
}
