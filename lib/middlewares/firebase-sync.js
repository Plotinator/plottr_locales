import { patch } from '../firebase'
import { isEqual } from 'lodash'
import { ARRAY_KEYS } from '../redux-array-keys'

const toFirestoreArray = (array) =>
  array.reduce((acc, value, index) => Object.assign(acc, { [index]: value }), {})

const firebaseSync = (store) => (next) => (action) => {
  const result = next(action)

  const fileId = store.getState().present.file.fileName
  if (fileId) {
    setTimeout(() => {
      const { present, past } = store.getState()
      const previous = past[0]
      Object.keys(present).forEach((key) => {
        if (!action.isPatching && action.type === 'FILE_LOADED') return
        if (!isEqual(previous[key], present[key])) {
          const payload =
            ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(present[key]) : present[key]
          patch(key, fileId, payload)
        }
      })
    }, 100)
  }

  return result
}

export default firebaseSync
