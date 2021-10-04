import { useState, useEffect } from 'react'
import { clone, set, isEqual } from 'lodash'

import { safeParse } from './safeParse'
import { dispatchAndSet } from './dispatchAndSet'
import { parseFromLocalStorage } from './parseFromLocalStorage'
import { KNOWN_FILES_KEY, LICENSE_INFO_KEY, SETTINGS_KEY, TRIAL_INFO_KEY } from './storeKeys'
import { settings } from './settings'
import { allCustomTemplates, allTemplates } from './templates'

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

export function useKnownFilesInfo(initialFileList) {
  const [fileList, setFileList] = useState(initialFileList)
  const [filesByPosition, setFilesByPosition] = useState({})

  useEffect(() => {
    const filesByPosition = {}
    const receivedNewFileList = !isEqual(fileList, initialFileList)
    if (receivedNewFileList) {
      setFileList(initialFileList)
    }
    const currentFileList = receivedNewFileList ? initialFileList : fileList
    currentFileList.forEach((file, index) => {
      filesByPosition[index + 1] = file
    })
    const renameListener = document.addEventListener('rename-file-to-new-name', (event) => {
      const fileId = event.fileId
      const newName = event.newName
      const newFileList = currentFileList.map((file) => {
        if (file.id === fileId) {
          return {
            ...file,
            fileName: newName,
          }
        }
        return file
      })
      const newFilesByPosition = {}
      newFileList.forEach((file, index) => {
        newFilesByPosition[index + 1] = file
      })
      setFileList(newFileList)
      setFilesByPosition(newFilesByPosition)
    })
    setFilesByPosition(filesByPosition)
    return () => {
      document.removeEventListener('rename-file-to-new-name', renameListener)
    }
  }, [initialFileList])

  const nop = () => {}
  return [filesByPosition, fileList.length, nop, nop]
}

export function useSettingsInfo() {
  return useJsonStore(settings)
}

const indexById = (array) => {
  const indexed = {}
  array.forEach((x) => (indexed[x.id] = x))
  return indexed
}

export function useCustomTemplatesInfo() {
  const [templates, setTemplates] = useState(indexById(allCustomTemplates()))

  useEffect(() => {
    const deleteTemplateListener = document.addEventListener('delete-template', () => {
      setTemplates(indexById(allCustomTemplates()))
    })
    const editTemplateListener = document.addEventListener('edit-template', () => {
      setTemplates(indexById(allCustomTemplates()))
    })
    const saveTemplateListener = document.addEventListener('save-template', () => {
      setTemplates(indexById(allCustomTemplates()))
    })
    return () => {
      document.removeEventListener('delete-template', deleteTemplateListener)
      document.removeEventListener('edit-template', editTemplateListener)
      document.removeEventListener('save-template', saveTemplateListener)
    }
  }, [])

  const nop = () => {}
  return [templates, templates.size, nop, nop]
}

export function useTemplatesInfo() {
  const [templates, _setTemplates] = useState(indexById(allTemplates()))
  const nop = () => {}
  return [templates, templates.size, nop, nop]
}
