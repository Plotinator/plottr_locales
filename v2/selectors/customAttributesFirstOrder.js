// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

import { createSelector } from 'reselect'

import { character, place } from '../store/initialState'
import { fullFileStateSelector } from './fullFileFirstOrder'

const characterKeys = Object.keys(character)
const placeKeys = Object.keys(place)

export const allCustomAttributesSelector = createSelector(
  fullFileStateSelector,
  ({ customAttributes }) => customAttributes || {}
)
export const characterCustomAttributesSelector = createSelector(
  allCustomAttributesSelector,
  ({ characters }) => characters || {}
)
export const placeCustomAttributesSelector = createSelector(
  allCustomAttributesSelector,
  ({ places }) => places || {}
)
export const cardsCustomAttributesSelector = createSelector(
  allCustomAttributesSelector,
  ({ scenes }) => scenes || {}
)
export const noteCustomAttributesSelector = createSelector(
  allCustomAttributesSelector,
  ({ notes }) => notes || {}
)

export const characterSortCAnamesSelector = createSelector(
  characterCustomAttributesSelector,
  (attributes) => attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

export const placeSortCAnamesSelector = createSelector(
  placeCustomAttributesSelector,
  (attributes) => attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

export const noteSortCAnamesSelector = createSelector(noteCustomAttributesSelector, (attributes) =>
  attributes.filter((attr) => attr.type == 'text').map((attr) => attr.name)
)

export const characterCustomAttributesRestrictedValues = createSelector(
  characterCustomAttributesSelector,
  (attrs) => characterKeys.concat(attrs.map((a) => a.name))
)

export const placeCustomAttributesRestrictedValues = createSelector(
  placeCustomAttributesSelector,
  (attrs) => placeKeys.concat(attrs.map((a) => a.name))
)

export const noteCustomAttributesRestrictedValues = createSelector(
  noteCustomAttributesSelector,
  (attrs) => placeKeys.concat(attrs.map((a) => a.name))
)

const attributeNameSelector = (_state, attributeName) => {
  return attributeName
}

export const legacyCustomCharacterAttributeByName = createSelector(
  characterCustomAttributesSelector,
  attributeNameSelector,
  (customAttributes, name) => {
    return customAttributes.find((attribute) => {
      return attribute.name === name
    })
  }
)
