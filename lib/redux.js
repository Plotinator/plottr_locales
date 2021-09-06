import { isEqual } from 'lodash'
import { createStore, applyMiddleware, compose } from 'redux'
import { rootReducer, ActionTypes } from 'pltr/v2'
import undoable, { excludeAction } from 'redux-undo'
import firebaseSync from './middlewares/firebase-sync'
import actionRecorder from './middlewares/actionRecorder'
import thunk from 'redux-thunk'
import saver from './middlewares/saver'
// import tracker from '../middlewares/tracker'
// import logger from '../middlewares/logger'
// import reporter from '../middlewares/reporter'

// Ten seconds
const TIME_DELTA_TO_BUNDLE_UNDOS = 10000
const ACTIONS_TO_BATCH = 20

const sameActionCloseInTime = (action, currentState, _previousHistory) => {
  const sameActionAsLastTime = action.type === currentState.actions.lastAction
  const sameKeysAsLastTime = isEqual([...Object.keys(action)], currentState.actions.lastActionKeys)

  if (sameActionAsLastTime && sameKeysAsLastTime) {
    const editorPath = action.editorMetadata && action.editorMetadata.editorPath
    const editorPathSuffix = editorPath ? '_' + editorPath : ''
    const timeNow = new Date() * 1
    const timeDelta = timeNow - currentState.actions.lastActionTimestamp
    const actionCountBatch = Math.floor(currentState.actions.editCount / ACTIONS_TO_BATCH)
    if (timeDelta > TIME_DELTA_TO_BUNDLE_UNDOS) {
      return `${action.type}_${timeNow}${editorPathSuffix}_${actionCountBatch}`
    }
    return `${action.type}_${currentState.actions.startTimestamp}${editorPathSuffix}_${actionCountBatch}`
  }

  return null
}

function configureStore(initialState) {
  const window = global.window
  const composeEnhancers = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose
  const dataRepairers = {}
  const reducer = undoable(rootReducer(dataRepairers), {
    limit: 40,
    ignoreInitialState: true,
    groupBy: sameActionCloseInTime,
    filter: excludeAction([ActionTypes.RESET_ACTION_RECORDER, ActionTypes.RECORD_LAST_ACTION]),
  })

  const middlewares = applyMiddleware(actionRecorder, saver, firebaseSync, thunk) // (saver, tracker, logger, reporter)
  const enhancers =
    process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? middlewares : composeEnhancers(middlewares)
  const store = createStore(reducer, initialState, enhancers)
  return store
}

const store = configureStore({})

export { store, configureStore }
