import { middlewares, ARRAY_KEYS, SYSTEM_REDUCER_ACTION_TYPES } from 'pltr/v2'
import { overwrite, deleteSingle, toFirestoreArray } from 'wired-up-firebase'
import { selectors, selectPresentState } from 'wired-up-pltr'

const FLAT_ARRAY_KEYS = ['cards', 'notes', 'places', 'characters']

const externalSync = middlewares.externalSync(selectPresentState)

const firebaseSync = (store) => (next) => (action) => {
  if (!action.type || SYSTEM_REDUCER_ACTION_TYPES.indexOf(action.type) !== -1) {
    return next(action)
  } else {
    const isCloudFile = selectors.isCloudFileSelector(store.getState())
    if (isCloudFile) {
      return externalSync(overwrite, deleteSingle, (key, data) => {
        return FLAT_ARRAY_KEYS.indexOf(key) === -1 && ARRAY_KEYS.indexOf(key) !== -1
          ? toFirestoreArray(data)
          : data
      })(store)(next)(action)
    } else {
      return next(action)
    }
  }
}

export default firebaseSync
