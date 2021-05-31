import { createStore, applyMiddleware, compose } from 'redux'
import { rootReducer } from 'pltr/v2'
import undoable from 'redux-undo'
// import saver from '../middlewares/saver'
// import tracker from '../middlewares/tracker'
// import logger from '../middlewares/logger'
// import reporter from '../middlewares/reporter'

import goldilocks from '../lib/goldilocks.json'

function configureStore(initialState) {
  const window = global.window
  const composeEnhancers = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
  const reducer = undoable(rootReducer, { limit: 10, ignoreInitialState: true })

  const middlewares = applyMiddleware() // (saver, tracker, logger, reporter)
  const enhancers =
    process.env.NODE_ENV === 'production' ? middlewares : composeEnhancers(middlewares)
  const store = createStore(reducer, initialState, enhancers)
  return store
}

const store = configureStore(goldilocks)

export { store, configureStore }
