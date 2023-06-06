import { identity } from 'lodash'

import { middlewares, ARRAY_KEYS, SYSTEM_REDUCER_ACTION_TYPES } from 'pltr/v2'
import { overwrite, toFirestoreArray } from 'wired-up-firebase'
import { selectors } from 'wired-up-pltr'

const FLAT_ARRAY_KEYS = ['cards', 'notes', 'places', 'characters']

const firebaseSync = (store) => (next) => (action) => {
  if (!action.type || SYSTEM_REDUCER_ACTION_TYPES.indexOf(action.type) !== -1) {
    return next(action)
  } else {
    const isCloudFile = selectors.isCloudFileSelector(store.getState())
    if (isCloudFile) {
      return middlewares.externalSync(identity)(overwrite, (key, data) => {
        return FLAT_ARRAY_KEYS.indexOf(key) === -1 && ARRAY_KEYS.indexOf(key) !== -1
          ? toFirestoreArray(data)
          : data
      })(store)(next)(action)
    }
    return next(action)
  }
}

export default firebaseSync
