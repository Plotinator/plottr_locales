import { configureStore } from './configureStore'
import { whenClientIsReady } from '../../../shared/socket-client'

const { store, inflightFirebaseRequests } = configureStore(whenClientIsReady)
export { store, inflightFirebaseRequests }
