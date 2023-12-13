// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { nextId, beatsByPosition, allBeatsAsArray } from '../helpers/beats'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const allBeatsSelector = createSelector(fullFileStateSelector, (state) => state.beats)
export const nextBeatIdSelector = createSelector(allBeatsSelector, (beats) => nextId(beats))

export const allBeatsAsArraySelector = createSelector(allBeatsSelector, (beats) => {
  return allBeatsAsArray(beats)
})

const bookIdSelector = (state, bookId) => bookId
export const beatsForAnotherBookSelector = createSelector(
  bookIdSelector,
  allBeatsSelector,
  (bookId, beats) => {
    return beats[bookId]
  }
)

export const beatsForBookOne = createSelector(allBeatsSelector, (beats) => {
  return beats[1]
})

export const sortedBeatsForAnotherBookSelector = createSelector(
  beatsForAnotherBookSelector,
  beatsByPosition(() => true)
)

export const templateBeatsForBookOne = createSelector(
  beatsForBookOne,
  beatsByPosition(() => true)
)

const beatIdSelector = (_state, beatId) => {
  return beatId
}
export const beatByIdSelector = createSelector(
  allBeatsSelector,
  beatIdSelector,
  (beatTrees, beatId) => {
    return Object.values(beatTrees).reduce((found, nextTree) => {
      if (found) {
        return found
      } else {
        return nextTree.index[beatId] || null
      }
    }, null)
  }
)
