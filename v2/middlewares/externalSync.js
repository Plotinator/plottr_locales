import { permissionError } from '../actions/error'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'
import selectors from '../selectors'

const FLAT_ARRAY_KEYS = ['cards', 'notes', 'places', 'characters']

export const isFlatArrayKey = (key) => {
  return FLAT_ARRAY_KEYS.indexOf(key) !== -1
}

const ADDED = 'ADDED'
const UPDATED = 'UPDATED'
const DELETED = 'DELETED'

// Synchronise with Firebase.  We know to sync if there's a difference
// between the previous value and the current value.  Synchronise
// Redux key by key in a subset of keys that are appropriate for
// Firebase.  Produce true if we actually synchronised.
export const sync = (selectState) => {
  const {
    fileIdSelector,
    clientIdSelector,
    isCloudFileSelector,
    isOfflineSelector,
    isResumingSelector,
    selectedFileIdSelector,
    selectedFilePermissionSelector,
    fullFileStateSelector,
  } = selectors(selectState)
  return (previous, present, patch, deleteSingle, withData, store, action, updatedPaths) => {
    const isCloudFile = isCloudFileSelector(present)
    const isOffline = isOfflineSelector(present)
    const isResuming = isResumingSelector(present)
    const fileId = fileIdSelector(present)
    const clientId = clientIdSelector(present)
    const selectedFileId = selectedFileIdSelector(present)
    const userPermission = selectedFilePermissionSelector(present)
    const notPermittedToChangeFile = userPermission !== 'owner' && userPermission !== 'collaborator'
    if (
      // We might not be allowed to change the file.
      notPermittedToChangeFile ||
      // We might've just loaded the file.
      action.type === 'FILE_LOADED' ||
      // Some actions that aren't appropriate
      action.type === 'RECORD_LAST_ACTION' ||
      action.type === 'PERMISSION_ERROR' ||
      action.type === 'CLEAR_ERROR' ||
      // On the initial read from Firebase, we mark that we're patching
      // the store until it's ready for use by the user.
      action.patching ||
      // We might not have an appropriate file loaded.
      !isCloudFile ||
      isOffline ||
      isResuming ||
      !fileId ||
      !clientId ||
      selectedFileId !== fileId
    ) {
      return false
    }

    // It's possible that nothing that we can compare to happened yet.
    if (!previous) return false

    const state = fullFileStateSelector(present)
    for (let i = 0; i < updatedPaths.length; ++i) {
      const { path, change, index } = updatedPaths[i]
      const key = path[0]
      const payload = withData(key, state[key])
      if (isFlatArrayKey(key)) {
        const entity = state[key][index] || null
        if (change === DELETED) {
          const id = path[1]
          deleteSingle(key, fileId, entity, clientId, id).catch((error) => {
            if (error.code === 'permission-denied') {
              store.dispatch(permissionError(key, action, error.code))
            }
          })
        } else {
          patch(key, fileId, entity, clientId, entity.id).catch((error) => {
            if (error.code === 'permission-denied') {
              store.dispatch(permissionError(key, action, error.code))
            }
          })
        }
      } else {
        patch(key, fileId, payload, clientId).catch((error) => {
          if (error.code === 'permission-denied') {
            store.dispatch(permissionError(key, action, error.code))
          }
        })
      }
    }

    return true
  }
}

export const computeNewPaths = (previous, state, wiredSelectors) => {
  const { fullFileStateSelector, selectedFilePermissionSelector } = wiredSelectors

  const fullState = fullFileStateSelector(state)
  const userPermission = selectedFilePermissionSelector(state)

  const resultPaths = []
  const fullStateKeys = Object.keys(fullState)
  for (let i = 0; i < fullStateKeys.length; ++i) {
    const key = fullStateKeys[i]
    const isFileAndHasntGotPermission = key === 'file' && userPermission !== 'owner'
    if (SYSTEM_REDUCER_KEYS.indexOf(key) === -1 && !isFileAndHasntGotPermission) {
      if (isFlatArrayKey(key)) {
        const here = new Set()
        for (let index = 0; index < fullState[key].length; ++index) {
          const entity = fullState[key][index]
          here.add(entity.id)
          const previousEntity = previous[key].get(entity.id)
          if (!previousEntity) {
            resultPaths.push({ path: [key, entity.id], change: ADDED, index })
          } else if (!Object.is(entity, previousEntity)) {
            resultPaths.push({ path: [key, entity.id], change: UPDATED, index })
          }
        }
        for (const previousId of previous[key].keys()) {
          if (!here.has(previousId)) {
            resultPaths.push({ path: [key, previousId], change: DELETED, index: null })
          }
        }
      } else {
        if (fullState[key] !== previous[key]) {
          resultPaths.push({ path: [key], change: UPDATED, index: null })
        }
      }
    }
  }
  return resultPaths
}

export function keyFlatArraysById(state) {
  const keyedById = (array) => {
    const byId = new Map()
    for (const element of array) {
      byId.set(element.id, element)
    }
    return byId
  }

  return Object.entries(state).reduce((acc, next) => {
    const [key, value] = next
    if (isFlatArrayKey(key)) {
      return {
        ...acc,
        [key]: keyedById(value),
      }
    } else {
      return {
        ...acc,
        [key]: value,
      }
    }
  }, {})
}

export function updatePrevious(previous, updatedPaths, state) {
  for (const updatedPath of updatedPaths) {
    const { path, change, index } = updatedPath
    const [key, id] = path
    if (isFlatArrayKey(key)) {
      if (change === UPDATED && index !== null) {
        const currentEntity = state[key][index]
        if (currentEntity) {
          previous[key].set(id, currentEntity)
        }
      } else if (change === ADDED) {
        const currentEntity = state[key][index]
        if (currentEntity) {
          previous[key].set(id, currentEntity)
        }
      } else {
        previous[key].delete(id)
      }
    } else {
      previous[key] = state[key]
    }
  }
}

const externalSync = (selectState) => {
  // Note: we mutate previous in-place each time there's a change.
  let previous = null
  const wiredSync = sync(selectState)
  const wiredSelectors = selectors(selectState)
  const { fullFileStateSelector } = selectors(selectState)
  return (patch, deleteSingle, withData) => (store) => (next) => (action) => {
    if (previous === null) {
      previous = keyFlatArraysById(fullFileStateSelector(store.getState()))
    } else {
      const fileChanged = previous?.file?.id !== fullFileStateSelector(store.getState())?.file?.id
      if (fileChanged) {
        previous = keyFlatArraysById(fullFileStateSelector(store.getState()))
      }
    }

    const result = next(action)

    const present = store.getState()
    const updatedPaths = computeNewPaths(previous, present, wiredSelectors)
    // If we're patching in data from remote, then we need to update
    // our record of the previous state to equal what the server
    // said so that we don't echo it back in an infinite loop.
    if (action.patching) {
      updatePrevious(previous, updatedPaths, fullFileStateSelector(present))
    } else {
      const synchronised = wiredSync(
        previous,
        present,
        patch,
        deleteSingle,
        withData,
        store,
        action,
        updatedPaths
      )
      if (synchronised) {
        updatePrevious(previous, updatedPaths, fullFileStateSelector(present))
      }
    }

    return result
  }
}

export default externalSync

export const externalSyncWithoutHistory = externalSync
