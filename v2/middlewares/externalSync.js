import { permissionError } from '../actions/error'
import { SYSTEM_REDUCER_KEYS } from '../reducers/systemReducers'
import selectors from '../selectors'
import actions from '../actions'

const FLAT_ARRAY_KEYS = ['cards', 'notes', 'places', 'characters']

const isFlatArrayKey = (key) => {
  return FLAT_ARRAY_KEYS.indexOf(key) !== -1
}

const withOrderingPrecedence = (fileKeys) => {
  return [
    'attributes',
    ...fileKeys.filter((key) => {
      return key !== 'attributes'
    })
  ]
}

// Synchronise with Firebase.  We know to sync if there's a difference
// between the previous value and the current value.  Synchronise
// Redux key by key in a subset of keys that are appropriate for
// Firebase.  Produce true if we actually synchronised.
const sync = (selectState) => {
  const {
    fileIdSelector,
    clientIdSelector,
    isCloudFileSelector,
    isOfflineSelector,
    isResumingSelector,
    selectedFileIdSelector,
    selectedFilePermissionSelector,
    fullFileStateSelector,
    clientIdForPathSelector
  } = selectors(selectState)
  return (previous, present, patch, withData, store, action, updatedPaths) => {
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
      const path = updatedPaths[i]
      const key = path[0]
      const payload = withData(key, state[key])
      if (isFlatArrayKey(key)) {
        const index = path[1]
        const oldEntity = previous[key][index]
        const entity = state[key][index]
        patch(key, fileId, entity, clientId).catch((error) => {
          if (error.code === 'permission-denied') {
            store.dispatch(permissionError(key, action, error.code))
          }
        })
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

const updateLastWrittenClientIds = (previous, state, store, wiredSelectors, wiredActions) => {
  const { clientIdSelector, fullFileStateSelector, selectedFilePermissionSelector } = wiredSelectors

  const fullState = fullFileStateSelector(state)
  const clientId = clientIdSelector(state)
  const userPermission = selectedFilePermissionSelector(state)

  // Go through each key and potentially do something if they changed.
  //
  // Note that we were the ones who changed it.
  //
  // Only call this function when we're not patching (i.e. receiving
  // changes from remote.)
  const paths = []
  const resultPaths = []
  const fullStateKeys = Object.keys(fullState)
  for (let i = 0; i < fullStateKeys.length; ++i) {
    const key = fullStateKeys[i]
    const isFileAndHasntGotPermission = key === 'file' && userPermission !== 'owner'
    if (SYSTEM_REDUCER_KEYS.indexOf(key) === -1 && !isFileAndHasntGotPermission) {
      if (isFlatArrayKey(key) && Array.isArray(fullState[key]) && fullState[key] !== previous[key]) {
        for (let index = 0; index < fullState[key].length; ++index) {
          if (!Object.is(fullState[key][index], previous[key][index])) {
            paths.push(`${key}/${index}`)
            resultPaths.push([key, index])
          }
        }
      } else {
        if (fullState[key] !== previous[key]) {
          paths.push(key)
          resultPaths.push([key])
        }
      }
    }
  }
  store.dispatch(wiredActions.client.recordDataClientIds(paths, clientId))

  return resultPaths
}

const externalSync = (selectState) => {
  const wiredSync = sync(selectState)
  const wiredSelectors = selectors(selectState)
  const wiredActions = actions(selectState)
  return (patch, withData) => (store) => (next) => (action) => {
    const result = next(action)

    // Update last written client ids when we didn't receive a patch
    // from Firebase.  Helps us figure out who changed data so we
    // don't get into a sync loop.
    if (!action.patching) {
      // IMPORTANT: we need the past state prior to meddling with
      // client ids.
      const { past, future } = store.getState()
      const previous = action.type === '@@redux-undo/UNDO' ? future[0] : past[past.length - 1]

      const updatedPaths = updateLastWrittenClientIds(
        previous,
        store.getState().present,
        store,
        wiredSelectors,
        wiredActions
      )

      // IMPORTANT: we need the state *after* handling data client ids
      // so that we know what to sync!
      const { present } = store.getState()

      wiredSync(previous, present, patch, withData, store, action, updatedPaths)
    }

    return result
  }
}

export default externalSync

// NOTE: uses a polyfilled map that's based on the JavaScript objects
// rather than on the Map class in newer versions of Javascript.  we
// use this for React-Native because it seems to support it poorly.
let previous = null
export const externalSyncWithoutHistory = (selectState) => {
  const wiredSync = sync(selectState)
  const wiredSelectors = selectors(selectState)
  const wiredActions = actions(selectState)
  const { fullFileStateSelector } = selectors(selectState)
  return (patch, withData) => (store) => (next) => (action) => {
    const result = next(action)

    // Update last written client ids when we didn't receive a patch
    // from Firebase.  Helps us figure out who changed data so we
    // don't get into a sync loop.
    if (!action.patching) {
      if (previous) {
        const updatedPaths = updateLastWrittenClientIds(
          previous,
          store.getState(),
          store,
          wiredSelectors,
          wiredActions
        )
        const present = store.getState()
        const synchronised = wiredSync(
          previous,
          present,
          patch,
          withData,
          store,
          action,
          updatedPaths
        )
        if (synchronised || !previous) {
          previous = fullFileStateSelector(present)
        }
      } else if (!previous) {
        const present = store.getState()
        previous = fullFileStateSelector(present)
      }
    }

    return result
  }
}
