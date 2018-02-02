import { CHANGE_CURRENT_VIEW, CHANGE_ORIENTATION, FILE_LOADED, NEW_FILE, SET_DARK_MODE } from '../constants/ActionTypes'
import { ui as defaultUI } from 'store/initialState'
import { newFileUI } from 'store/newFileState'

export default function ui (state = defaultUI, action) {
  switch (action.type) {
    case CHANGE_CURRENT_VIEW:
      return Object.assign({}, state, {currentView: action.view})

    case CHANGE_ORIENTATION:
      return Object.assign({}, state, {orientation: action.orientation})

    case SET_DARK_MODE:
      return Object.assign({}, state, {darkMode: action.on})

    case FILE_LOADED:
      return action.data.ui

    case NEW_FILE:
      return newFileUI

    default:
      return state
  }
}
