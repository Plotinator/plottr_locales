// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { nextId, beatsByPosition } from '../helpers/beats'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const allBeatsSelector = createSelector(fullFileStateSelector, (state) => state.beats)
export const nextBeatIdSelector = createSelector(allBeatsSelector, (beats) => nextId(beats))

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
