// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { sortBy, keyBy } from 'lodash'
import { createSelector } from 'reselect'

import { nextId } from '../store/newIds'
import { isSeries } from '../helpers/lines'
import { fullFileStateSelector } from './fullFileFirstOrder'

export const allLinesSelector = createSelector(fullFileStateSelector, ({ lines }) => lines ?? [])

export const allSeriesLinesSelector = createSelector(allLinesSelector, (lines) =>
  lines.filter(isSeries)
)

export const allLinesByIdSelector = createSelector(allLinesSelector, (lines) => {
  return keyBy(lines, 'id')
})

export const nextLineIdSelector = createSelector(allLinesSelector, (lines) => nextId(lines))

const bookIdSelector = (_state, bookId) => bookId
export const linesForBookSelector = createSelector(
  allLinesSelector,
  bookIdSelector,
  (lines, bookId) => {
    return lines.filter((l) => l && l.bookId == bookId)
  }
)

export const firstLineForBookThunkSelector = createSelector(allLinesSelector, (lines) => {
  return (bookId) => {
    const linesInBook = lines.filter((l) => l && l.bookId == bookId)
    return sortBy(linesInBook, 'position')[0]
  }
})

export const firstLineForBookSelector = createSelector(linesForBookSelector, (lines) => {
  return sortBy(lines, 'position')[0]
})

const lineIdSelector = (_state, lineId) => {
  return lineId
}
export const singleLineSelector = createSelector(
  allLinesSelector,
  lineIdSelector,
  (lines, lineId) => {
    return lines.find(({ id }) => {
      return id === lineId
    })
  }
)
