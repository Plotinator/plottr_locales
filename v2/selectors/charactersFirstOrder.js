// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.
import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'
import { positionReset } from '../helpers/lists'

export const allCharactersSelector = createSelector(
  fullFileStateSelector,
  (state) => state.characters
)

// this one also lives in ./customAttributes.js but it causes a circular dependency to import it here

const selectId = (state, id) => id

export const singleCharacterSelector = createSelector(
  allCharactersSelector,
  selectId,
  (characters, propId) => characters.find((ch) => ch.id == propId)
)

export const charactersByCategorySelector = createSelector(allCharactersSelector, (characters) => {
  const grouped = groupBy(characters, 'categoryId')
  const groupWithPosition = Object.values(grouped).map((group) => {
    return positionReset(group)
  })
  return groupBy(groupWithPosition.flat(), 'categoryId')
})

export const charactersSortedAtoZSelector = createSelector(allCharactersSelector, (characters) =>
  sortBy(characters, 'name')
)
