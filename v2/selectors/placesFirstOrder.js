// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { sortBy, groupBy } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'
import { positionReset } from '../helpers/lists'

export const allPlacesSelector = createSelector(fullFileStateSelector, (state) => state.places)

const selectId = (state, id) => id
export const singlePlaceSelector = createSelector(allPlacesSelector, selectId, (places, propId) =>
  places.find(({ id }) => id === propId)
)

export const placesSortedAtoZSelector = createSelector(allPlacesSelector, (places) =>
  sortBy(places, 'name')
)

export const placesByCategorySelector = createSelector(allPlacesSelector, (places) => {
  const placesWithCategory = places.map((note) => {
    if (!note.categoryId) {
      return {
        ...note,
        categoryId: null,
      }
    }
    return note
  })
  const grouped = groupBy(placesWithCategory, 'categoryId')

  const groupWithPosition = Object.values(grouped).map((group) => {
    return positionReset(group)
  })
  return groupBy(groupWithPosition.flat(), 'categoryId')
})

export const stringifiedPlacesByIdSelector = createSelector(allPlacesSelector, (places) => {
  return places.reduce((acc, nextPlace) => {
    return {
      ...acc,
      [nextPlace.id]: JSON.stringify(nextPlace).toLowerCase(),
    }
  }, {})
})
