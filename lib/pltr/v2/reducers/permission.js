import { SELECT_EMPTY_FILE, SELECT_FILE } from '../constants/ActionTypes'

const INITIAL_STATE = { permission: 'owner' }

const permissionReducer =
  (_dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SELECT_FILE: {
        return {
          permission: action.permission,
        }
      }
      case SELECT_EMPTY_FILE: {
        return {
          permission: null,
        }
      }
      default:
        return state
    }
  }

export default permissionReducer
