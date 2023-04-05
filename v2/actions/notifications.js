import { identity } from 'lodash'

import selectors from '../selectors'
import { SHOW_MESSAGE, SHOW_TOAST_NOTIFICATION, DISMISS_MESSAGE } from '../constants/ActionTypes'

const { timeoutSelector } = selectors(identity)

export function showToastNotification(visible, cardAction, newBookId, lineAction) {
  return { type: SHOW_TOAST_NOTIFICATION, visible, cardAction, newBookId, lineAction }
}

export const showMessage = (message) => (dispatch, getState) => {
  const state = getState()
  const existingTimeout = timeoutSelector(state)

  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  const timeout = setTimeout(() => {
    dispatch(dismissMessage())
  }, 5000)
  dispatch({ type: SHOW_MESSAGE, message, timeout })
}

export function dismissMessage() {
  return { type: DISMISS_MESSAGE }
}
