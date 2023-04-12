// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

import { nextId } from '../store/newIds'
import { isSeries } from '../helpers/lines'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const allSeriesLinesSelector = createSelector(fullFileStateSelector, (state) =>
  state.lines.filter(isSeries)
)

export const allLinesSelector = createSelector(fullFileStateSelector, (state) => state.lines)

export const nextLineIdSelector = createSelector(allLinesSelector, (lines) => nextId(lines))

const bookIdSelector = (state, bookId) => bookId
export const linesForBookSelector = createSelector(
  allLinesSelector,
  bookIdSelector,
  (lines, bookId) => {
    return lines.filter((l) => l && l.bookId == bookId)
  }
)

export const firstLineForBookThunkSelector = createSelector(linesForBookSelector, (lines) => {
  return (bookId) => {
    const linesInBook = lines.filter((l) => l && l.bookId == bookId)
    return sortBy(linesInBook, 'position')[0]
  }
})

export const firstLineForBookSelector = createSelector(allLinesSelector, (lines) => {
  return sortBy(lines, 'position')[0]
})

const cardLineIdSelector = (_state, id) => id
export const cardsLineSelector = createSelector(
  allLinesSelector,
  cardLineIdSelector,
  (lines, id) => {
    return lines.find((l) => l.id == id)
  }
)
