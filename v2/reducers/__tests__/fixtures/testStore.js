import thunk from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'

import rootReducer from '../../root'

export function configureStore(whenClientIsReady, initialState) {
  const reducer = rootReducer({})
  const middlewares = applyMiddleware(thunk)
  const store = createStore(reducer, initialState, middlewares)
  return store
}

export const pltrAdaptor = (state) => {
  return state
}
