import { configureStore } from './configureStore'
import { whenClientIsReady } from '../../../shared/socket-client'

let _store = null
let _inflightFirebaseRequests = null
const store = () => {
  if (!_store) {
    const configured = configureStore(whenClientIsReady)
    _store = configured.store
    _inflightFirebaseRequests = configured.inflightFirebaseRequests
  }
  return _store
}
const inflightFirebaseRequests = () => {
  if (!_store) {
    const configured = configureStore(whenClientIsReady)
    _store = configured.store
    _inflightFirebaseRequests = configured.inflightFirebaseRequests
  }
  return _inflightFirebaseRequests
}

export { store, inflightFirebaseRequests }
