import { batch as reduxBatch } from 'react-redux'
import { identity, difference } from 'lodash'

import { emptyFile } from '../store/newFileState'
import selectors from '../selectors'
import {
  UNDO,
  REDO,
  FORCED_BATCH_END,
  FORCED_BATCH_START,
  FILE_LOADED,
  DISMISS_RECENT_CHANGE_FLAG,
  UNDO_N_TIMES,
  REDO_N_TIMES,
} from '../constants/ActionTypes'

const {
  lastUndoStateSelector,
  lastRedoStateSelector,
  fullFileStateSelector,
  undoRedoChangeIdSelector,
  undoHistorySelector,
  undoFutureSelector,
} = selectors(identity)

const hasAllKeys = (userState) => {
  const emptyFileState = emptyFile('DummyFile', '2022.11.2')
  return difference(Object.keys(emptyFileState), Object.keys(userState)).length === 0
}

export const undo = () => (dispatch, getState) => {
  const undoState = lastUndoStateSelector(getState())
  if (
    undoState &&
    typeof undoState === 'object' &&
    hasAllKeys(undoState.state) &&
    undoState.actionType !== FILE_LOADED
  ) {
    const id = Math.floor(Math.random() * 1000000)
    dispatch({
      type: UNDO,
      oldType: undoState.actionType,
      oldLabel: undoState.actionLabel,
      state: undoState.state,
      id,
    })
    setTimeout(() => {
      if (undoRedoChangeIdSelector(getState()) === id) {
        dispatch({
          type: DISMISS_RECENT_CHANGE_FLAG,
        })
      }
    }, 3000)
  }
}

export const redo = () => (dispatch, getState) => {
  const redoState = lastRedoStateSelector(getState())
  if (
    redoState &&
    typeof redoState === 'object' &&
    hasAllKeys(redoState.state) &&
    redoState.actionType !== FILE_LOADED
  ) {
    const id = Math.floor(Math.random() * 1000000)
    dispatch({
      type: REDO,
      oldType: redoState.actionType,
      oldLabel: redoState.actionLabel,
      state: redoState.state,
      id,
    })
    setTimeout(() => {
      if (undoRedoChangeIdSelector(getState()) === id) {
        dispatch({
          type: DISMISS_RECENT_CHANGE_FLAG,
        })
      }
    }, 3000)
  }
}

export const undoNTimes = (n) => (dispatch, getState) => {
  const undoHistory = undoHistorySelector(getState())
  if (Array.isArray(undoHistory) && undoHistory.length >= n) {
    const undoState = undoHistory[n]
    if (
      undoState &&
      typeof undoState === 'object' &&
      hasAllKeys(undoState.state) &&
      undoState.actionType !== FILE_LOADED
    ) {
      const id = Math.floor(Math.random() * 1000000)
      dispatch({
        type: UNDO_N_TIMES,
        n,
        oldType: undoState.actionType,
        oldLabel: undoState.actionLabel,
        state: undoState.state,
        id,
      })
      setTimeout(() => {
        if (undoRedoChangeIdSelector(getState()) === id) {
          dispatch({
            type: DISMISS_RECENT_CHANGE_FLAG,
          })
        }
      }, 3000)
    }
  }
}

export const redoNTimes = (n) => (dispatch, getState) => {
  const undoFuture = undoFutureSelector(getState())
  if (Array.isArray(undoFuture) && undoFuture.length >= n) {
    const redoState = undoFuture[n]
    if (
      redoState &&
      typeof redoState === 'object' &&
      hasAllKeys(redoState.state) &&
      redoState.actionType !== FILE_LOADED
    ) {
      const id = Math.floor(Math.random() * 1000000)
      dispatch({
        type: REDO_N_TIMES,
        n,
        oldType: redoState.actionType,
        oldLabel: redoState.actionLabel,
        state: redoState.state,
        id,
      })
      setTimeout(() => {
        if (undoRedoChangeIdSelector(getState()) === id) {
          dispatch({
            type: DISMISS_RECENT_CHANGE_FLAG,
          })
        }
      }, 3000)
    }
  }
}

export const dismissUndoRedoDialog = () => {
  return {
    type: DISMISS_RECENT_CHANGE_FLAG,
  }
}

export const batch = (name, actionsThunk) => (dispatch, getState) => {
  reduxBatch(() => {
    dispatch({ type: FORCED_BATCH_START, name })
    actionsThunk()
    dispatch({ type: FORCED_BATCH_END, name })
  })
}

// N.B. These two actions (forceBatchStart and forceBatchEnd) are
// usually called from odd places; for example, they're called from
// the root reducer.  In those cases, the middleware wont run and the
// action will lake a shadow state.  We add the shadow state here to
// enable undo/redo to work as expected.

export const forceBatchStart = (name, rawFullFileState) => {
  const currentUserFileState = fullFileStateSelector(rawFullFileState)
  return { type: FORCED_BATCH_START, _shadow: currentUserFileState, name }
}

export const forceBatchEnd = (rawFullFileState) => {
  const currentUserFileState = fullFileStateSelector(rawFullFileState)
  return { type: FORCED_BATCH_END, _shadow: currentUserFileState }
}
