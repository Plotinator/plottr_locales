import { configureStore } from './configureStore'

let _store = null
let _inflightFirebaseRequests = null
const store = () => {
  if (!_store) {
    const configured = configureStore()
    _store = configured.store
    _inflightFirebaseRequests = configured.inflightFirebaseRequests
  }
  return _store
}

const inflightFirebaseRequests = () => {
  if (!_store) {
    const configured = configureStore()
    _store = configured.store
    _inflightFirebaseRequests = configured.inflightFirebaseRequests
  }
  return _inflightFirebaseRequests
}

const initialiseStore = () => {
  store()
}

export { store, inflightFirebaseRequests, initialiseStore }
