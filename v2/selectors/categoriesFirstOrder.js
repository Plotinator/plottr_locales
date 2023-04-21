// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const allCategoriesSelector = createSelector(
  fullFileStateSelector,
  (state) => state.categories
)
export const characterCategoriesSelector = createSelector(
  fullFileStateSelector,
  (state) => state.categories.characters
)
export const noteCategoriesSelector = createSelector(
  fullFileStateSelector,
  (state) => state.categories.notes
)
export const tagCategoriesSelector = createSelector(
  fullFileStateSelector,
  (state) => state.categories.tags
)
export const placeCategoriesSelector = createSelector(
  fullFileStateSelector,
  (state) => state.categories.places
)

const typeSelector = (_state, type) => {
  return type
}
export const categoryByTypeSelector = createSelector(
  allCategoriesSelector,
  typeSelector,
  (categories, categoryType) => {
    return categories[categoryType]
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
