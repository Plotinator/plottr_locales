// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { omit } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const allBookIdsSelector = createSelector(
  fullFileStateSelector,
  (state) => state.books.allIds
)
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
