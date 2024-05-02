// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { fullSystemStateSelector } from './fullFileFirstOrder'
import { FILE_LOADED } from '../constants/ActionTypes'

export const undoSelector = createSelector(fullSystemStateSelector, ({ undo }) => {
  return (
    undo ?? {
      history: [],
      future: [],
    }
  )
})
export const undoGenerationSelector = createSelector(undoSelector, ({ generation }) => {
  return generation
})
export const undoHistorySelector = createSelector(undoSelector, ({ history }) => {
  return history ?? []
})
export const lastUndoStateSelector = createSelector(undoHistorySelector, (history) => {
  return history?.[0] ?? null
})
export const undoFutureSelector = createSelector(undoSelector, ({ future }) => {
  return future ?? []
})
export const lastRedoStateSelector = createSelector(undoFutureSelector, (future) => {
  return future?.[0] ?? null
})
export const recentlyUndidOrRedidSelector = createSelector(
  undoSelector,
  ({ recentlyUndidOrRedid }) => {
    return recentlyUndidOrRedid
  }
)
export const historyLabelsSelector = createSelector(undoHistorySelector, (history) => {
  return history
    .filter(({ actionType }) => {
      return actionType !== FILE_LOADED
    })
    .map(({ actionLabel }) => {
      return actionLabel ?? 'Unknown'
    })
})
export const futureLabelsSelector = createSelector(undoFutureSelector, (future) => {
  return future.map(({ actionLabel }) => {
    return actionLabel ?? 'Unknown'
  })
})
export const undoRedoChangeIdSelector = createSelector(undoSelector, ({ changeId }) => {
  return changeId
})
export const showUndoRedoSelector = createSelector(undoSelector, ({ showUndoRedo }) => {
  return showUndoRedo
})
