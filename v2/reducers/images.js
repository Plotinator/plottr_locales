import {
  ADD_IMAGE,
  RENAME_IMAGE,
  DELETE_IMAGE,
  FILE_LOADED,
  NEW_FILE,
  LOAD_IMAGES,
  UNDO,
  REDO,
  UNDO_N_TIMES,
  REDO_N_TIMES,
  ADD_IMAGE_FROM_PLTR,
} from '../constants/ActionTypes'
import { newFileImages } from '../store/newFileState'
import { imageId } from '../store/newIds'

const cards = (_dataRepairers) => (state, action) => {
  switch (action.type) {
    case ADD_IMAGE: {
      const newId = imageId(state)
      const newImage = Object.assign({}, action.image, { id: newId })
      return {
        ...state,
        [newId]: newImage,
      }
    }

    case ADD_IMAGE_FROM_PLTR: {
      const { newId, image } = action
      if (newId && !state[newId]) {
        const newImage = Object.assign({}, image, { id: newId })
        return {
          ...state,
          [newId]: newImage,
        }
      } else {
        return state
      }
    }

    case RENAME_IMAGE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          name: action.name,
        },
      }

    case DELETE_IMAGE:
      return Object.keys(state).reduce((acc, id) => {
        if (id != action.id) {
          acc[id] = state[id]
        }
        return acc
      }, {})

    case UNDO_N_TIMES:
    case REDO_N_TIMES:
    case UNDO:
    case REDO: {
      if (action?.state?.images && typeof action.state.images === 'object') {
        return action.state.images
      } else {
        return state
      }
    }

    case FILE_LOADED:
      return action.data.images

    case NEW_FILE:
      return newFileImages

    case LOAD_IMAGES:
      return action.images

    default:
      return state || {}
  }
}

export default cards
