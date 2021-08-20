import { middlewares, ARRAY_KEYS } from 'pltr/v2'
import { patch, toFirestoreArray } from 'plottr_firebase'

const firebaseSync = (store) => (next) => (action) => {
  return middlewares.externalSync(patch, (key, data) => {
    return ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(data) : data
  })(store)(next)(action)
}

export default firebaseSync
