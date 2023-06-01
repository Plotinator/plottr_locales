import { identity } from 'lodash'

import { middlewares, ARRAY_KEYS } from 'pltr/v2'
import { syncOverwrite, toFirestoreArray } from 'wired-up-firebase'
import { selectors } from 'wired-up-pltr'

const firebaseSync = (store) => (next) => (action) => {
  const isCloudFile = selectors.isCloudFileSelector(store.getState())
  if (isCloudFile) {
    return middlewares.externalSync(identity)(syncOverwrite, (key, data) => {
      return key !== 'cards' && ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(data) : data
    })(store)(next)(action)
  }
  return next(action)
}

export default firebaseSync
