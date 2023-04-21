import { isEqual } from 'lodash'

import { permissionError } from '../actions/error'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'
import selectors from '../selectors'

// Synchronise with Firebase.  We know to sync if there's a difference
// between the previous value and the current value.  Synchronise
// Redux key by key in a subset of keys that are appropriate for
// Firebase.  Produce true if we actually synchronised.
const sync = (selectState) => (previous, present, patch, withData, store, action) => {
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
  Object.keys(state).forEach((key) => {
    // Keys we don't sync
    if (SYSTEM_REDUCER_KEYS.indexOf(key) > -1) return
    // Also don't sync file record changes unless we're the owner
    if (key === 'file' && userPermission !== 'owner') {
      return
    }
    if (!isEqual(previous[key], state[key])) {
      const payload = withData(key, state[key])
      patch(key, fileId, payload, clientId).catch((error) => {
        if (error.code === 'permission-denied') {
          store.dispatch(permissionError(key, action, error.code))
        }
      })
    }
  })

  return true
}

const externalSync = (selectState) => {
  const wiredSync = sync(selectState)
  return (patch, withData) => (store) => (next) => (action) => {
    const result = next(action)

    const { future, present, past } = store.getState()
    const previous = action.type === '@@redux-undo/UNDO' ? future[0] : past[past.length - 1]
    wiredSync(previous, present, patch, withData, store, action)

    return result
  }
}

export default externalSync

let previous = null
export const externalSyncWithoutHistory = (selectState) => {
  const wiredSync = sync(selectState)
  const { fullFileStateSelector } = selectors(selectState)
  return (patch, withData) => (store) => (next) => (action) => {
    const result = next(action)
    const present = store.getState()

    const synchronised = wiredSync(previous, present, patch, withData, store, action)
    if (synchronised || !previous) {
      previous = fullFileStateSelector(present)
    }

    return result
  }
}
