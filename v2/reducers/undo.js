import { SYSTEM_REDUCER_ACTION_TYPES } from './systemReducers'
import {
  UNDO,
  REDO,
  FILE_SAVED,
  ACTIONS_THAT_SHOULD_BE_BATCHED,
  FORCED_BATCH_START,
  FORCED_BATCH_END,
  ACTION_TYPES_THAT_MIGHT_BE_BATCHED,
  EDIT_CARD_TEMPLATE_ATTRIBUTE,
  EDIT_CARD_CUSTOM_ATTRIBUTE,
  EDIT_PLACE_TEMPLATE_ATTRIBUTE,
  EDIT_PLACE_CUSTOM_ATTRIBUTE,
  EDIT_CHARACTER_TEMPLATE_ATTRIBUTE,
  EDIT_CHARACTER_ATTRIBUTE_VALUE,
  EDIT_NOTE_TEMPLATE_ATTRIBUTE,
  EDIT_NOTE_CUSTOM_ATTRIBUTE,
  ACTIONS_TO_IGNORE_IN_UNDO,
  DISMISS_RECENT_CHANGE_FLAG,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../constants/ActionTypes'
import { entityModifiedByAction } from '../helpers/actions'

export const INITIAL_STATE = {
  history: [],
  future: [],
  generation: 0,
  recentlyUndidOrRedid: false,
  showUndoRedo: false,
}

const MAX_UNDO_HISTORY = 100
const BATCH_SIZE = 15

export const isAttributeEditThatShouldntBeBatched = (action) => {
  if (ACTION_TYPES_THAT_MIGHT_BE_BATCHED.includes(action.type)) {
    switch (action.type) {
      case EDIT_NOTE_TEMPLATE_ATTRIBUTE:
      case EDIT_CHARACTER_ATTRIBUTE_VALUE:
      case EDIT_CHARACTER_TEMPLATE_ATTRIBUTE:
      case EDIT_PLACE_TEMPLATE_ATTRIBUTE:
      case EDIT_CARD_CUSTOM_ATTRIBUTE:
      case EDIT_CARD_TEMPLATE_ATTRIBUTE: {
        return Array.isArray(action.value)
      }
      case EDIT_NOTE_CUSTOM_ATTRIBUTE:
      case EDIT_PLACE_CUSTOM_ATTRIBUTE: {
        return Array.isArray(action.newValue)
      }
      default: {
        return false
      }
    }
  } else {
    return false
  }
}

export const entry = (state, action) => {
  const previous = state.history[0]
  if (typeof action?._shadow !== 'object') {
    return null
  } else if (previous && typeof previous === 'object' && previous.batchDepth > 0) {
    return {
      state: action._shadow,
      actionType: action.type,
      actionLabel: entityModifiedByAction(action),
      count: 0,
      batchDepth: previous.batchDepth,
    }
  } else {
    return {
      state: action._shadow,
      actionType: action.type,
      actionLabel: entityModifiedByAction(action),
      count: 0,
      batchDepth: 0,
    }
  }
}

export const handleBatchStart = (state, action) => {
  const previous = state.history[0]
  if (previous && typeof previous === 'object' && previous.actionType === FORCED_BATCH_START) {
    const newEntry = entry(state, action)
    if (!newEntry) {
      return state
    } else {
      return {
        ...state,
        future: [],
        history: [{ ...newEntry, batchDepth: previous.batchDepth + 1 }, ...state.history],
      }
    }
  } else if (previous && typeof previous === 'object' && previous.batchDepth > 0) {
    if (typeof action._shadow !== 'object') {
      return state
    } else {
      return {
        ...state,
        future: [],
        history: [{ ...previous, batchDepth: previous.batchDepth + 1 }, ...state.history.slice(1)],
      }
    }
  } else {
    const newEntry = entry(state, action)
    if (!newEntry) {
      return state
    } else {
      return {
        ...state,
        future: [],
        history: [{ ...newEntry, batchDepth: 1 }, ...state.history],
      }
    }
  }
}

export const handleBatchEnd = (state, action) => {
  const previous = state.history[0]
  if (typeof action._shadow !== 'object') {
    return state
  } else if (previous && typeof previous === 'object' && previous.batchDepth === 1) {
    const batchStart = state.history.findIndex(({ batchDepth, actionType }) => {
      return batchDepth === 1 && actionType === FORCED_BATCH_START
    })
    const batchedActionTypes = state.history.slice(0, batchStart).map(({ actionType }) => {
      return actionType
    })
    const newHistory = state.history.slice(batchStart)
    const firstEntry = { ...newHistory[0], batchDepth: 0, batchedActionTypes }
    return {
      ...state,
      future: [],
      history: [firstEntry, ...newHistory.slice(1)],
    }
  } else if (previous && typeof previous === 'object' && previous.batchDepth > 1) {
    return {
      ...state,
      future: [],
      history: [{ ...previous, batchDepth: previous.batchDepth - 1 }, ...state.history.slice(1)],
    }
  } else {
    console.warn('No open batch')
    return state
  }
}

export const handleUndo = (state, action) => {
  const newEntry = entry(state, action)
  if (state.history?.length < 1 || !newEntry) {
    return state
  } else {
    return {
      ...state,
      future: [
        { ...newEntry, actionType: action.oldType, actionLabel: action.oldLabel },
        ...state.future,
      ],
      history: state.history.slice(1),
      generation: state.generation + 1,
      recentlyUndidOrRedid: 'undid',
      showUndoRedo: typeof state.recentlyUndidOrRedid === 'string',
      changeId: action.id,
    }
  }
}

export const handleRedo = (state, action) => {
  const newEntry = entry(state, action)
  if (state.future?.length < 1 || !newEntry) {
    return state
  } else {
    return {
      ...state,
      future: state.future.slice(1),
      history: [
        { ...newEntry, actionType: action.oldType, actionLabel: action.oldLabel },
        ...state.history,
      ],
      generation: state.generation + 1,
      recentlyUndidOrRedid: 'redid',
      showUndoRedo: typeof state.recentlyUndidOrRedid === 'string',
      changeId: action.id,
    }
  }
}

export const advanceHistory = (state, action) => {
  if (typeof action._shadow !== 'object') {
    return state
  } else {
    const previous = state.history[0]
    if (
      previous?.actionType !== action.type ||
      previous?.actionLabel !== entityModifiedByAction(action) ||
      !ACTIONS_THAT_SHOULD_BE_BATCHED.includes(action.type) ||
      isAttributeEditThatShouldntBeBatched(action)
    ) {
      const newEntry = entry(state, action)
      if (!newEntry) {
        return state
      } else {
        return {
          ...state,
          future: [],
          history: [newEntry, ...state.history.slice(0, MAX_UNDO_HISTORY)],
        }
      }
    } else if (previous?.count >= BATCH_SIZE) {
      const newEntry = entry(state, action)
      if (!newEntry) {
        return state
      } else {
        return {
          ...state,
          future: [],
          history: [newEntry, ...state.history.slice(0, MAX_UNDO_HISTORY)],
        }
      }
    } else {
      return {
        ...state,
        future: [],
        history: [
          { ...state.history[0], count: state.history[0].count + 1 },
          ...state.history.slice(1, MAX_UNDO_HISTORY),
        ],
      }
    }
  }
}

export const handleUndoNTimes = (state, action) => {
  const newEntry = entry(state, action)
  if (state.history?.length < action.n || !newEntry || action.n < 0) {
    return state
  } else {
    return {
      ...state,
      future: [
        ...state.history.slice(0, action.n).reverse(),
        { ...newEntry, actionType: action.oldType, actionLabel: action.oldLabel },
        ...state.future,
      ],
      history: state.history.slice(action.n + 1),
      generation: state.generation + 1,
      recentlyUndidOrRedid: 'undid',
      showUndoRedo: typeof state.recentlyUndidOrRedid === 'string',
      changeId: action.id,
    }
  }
}

export const handleRedoNTimes = (state, action) => {
  const newEntry = entry(state, action)
  if (state.future?.length < action.n || !newEntry || action.n < 0) {
    return state
  } else {
    return {
      ...state,
      history: [
        ...state.future.slice(0, action.n).reverse(),
        { ...newEntry, actionType: action.oldType, actionLabel: action.oldLabel },
        ...state.history,
      ],
      future: state.future.slice(action.n + 1),
      generation: state.generation + 1,
      recentlyUndidOrRedid: 'redid',
      showUndoRedo: typeof state.recentlyUndidOrRedid === 'string',
      changeId: action.id,
    }
  }
}

const undo = (state = INITIAL_STATE, action) => {
  if (action.type === DISMISS_RECENT_CHANGE_FLAG) {
    return {
      ...state,
      recentlyUndidOrRedid: false,
      showUndoRedo: false,
    }
  } else if (ACTIONS_TO_IGNORE_IN_UNDO.includes(action.type)) {
    return state
  } else if (action.type === FORCED_BATCH_START) {
    return handleBatchStart(state, action)
  } else if (action.type === FORCED_BATCH_END) {
    return handleBatchEnd(state, action)
  } else if (action.type === UNDO) {
    return handleUndo(state, action)
  } else if (action.type === REDO) {
    return handleRedo(state, action)
  } else if (action.type === UNDO_N_TIMES) {
    return handleUndoNTimes(state, action)
  } else if (action.type === REDO_N_TIMES) {
    return handleRedoNTimes(state, action)
  } else if (
    SYSTEM_REDUCER_ACTION_TYPES.includes(action.type) ||
    action.type === FILE_SAVED ||
    action.type.startsWith('@')
  ) {
    return state
  } else {
    return advanceHistory(state, action)
  }
}

export default undo
