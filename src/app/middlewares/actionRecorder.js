import { ActionTypes } from 'pltr/v2'

const actionRecorder = (store) => (next) => (action) => {
  // Support redux-thunk and friends where non-objects are dispatched.
  if (!action.type) {
    return next(action)
  } else if (
    action.type !== ActionTypes.RESET_ACTION_RECORDER &&
    action.type !== ActionTypes.RECORD_LAST_ACTION
  ) {
    if (!action.type.startsWith('@')) {
      const result = next({
        ...action,
        actionRecorder: {
          type: ActionTypes.RECORD_LAST_ACTION,
          lastAction: action.type,
          lastActionKeys: [...Object.keys(action)],
          lastActionTimestamp: new Date() * 1,
        },
      })
      return result
    } else {
      return next(action)
    }
  } else {
    return next(action)
  }
}

export default actionRecorder
