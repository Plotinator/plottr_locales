import { configureStore } from './configureStore'
import { whenClientIsReady } from '../../../shared/socket-client'

let _store = null
const store = () => {
  if (!_store) {
    _store = configureStore(whenClientIsReady)
  }
  return _store
}
export { store }
