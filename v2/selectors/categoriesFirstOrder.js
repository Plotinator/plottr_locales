// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const allCategoriesSelector = createSelector(
  fullFileStateSelector,
  ({ categories }) => categories ?? {}
)
export const characterCategoriesSelector = createSelector(
  allCategoriesSelector,
  ({ characters }) => characters ?? []
)
export const noteCategoriesSelector = createSelector(
  allCategoriesSelector,
  ({ notes }) => notes ?? []
)
export const tagCategoriesSelector = createSelector(allCategoriesSelector, ({ tags }) => tags ?? [])
export const placeCategoriesSelector = createSelector(
  allCategoriesSelector,
  ({ places }) => places ?? []
)

const typeSelector = (_state, type) => {
  return type
}
/**
 * @param {object} state
 * @param {object} ownProps
 * @returns {[Object]}
 */
export const categoryByTypeSelector = createSelector(
  allCategoriesSelector,
  typeSelector,
  (categories, categoryType) => {
    return categories[categoryType] ?? []
  }
)

export const sortedCharacterCategoriesSelector = createSelector(
  characterCategoriesSelector,
  (categories) => sortBy(categories, 'position')
)

export const sortedNoteCategoriesSelector = createSelector(noteCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

export const sortedTagCategoriesSelector = createSelector(tagCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)

export const sortedPlaceCategoriesSelector = createSelector(placeCategoriesSelector, (categories) =>
  sortBy(categories, 'position')
)
