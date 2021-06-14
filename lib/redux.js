import { createStore, applyMiddleware, compose } from 'redux'
import { rootReducer } from 'pltr/v2'
import undoable from 'redux-undo'
import firebaseSync from './middlewares/firebase-sync'
// import saver from '../middlewares/saver'
// import tracker from '../middlewares/tracker'
// import logger from '../middlewares/logger'
// import reporter from '../middlewares/reporter'

function configureStore(initialState) {
  const window = global.window
  const composeEnhancers = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
  const dataRepairers = {}
  const reducer = undoable(rootReducer(dataRepairers), { limit: 10, ignoreInitialState: true })

  const middlewares = applyMiddleware(firebaseSync) // (saver, tracker, logger, reporter)
  const enhancers =
    process.env.NODE_ENV === 'production' ? middlewares : composeEnhancers(middlewares)
  const store = createStore(reducer, initialState, enhancers)
  return store
}

const store = configureStore({})

export { store, configureStore }
