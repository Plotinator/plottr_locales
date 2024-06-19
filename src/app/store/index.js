import { configureStore } from './configureStore'

let _store = null
let _inflightFirebaseRequests = null
let _localClient = null
const store = () => {
  if (!_store) {
    const configured = configureStore(_localClient)
    _store = configured.store
    _inflightFirebaseRequests = configured.inflightFirebaseRequests
  }
  return _store
}

const inflightFirebaseRequests = () => {
  if (!_store) {
    const configured = configureStore(_localClient)
    _store = configured.store
    _inflightFirebaseRequests = configured.inflightFirebaseRequests
  }
  return _inflightFirebaseRequests
}

const initialiseStore = (localClient) => {
  _localClient = localClient
  store()
}

export { store, inflightFirebaseRequests, initialiseStore }
