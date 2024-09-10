/** @module Selectors */

// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { omit } from 'lodash'
import { createAggressiveDeepEqualSelector } from './createDeepEqualSelector'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const allBooksSelector = createSelector(fullFileStateSelector, ({ books }) => books ?? {})

/**
 * Selects an array of bookIds
 * @function allBookIdsSelector
 * @returns {Array} bookIds (numbers)
 * @example [1, 2, 6]
 */
export const allBookIdsSelector = createSelector(allBooksSelector, ({ allIds }) => allIds ?? [])

/**
 * Selects an array of books
 * @function allBooksSelector
 * @returns {Array} book data objects
 * @example [{ ...<bookData> }, { ...<bookData> }]
 */
export const allBooksAsArraySelector = createAggressiveDeepEqualSelector(
  allBooksSelector,
  (books) => {
    return [...Object.values(omit(books, 'allIds'))]
  }
)

const bookIdSelector = (_state, bookId) => {
  return bookId
}
export const bookByIdSelector = createSelector(
  allBooksSelector,
  bookIdSelector,
  (books, bookId) => {
    return books[bookId]
  }
)

export const singleBookSelector = createSelector(
  allBooksSelector,
  bookIdSelector,
  (books, bookId) => {
    return books[bookId]
  }
)

export const canDeleteBookSelector = createSelector(
  allBookIdsSelector,
  (bookIds) => bookIds.length > 1
)
