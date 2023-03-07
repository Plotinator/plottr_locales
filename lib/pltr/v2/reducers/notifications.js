import { DISMISS_MESSAGE, SHOW_MESSAGE, SHOW_TOAST_NOTIFICATION } from '../constants/ActionTypes'
import { notifications } from '../store/initialState'

const INITIAL_STATE = notifications

const notificationsReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SHOW_TOAST_NOTIFICATION: {
      const { visible, cardAction, lineAction, newBookId } = action

      return {
        ...state,
        toast: {
          cardAction,
          newBookId,
          visible,
          lineAction,
        },
      }
    }
    case SHOW_MESSAGE: {
      const { message, timeout } = action
      return {
        ...state,
        message,
        timeout,
      }
    }
    case DISMISS_MESSAGE: {
      return {
        ...state,
        message: null,
        timeout: null,
      }
    }
    default:
      return state
  }
}

export default notificationsReducer
