import {
  ADD_PLACES_ATTRIBUTE,
  ADD_CARDS_ATTRIBUTE,
  ADD_LINES_ATTRIBUTE,
  ADD_NOTES_ATTRIBUTE,
  REMOVE_CARDS_ATTRIBUTE,
  REMOVE_PLACES_ATTRIBUTE,
  REMOVE_LINES_ATTRIBUTE,
  REMOVE_NOTES_ATTRIBUTE,
  EDIT_PLACES_ATTRIBUTE,
  EDIT_CARDS_ATTRIBUTE,
  EDIT_NOTES_ATTRIBUTE,
  FILE_LOADED,
  NEW_FILE,
  REORDER_CHARACTER_ATTRIBUTE,
  REORDER_PLACES_ATTRIBUTE,
  REORDER_CARDS_ATTRIBUTE,
  REORDER_NOTES_ATTRIBUTE,
  LOAD_CUSTOM_ATTRIBUTES,
  DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_METADATA,
  UNDO,
  REDO,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../constants/ActionTypes'
import { combineReducers } from 'redux'
import { newFileCustomAttributes } from '../store/newFileState'

function characters(state = [], action) {
  switch (action.type) {
    case NEW_FILE:
      return newFileCustomAttributes['characters']

    case FILE_LOADED:
      return action.data.customAttributes['characters'] || []

    case REORDER_CHARACTER_ATTRIBUTE: {
      let { toIndex, attribute } = action

      const copy = state.slice().filter(({ name }) => name != attribute.name)

      copy.splice(toIndex, 0, attribute)
      return copy
    }

    case EDIT_CHARACTER_ATTRIBUTE_METADATA: {
      const { id, name, attributeType, oldName } = action
      if (id || !oldName) {
        return state
      }

      return state.map((attribute) => {
        if (attribute.name === oldName) {
          return {
            ...attribute,
            name,
            type: attributeType,
          }
        }
        return attribute
      })
    }

    case DELETE_CHARACTER_LEGACY_CUSTOM_ATTRIBUTE: {
      const { attributeName } = action
      return state.filter((attribute) => {
        return attribute.name !== attributeName
      })
    }

    case UNDO_N_TIMES:
    case REDO_N_TIMES:
    case UNDO:
    case REDO: {
      if (Array.isArray(action.state.customAttributes?.characters)) {
        return action.state.customAttributes.characters
      } else {
        return state
      }
    }

    case LOAD_CUSTOM_ATTRIBUTES:
      return action.customAttributes.characters || []

    default:
      return state
  }
}

function places(state = [], action) {
  switch (action.type) {
    case ADD_PLACES_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_PLACES_ATTRIBUTE: // attribute is the attr's name
      return state.filter((attr) => attr.name !== action.attribute)

    case EDIT_PLACES_ATTRIBUTE: {
      let newState = [...state]
      newState[action.index] = action.newAttribute
      return newState
    }

    case NEW_FILE:
      return newFileCustomAttributes['places']

    case FILE_LOADED:
      return action.data.customAttributes['places'] || []

    case REORDER_PLACES_ATTRIBUTE: {
      let { toIndex, attribute } = action

      const copy = state.slice().filter(({ name }) => name != attribute.name)

      copy.splice(toIndex, 0, attribute)
      return copy
    }

    case UNDO_N_TIMES:
    case REDO_N_TIMES:
    case UNDO:
    case REDO: {
      if (Array.isArray(action.state.customAttributes?.places)) {
        return action.state.customAttributes.places
      } else {
        return state
      }
    }

    case LOAD_CUSTOM_ATTRIBUTES:
      return action.customAttributes.places || []

    default:
      return state
  }
}

function scenes(state = [], action) {
  switch (action.type) {
    case ADD_CARDS_ATTRIBUTE:
      if (state.some(({ name }) => name === action.attribute.name)) {
        return state
      }
      return [...state, action.attribute]

    case EDIT_CARDS_ATTRIBUTE: {
      let newState = [...state]
      newState[action.index] = action.newAttribute
      return newState
    }

    case REMOVE_CARDS_ATTRIBUTE:
      return state.filter((attr) => attr.name !== action.attribute)

    case REORDER_CARDS_ATTRIBUTE: {
      const { toIndex, attribute } = action

      const copy = state.slice().filter(({ name }) => name != attribute.name)

      copy.splice(toIndex, 0, attribute)

      return copy
    }

    case NEW_FILE:
      return newFileCustomAttributes['scenes']

    case FILE_LOADED:
      return action.data.customAttributes['scenes'] || []

    case UNDO_N_TIMES:
    case REDO_N_TIMES:
    case UNDO:
    case REDO: {
      if (Array.isArray(action.state.customAttributes?.scenes)) {
        return action.state.customAttributes.scenes
      } else {
        return state
      }
    }

    case LOAD_CUSTOM_ATTRIBUTES:
      return action.customAttributes.scenes || []

    default:
      return state
  }
}

function notes(state = [], action) {
  switch (action.type) {
    case ADD_NOTES_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_NOTES_ATTRIBUTE: // attribute is the attr's name
      return state.filter((attr) => attr.name !== action.attribute)

    case EDIT_NOTES_ATTRIBUTE: {
      let newState = [...state]
      newState[action.index] = action.newAttribute
      return newState
    }

    case NEW_FILE:
      return newFileCustomAttributes['notes']

    case FILE_LOADED:
      return action.data.customAttributes['notes'] || []

    case REORDER_NOTES_ATTRIBUTE: {
      let { toIndex, attribute } = action

      const copy = state.slice().filter(({ name }) => name != attribute.name)

      copy.splice(toIndex, 0, attribute)
      return copy
    }

    case UNDO_N_TIMES:
    case REDO_N_TIMES:
    case UNDO:
    case REDO: {
      if (Array.isArray(action.state.customAttributes?.scenes)) {
        return action.state.customAttributes.notes
      } else {
        return state
      }
    }

    case LOAD_CUSTOM_ATTRIBUTES:
      return action.customAttributes.notes || []

    default:
      return state || []
  }
}

function lines(state = [], action) {
  switch (action.type) {
    case ADD_LINES_ATTRIBUTE:
      return [...state, action.attribute]

    case REMOVE_LINES_ATTRIBUTE:
      state.splice(state.indexOf(action.attribute), 1)
      return [...state]

    case NEW_FILE:
      return newFileCustomAttributes['lines']

    case FILE_LOADED:
      return action.data.customAttributes['lines'] || []

    case UNDO_N_TIMES:
    case REDO_N_TIMES:
    case UNDO:
    case REDO: {
      if (Array.isArray(action.state.customAttributes?.lines)) {
        return action.state.customAttributes.lines
      } else {
        return state
      }
    }

    case LOAD_CUSTOM_ATTRIBUTES:
      return action.customAttributes.lines || []

    default:
      return state
  }
}

const customAttributes = (_dataRepairers) =>
  combineReducers({
    characters,
    places,
    scenes,
    lines,
    notes,
  })

export default customAttributes
