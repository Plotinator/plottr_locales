// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'
import { groupBy, mapValues } from 'lodash'

import { fullFileStateSelector } from './fullFileFirstOrder'

export const attributesSelector = createSelector(fullFileStateSelector, (state) => {
  return state.attributes || []
})

export const characterAttributesForBookSelector = createSelector(
  attributesSelector,
  (attributes) => {
    return (attributes && attributes.characters) || []
  }
)

export const allCharacterAttributesSelector = createSelector(attributesSelector, (attributes) => {
  return (attributes && attributes.characters) || []
})

export const allNonBaseCharacterAttributesSelector = createSelector(
  attributesSelector,
  (attributes) => {
    return ((attributes && attributes.characters) || []).filter((attribute) => {
      return attribute.type !== 'base-attribute'
    })
  }
)

export const characterAttributsForBookByIdSelector = createSelector(
  characterAttributesForBookSelector,
  (attributeDescriptors) => {
    return mapValues(groupBy(attributeDescriptors, 'id'), '0')
  }
)
