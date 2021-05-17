import { createStore, applyMiddleware, compose } from 'redux'
import { createWrapper, HYDRATE } from 'next-redux-wrapper'
import { rootReducer } from 'pltr/v2'
import undoable from 'redux-undo'
// import saver from '../middlewares/saver'
// import tracker from '../middlewares/tracker'
// import logger from '../middlewares/logger'
// import reporter from '../middlewares/reporter'

const nextReducer = (state = { tick: 'init' }, action) => {
  switch (action.type) {
    // TODO: merge all the state "properly"
    case HYDRATE:
      return { ...state, ...action.payload }
    case 'TICK':
      return { ...state, tick: action.payload }
    default:
      return rootReducer(state, action)
  }
}

function configureStore(context) {
  const window = global.window
  const composeEnhancers = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
  const reducer = undoable(nextReducer, { limit: 10, ignoreInitialState: true })
  const middlewares = applyMiddleware() // (saver, tracker, logger, reporter)
  const enhancers =
    process.env.NODE_ENV === 'production' ? middlewares : composeEnhancers(middlewares)
  const store = createStore(reducer, undefined, enhancers)
  return store
}

const wrapper = createWrapper(configureStore, { debug: true })
export { wrapper }
