import { ActionTypes } from 'pltr/v2'

const actionRecorder = (store) => (next) => (action) => {
  const result = next(action)

  // Support redux-thunk and friends where non-objects are dispatched.
  if (!action.type) return result

  if (
    action.type !== ActionTypes.RESET_ACTION_RECORDER &&
    action.type !== ActionTypes.RECORD_LAST_ACTION
  ) {
    // Reset the action recorder when we undo
    if (action.type === '@@redux-undo/UNDO' || action.type === '@@redux-undo/REDO') {
      store.dispatch({
        type: ActionTypes.RESET_ACTION_RECORDER,
      })
      return result
    } else if (!action.type.startsWith('@')) {
      store.dispatch({
        type: ActionTypes.RECORD_LAST_ACTION,
        lastAction: action.type,
        lastActionKeys: [...Object.keys(action)],
        lastActionTimestamp: new Date() * 1,
      })
    }
  }

  return result
}

export default actionRecorder
