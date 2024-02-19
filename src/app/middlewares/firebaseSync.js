import { middlewares, ARRAY_KEYS, SYSTEM_REDUCER_ACTION_TYPES } from 'pltr/v2'
import { overwrite, deleteSingle, toFirestoreArray } from 'wired-up-firebase'
import { selectors, selectPresentState } from 'wired-up-pltr'
import { makeMainProcessClient } from '../mainProcessClient'

const FLAT_ARRAY_KEYS = ['cards', 'notes', 'places', 'characters']

const externalSync = middlewares.externalSync(selectPresentState)

const FIREBASE_REQUEST_TIMEOUT = 30000

const { markProjectAsSaved, markProjectAsUnsaved } = makeMainProcessClient()

const firebaseSync = (logger) => {
  const inflightRequests = {
    counter: 0,
    lastRequestFailed: false,
  }

  const overwritePreventingDefault = (...args) => {
    inflightRequests.counter++
    if (inflightRequests.counter === 1) {
      markProjectAsUnsaved()
    }
    const timeout = setTimeout(() => {
      inflightRequests.lastRequestFailed = true
      inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
      if (typeof logger?.warn === 'function') {
        logger.warn('Request to overwrite a document in firebase timed out')
      }
    }, FIREBASE_REQUEST_TIMEOUT)
    return overwrite(...args)
      .then(() => {
        inflightRequests.lastRequestFailed = false
      })
      .catch((error) => {
        if (typeof logger?.error === 'function') {
          logger.error('Failed to write to Firebase', error)
        }
        inflightRequests.lastRequestFailed = true
      })
      .finally(() => {
        clearTimeout(timeout)
        inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
        if (inflightRequests.counter === 0 && !inflightRequests.lastRequestFailed) {
          markProjectAsSaved()
        }
      })
  }

  const deleteSinglePreventingDefault = (...args) => {
    inflightRequests.counter++
    const timeout = setTimeout(() => {
      inflightRequests.lastRequestFailed = true
      inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
      if (typeof logger?.warn === 'function') {
        logger.warn('Request to delete a document in firebase timed out')
      }
    }, FIREBASE_REQUEST_TIMEOUT)
    return deleteSingle(...args)
      .then(() => {
        inflightRequests.lastRequestFailed = false
      })
      .catch((error) => {
        if (typeof logger?.error === 'function') {
          logger.error('Failed to delete from Firebase', error)
        }
        inflightRequests.lastRequestFailed = true
      })
      .finally(() => {
        clearTimeout(timeout)
        inflightRequests.counter = Math.max(0, inflightRequests.counter - 1)
        if (inflightRequests.counter === 0 && !inflightRequests.lastRequestFailed) {
          markProjectAsSaved()
        }
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
