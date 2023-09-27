import { middlewares, ARRAY_KEYS, SYSTEM_REDUCER_ACTION_TYPES } from 'pltr/v2'
import { overwrite, deleteSingle, toFirestoreArray } from 'wired-up-firebase'
import { selectors, selectPresentState } from 'wired-up-pltr'

const FLAT_ARRAY_KEYS = ['cards', 'notes', 'places', 'characters']

const externalSync = middlewares.externalSync(selectPresentState)

const FIREBASE_REQUEST_TIMEOUT = 30000

const firebaseSync = (logger) => {
  const inflightRequests = {
    counter: 0,
  }

  const overwritePreventingDefault = (...args) => {
    inflightRequests.counter++
    const timeout = setTimeout(() => {
      inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
      if (typeof logger?.error === 'function') {
        logger.error('Request to overwrite a document in firebase timed out', ...args)
      }
    }, FIREBASE_REQUEST_TIMEOUT)
    return overwrite(...args).finally(() => {
      clearTimeout(timeout)
      inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
    })
  }

  const deleteSinglePreventingDefault = (...args) => {
    inflightRequests.counter++
    const timeout = setTimeout(() => {
      inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
      if (typeof logger?.error === 'function') {
        logger.error('Request to delete a document in firebase timed out', ...args)
      }
    }, FIREBASE_REQUEST_TIMEOUT)
    return deleteSingle(...args).finally(() => {
      clearTimeout(timeout)
      inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
    })
  }

  return {
    inflightRequests,
    firebaseMiddleware: (store) => (next) => (action) => {
      if (!action.type || SYSTEM_REDUCER_ACTION_TYPES.indexOf(action.type) !== -1) {
        return next(action)
      } else {
        const isCloudFile = selectors.isCloudFileSelector(store.getState())
        if (isCloudFile) {
          return externalSync(
            overwritePreventingDefault,
            deleteSinglePreventingDefault,
            (key, data) => {
              return FLAT_ARRAY_KEYS.indexOf(key) === -1 && ARRAY_KEYS.indexOf(key) !== -1
                ? toFirestoreArray(data)
                : data
            }
          )(store)(next)(action)
        } else {
          return next(action)
        }
      }
    },
  }
}

export default firebaseSync
