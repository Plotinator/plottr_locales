import { useState, useEffect } from 'react'
import { merge } from 'lodash'
import export_config from './exporter/default_config'

const checkInterval = 1000 * 60 * 1 // every minute

const CONFIG_STORE_KEY = 'EXPORT_CONFIG'

const safeParse = (string, defaultStore = null) => {
  try {
    return JSON.parse(string)
  } catch (error) {
    console.error(`Error parsing ${string} from JSON`, error)
    return defaultStore
  }
}

const parseFromLocalStorage = () => {
  safeParse(window.localStorage.getItem('EXPORT_CONFIG'), export_config)
}

const store = () => merge(export_config, parseFromLocalStorage())

const dispatchAndSet = (key, value) => {
  const setItemEvent = new Event('set-local-storage-item')
  setItemEvent.key = key
  setItemEvent.value = value
  document.dispatchEvent(setItemEvent)
  window.localStorage.setItem(key, value)
}

const useJsonStore = (store, reloadsOnIPC, checksOften) => {
  const [info, setInfo] = useState(store)
  const [size, setSize] = useState(Object.keys(store).length)
  useEffect(() => {
    if (window.localStorage.setItem !== dispatchAndSet) {
      window.localStorage.setItem = dispatchAndSet
    }
    const onChange = (event) => {
      if (event.key === CONFIG_STORE_KEY) {
        const newVal = store()
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
        const newValue = store()
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
    window.localStorage.setItem(CONFIG_STORE_KEY, JSON.stringify(newStore))
  }

  const saveAllInfo = (data) => {
    console.warn('saveAllInfo is a no-op for browsers.')
  }

  return [info, size, saveInfoAtKey, saveAllInfo]
}

export function useExportConfigInfo() {
  return useJsonStore(store())
}
