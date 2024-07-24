import { SELECT_FILE } from '../constants/ActionTypes'

const INITIAL_STATE = { permission: 'owner' }

const permissionReducer =
  (_dataRepairers) =>
  (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SELECT_FILE:
        return {
          permission: action.permission,
        }
      default:
        return state
    }
  }

export default permissionReducer
