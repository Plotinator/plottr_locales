import { patch } from '../firebase'
import { isEqual } from 'lodash'
import { ARRAY_KEYS } from '../redux-array-keys'

import { actions } from 'pltr/v2'

const {
  error: { permissionError },
} = actions

const toFirestoreArray = (array) =>
  array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

const firebaseSync = (store) => (next) => (action) => {
  const result = next(action)

  const fileId = store.getState().present.file.fileName
  if (fileId) {
    const { present, past } = store.getState()
    const previous = past[past.length - 1]
    Object.keys(present).forEach((key) => {
      if (
        action.type === 'PERMISSION_ERROR' ||
        action.type === 'CLEAR_ERROR' ||
        key === 'error' ||
        key === 'permission' ||
        key === 'ui'
      )
        return
      if (action.patching || action.type === 'FILE_LOADED') return
      if (!isEqual(previous[key], present[key])) {
        const payload =
          ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(present[key]) : present[key]
        patch(key, fileId, payload).catch((error) => {
          if (error.code === 'permission-denied') {
            store.dispatch(permissionError(key, action, error.code))
          }
        })
      }
    })
  }

  return result
}

export default firebaseSync
