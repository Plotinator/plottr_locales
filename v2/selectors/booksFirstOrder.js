/** @module Selectors */

// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { omit } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'

/**
 * Selects an array of bookIds
 * @function allBookIdsSelector
 * @returns {Array} bookIds (numbers)
 * @example [1, 2, 6]
 */
export const allBookIdsSelector = createSelector(
  fullFileStateSelector,
  (state) => state.books.allIds
)
/**
 * Selects an array of books
 * @function allBooksSelector
 * @returns {Array} book data objects
 * @example [{ ...<bookData> }, { ...<bookData> }]
 */
export const allBooksSelector = createSelector(fullFileStateSelector, (state) => state.books)
export const allBooksAsArraySelector = createSelector(fullFileStateSelector, (state) => {
  return [...Object.values(omit(state.books, 'allIds'))]
})

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
