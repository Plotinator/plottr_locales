import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import { rootReducer } from 'pltr/v2'

import tracker from '../middlewares/tracker'
import logger from '../middlewares/logger'
import reporter from '../middlewares/reporter'
import firebaseSync from '../middlewares/firebaseSync'
import shadow from '../middlewares/shadow'
import dataRepairers from './dataRepairers'
import log from '../../../shared/logger'

export function configureStore(whenClientIsReady, initialState) {
  const reducer = rootReducer(dataRepairers)
  const middlewareWithInflightRequestTracker = firebaseSync(log)
  const middlewares = applyMiddleware(
    thunk,
    middlewareWithInflightRequestTracker.firebaseMiddleware,
    tracker(whenClientIsReady),
    logger,
    reporter,
    shadow
  )
  const store = createStore(reducer, initialState, middlewares)
  return { store, inflightFirebaseRequests: middlewareWithInflightRequestTracker.inflightRequests }
}
