import { middlewares, ARRAY_KEYS } from 'pltr/v2'
import { selectPresentState } from 'wired-up-pltr'
import { overwrite, toFirestoreArray } from 'wired-up-firebase'

const firebaseSync = (store) => (next) => (action) => {
  const file = store.getState().present && store.getState().present.file
  const isCloudFile = file && file.isCloudFile
  if (isCloudFile) {
    return middlewares.externalSync(selectPresentState)(overwrite, (key, data) => {
      return ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(data) : data
    })(store)(next)(action)
  }
  return next(action)
}

export default firebaseSync
